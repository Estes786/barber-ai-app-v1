import React, { useState, useCallback, useMemo } from 'react';
import {
  UploadCloud,
  Zap,
  Share2,
  CornerDownRight,
  ThumbsUp,
  Loader2,
  CheckCircle, // Ditambahkan untuk stage success
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GenerativeFlowProps {
  setStage: (stage: string) => void;
  setMessage: (message: string) => void;
}

type AiStage = 'upload' | 'processing' | 'result';

// 🛑 FUNGSI BARU untuk memanggil Edge Function Supabase
const generateAIContent = async (
  imageUrl: string
): Promise<{ enhancedImage: string; captions: string[] }> => {
  
  // GANTI [YOUR_PROJECT_REF] dengan Reference ID proyek Supabase Anda
  const SUPABASE_FUNCTION_URL = `https://[cahipxexpxgxvyydzdmy.supabase.co/functions/v1/dynamic-task`;
  
  // Ambil token otorisasi dari sesi user yang sedang aktif
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('User not authenticated. Cannot call Edge Function.');
  }

  const response = await fetch(SUPABASE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Mengirim JWT untuk otorisasi Edge Function
      Authorization: `Bearer ${session.access_token}`, 
    },
    // Kirim URL gambar publik dari Supabase Storage ke Edge Function
    body: JSON.stringify({ imageUrl }), 
  });

  if (!response.ok) {
    // Mencoba membaca body error jika ada
    const errorBody = await response.json().catch(() => ({ 
        error: `Edge Function failed with status ${response.status}` 
    }));
    console.error('Edge Function Error:', errorBody);
    throw new Error(`Gagal memproses AI: ${errorBody.error || 'Unknown error'}`);
  }

  // Edge Function mengembalikan { enhancedImage: string, captions: string[] }
  return response.json();
};
// 🛑 Fungsi simulateAIGeneration yang lama DIHAPUS

export const GenerativeFlow: React.FC<GenerativeFlowProps> = ({
  setStage,
  setMessage,
}) => {
  const { user, profile } = useAuth();
  const [aiStage, setAiStage] = useState<AiStage>('upload');
  const [rawImageURL, setRawImageURL] = useState<string | null>(null);
  const [enhancedImageURL, setEnhancedImageURL] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string>('');
  const [postId, setPostId] = useState<string | null>(null);

  // Fungsi untuk mengupload foto dan memanggil AI
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!user || profile?.role !== 'technician') {
        setMessage('Hanya teknisi yang dapat mengunggah konten generatif.');
        return;
      }
      if (!event.target.files || event.target.files.length === 0) return;

      setAiStage('processing');
      setMessage('Mengunggah foto dan memproses AI. Mohon tunggu...');
      const file = event.target.files[0];
      const fileName = `${user.id}/${Date.now()}-${file.name}`;

      try {
        // 1. Upload ke Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Dapatkan URL publik untuk dikirim ke Edge Function
        const { data: publicURLData } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);
          
        const publicURL = publicURLData.publicUrl;
        setRawImageURL(publicURL);

        // 3. Panggil Edge Function untuk AI Generation
        // Ganti simulasi dengan fungsi generateAIContent yang baru
        const aiResult = await generateAIContent(publicURL);

        setEnhancedImageURL(aiResult.enhancedImage);
        setGeneratedCaptions(aiResult.captions);

        // 4. Simpan hasil awal (tanpa caption final) ke database 'posts'
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .insert({
            technician_id: user.id,
            raw_image_url: publicURL,
            enhanced_image_url: aiResult.enhancedImage,
            ai_status: 'generated',
            generated_captions: aiResult.captions, // Simpan semua opsi caption
          })
          .select()
          .single();

        if (postError) throw postError;

        setPostId(postData.id);
        setAiStage('result');
        setMessage('Pemrosesan AI Selesai! Pilih caption terbaik Anda.');

      } catch (error: any) {
        console.error('Generative Flow Error:', error);
        setMessage(`Error: ${error.message || 'Gagal memproses. Coba lagi.'}`);
        setAiStage('upload'); // Kembali ke tahap upload
        setRawImageURL(null);
      }
    },
    [user, profile, setMessage]
  );

  // Fungsi untuk menyimpan caption yang dipilih
  const handleShare = useCallback(async () => {
    if (!postId || !selectedCaption) return;

    setMessage('Menyimpan ke portofolio...');

    try {
      // Update post dengan caption yang dipilih dan status 'completed'
      const { error } = await supabase
        .from('posts')
        .update({
          selected_caption: selectedCaption,
          ai_status: 'completed',
        })
        .eq('id', postId);

      if (error) throw error;

      setMessage('Berhasil disimpan! Portofolio Anda telah diperbarui. ✨');
      // Pindah ke tampilan profil teknisi (jika ada) atau tetap di sini
      setAiStage('upload'); 
      setRawImageURL(null);
      setEnhancedImageURL(null);
      setGeneratedCaptions([]);
      setSelectedCaption('');
      setPostId(null);
      
    } catch (error: any) {
      console.error('Share Error:', error);
      setMessage(`Gagal menyimpan: ${error.message}`);
    }
  }, [postId, selectedCaption, setMessage]);


  const renderContent = useMemo(() => {
    if (!user || profile?.role !== 'technician') {
      return (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-lg font-bold text-red-600 mb-2">Akses Ditolak</p>
          <p className="text-sm text-gray-700">
            Hanya pengguna dengan peran **Teknisi (Capster)** yang dapat mengakses
            fitur Generatif AI ini. Silakan daftar/masuk sebagai Teknisi.
          </p>
        </div>
      );
    }

    switch (aiStage) {
      case 'upload':
        return (
          <div className="text-center p-8 border-4 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 transition cursor-pointer">
            <label htmlFor="file-upload" className="block cursor-pointer">
              <UploadCloud className="w-12 h-12 mx-auto text-gray-500 mb-3" />
              <p className="font-semibold text-lg text-gray-800">
                Unggah Foto Hasil Potongan
              </p>
              <p className="text-sm text-gray-500">
                AI akan memproses dan membuatkan caption terbaik.
              </p>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        );

      case 'processing':
        return (
          <div className="text-center p-8">
            <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Memproses Konten Generatif...
            </h2>
            <p className="text-gray-600">
              Ini mungkin memakan waktu 5-10 detik. Jangan tutup halaman.
            </p>
            {rawImageURL && (
                <div className="mt-6">
                    <img src={rawImageURL} alt="Raw Upload" className="w-full max-w-sm mx-auto rounded-xl shadow-lg border border-gray-200 opacity-60" />
                </div>
            )}
          </div>
        );

      case 'result':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-blue-700 flex items-center">
              <Zap className="w-6 h-6 mr-2 fill-blue-500 text-white" />
              Hasil Generatif AI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
                <p className="font-semibold mb-2 text-gray-700">
                  Foto Hasil Potong
                </p>
                {rawImageURL && (
                  <img
                    src={rawImageURL}
                    alt="Raw Image"
                    className="w-full rounded-lg object-cover aspect-square"
                  />
                )}
              </div>
              <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-200">
                <p className="font-semibold mb-2 text-blue-700 flex items-center">
                  <CornerDownRight className='w-4 h-4 mr-1' /> Foto AI Enhanced
                </p>
                {enhancedImageURL && (
                  <img
                    src={enhancedImageURL}
                    alt="Enhanced Image"
                    className="w-full rounded-lg object-cover aspect-square"
                    onError={(e) => {
                        e.currentTarget.src = rawImageURL || ''; // Fallback ke raw
                    }}
                  />
                )}
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 pt-4">
              Pilih Caption Terbaik
            </h3>
            <div className="space-y-3">
              {generatedCaptions.map((caption, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex justify-between items-center ${
                    selectedCaption === caption
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCaption(caption)}
                >
                  <p className="text-gray-700 text-sm font-medium pr-4">
                    {caption}
                  </p>
                  {selectedCaption === caption && (
                    <ThumbsUp className="w-5 h-5 text-green-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between space-x-4 pt-2">
              <button
                className="w-full flex items-center justify-center p-3 text-white bg-green-500 hover:bg-green-600 font-semibold rounded-xl shadow-md transition disabled:bg-gray-400"
                disabled={!selectedCaption}
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" /> Simpan ke Portofolio
              </button>
              <button
                className="w-full p-3 text-blue-700 bg-blue-100 hover:bg-blue-200 font-semibold rounded-xl shadow-md transition"
                onClick={() => {
                  setAiStage('upload');
                  setRawImageURL(null);
                  setEnhancedImageURL(null);
                  setGeneratedCaptions([]);
                  setSelectedCaption('');
                  setPostId(null);
                  setMessage('Siap untuk foto hasil potong berikutnya.');
                }}
              >
                Potong Baru
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [
    aiStage,
    rawImageURL,
    enhancedImageURL,
    generatedCaptions,
    selectedCaption,
    profile,
    handleFileUpload,
    handleShare,
    setMessage,
  ]);

  return <div className="p-4 sm:p-0">{renderContent}</div>;
};

