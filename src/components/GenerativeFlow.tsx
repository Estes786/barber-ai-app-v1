import React, { useState, useCallback, useMemo } from 'react';
import {
  UploadCloud,
  Zap,
  Share2,
  Loader2,
  Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GenerativeFlowProps {
  setStage: (stage: string) => void;
  setMessage: (message: string) => void;
}

// *****************************************************************
// ** FUNGSI: Memanggil Serverless Function Vercel **
// *****************************************************************
const callGenerativeAI = async (
  imagePublicUrl: string,
  userId: string
): Promise<{ enhancedImage: string; captions: string[] }> => {
  // Panggilan ke Serverless Function di /api/generate-content
  const response = await fetch('/api/generate-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imagePublicUrl,
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(
      errorBody.error || `Gagal memanggil AI Function (Status: ${response.status})`
    );
  }

  const result = await response.json();

  if (!result.enhancedImage || !Array.isArray(result.captions)) {
    throw new Error('Respons AI tidak lengkap atau format salah.');
  }

  return {
    enhancedImage: result.enhancedImage,
    captions: result.captions,
  };
};
// *****************************************************************

export const GenerativeFlow: React.FC<GenerativeFlowProps> = ({
  setStage,
  setMessage,
}) => {
  const { user, profile } = useAuth();
  const [aiStage, setAiStage] = useState<'upload' | 'processing' | 'results'>(
    'upload'
  );
  const [rawImageURL, setRawImageURL] = useState<string | null>(null);
  const [enhancedImageURL, setEnhancedImageURL] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!user) {
        setMessage('Anda harus login untuk mengunggah foto.');
        return;
      }

      setLoading(true);
      setAiStage('processing');
      setMessage('Mengunggah foto ke storage...');

      try {
        // 1. Upload File ke Supabase Storage
        const filePath = `${user.id}/${Date.now()}_raw.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('portfolio_photos') // Pastikan nama bucket Anda benar
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // 2. Dapatkan URL Public
        const { data: publicUrlData } = supabase.storage
          .from('portfolio_photos')
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData.publicUrl;
        setRawImageURL(publicUrl);
        
        // 3. Panggil Fungsi AI Serverless/Edge Function
        setMessage('AI sedang memproses foto dan menghasilkan caption (via Hugging Face)...');
        
        const { enhancedImage, captions } = await callGenerativeAI(
          publicUrl,
          user.id
        );

        setEnhancedImageURL(enhancedImage);
        setGeneratedCaptions(captions);
        setAiStage('results');
        setMessage('Hasil AI siap! Pilih caption favorit Anda.');
      } catch (error: any) {
        console.error('Generative Flow Error:', error);
        setMessage(`Error pemrosesan: ${error.message}. Coba lagi.`);
        setAiStage('upload');
      } finally {
        setLoading(false);
      }
    },
    [user, setMessage]
  );

  const handleShare = useCallback(async () => {
    if (!profile || !rawImageURL || !enhancedImageURL || !selectedCaption) return;

    setMessage('Menyimpan hasil ke portofolio...');
    setLoading(true);

    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          technician_id: profile.id, 
          raw_image_url: rawImageURL,
          enhanced_image_url: enhancedImageURL,
          selected_caption: selectedCaption,
          ai_status: 'completed', 
        });

      if (error) throw error;

      setMessage('Berhasil! Foto telah ditambahkan ke portofolio Anda.');
      setLoading(false);
    } catch (error: any) {
      console.error('Error saving post:', error);
      setMessage(`Gagal menyimpan post: ${error.message}`);
      setLoading(false);
    }
  }, [profile, rawImageURL, enhancedImageURL, selectedCaption, setMessage]);

  const renderContent = useMemo(() => {
    if (!user || profile?.role !== 'technician') {
      return (
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <Zap className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Akses Terbatas</h2>
          <p className="text-gray-600 mt-2">
            Hanya pengguna dengan peran **Teknisi (Capster)** yang dapat mengakses fitur Generatif AI.
          </p>
        </div>
      );
    }
    
    switch (aiStage) {
      case 'upload':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Upload Foto Hasil Potong
            </h2>
            <div
              className={`border-4 border-dashed rounded-xl p-10 text-center transition ${
                loading ? 'opacity-50' : 'hover:border-blue-500'
              }`}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="font-semibold text-gray-600">
                Tarik & lepas atau{' '}
                <span className="text-blue-600">klik untuk memilih</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                (JPG atau PNG, maks 5MB)
              </p>
            </div>
            {loading && (
                <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
                    <span className="text-blue-700 font-medium">Sedang memproses...</span>
                </div>
            )}
          </div>
        );

      case 'processing':
        return (
          <div className="text-center p-12 space-y-4">
            <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">
              AI Sedang Bekerja...
            </h2>
            <p className="text-gray-600">
              {message || 'Memproses foto Anda untuk peningkatan kualitas dan caption generatif.'}
            </p>
            <p className="text-sm text-gray-400">
              Ini mungkin memakan waktu hingga 15-30 detik tergantung antrian Hugging Face.
            </p>
          </div>
        );

      case 'results':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              ✨ Hasil Generatif AI Siap!
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Kolom Kiri: Foto */}
              <div className="sm:w-1/2 space-y-4">
                <p className="text-sm font-semibold text-gray-600">
                  Foto Awal (Raw)
                </p>
                <img
                  src={rawImageURL || 'https://placehold.co/400x400/cccccc/000000?text=Raw+Image'}
                  alt="Raw"
                  className="w-full rounded-xl shadow-lg border border-gray-200 object-cover"
                />

                <p className="text-sm font-semibold text-blue-600 pt-4">
                  Foto Hasil Peningkatan AI
                </p>
                <img
                  src={enhancedImageURL || 'https://placehold.co/400x400/285d89/ffffff?text=AI+Enhanced'}
                  alt="Enhanced"
                  className="w-full rounded-xl shadow-2xl border-2 border-blue-400 object-cover"
                />
              </div>

              {/* Kolom Kanan: Caption */}
              <div className="sm:w-1/2">
                <p className="text-sm font-semibold text-gray-600 mb-3">
                  Pilih Caption Terbaik:
                </p>
                {generatedCaptions.map((caption, index) => (
                  <div
                    key={index}
                    className={`p-4 mb-3 border-2 rounded-xl cursor-pointer transition ${
                      selectedCaption === caption
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedCaption(caption)}
                  >
                    <p className="font-medium text-gray-800">{caption}</p>
                    {selectedCaption === caption && (
                      <div className="flex items-center text-blue-600 mt-2 text-sm font-semibold">
                        <Check className="w-4 h-4 mr-1" /> Dipilih
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-between space-x-4 pt-4 border-t border-gray-100">
              <button
                className="w-full flex items-center justify-center p-3 text-white bg-green-500 hover:bg-green-600 font-semibold rounded-xl shadow-md transition disabled:bg-gray-400"
                disabled={!selectedCaption || loading}
                onClick={handleShare}
              >
                {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <><Share2 className="w-5 h-5 mr-2" /> Simpan ke Portofolio</>
                )}
              </button>
              <button
                className="w-full p-3 text-blue-700 bg-blue-100 hover:bg-blue-200 font-semibold rounded-xl shadow-md transition"
                onClick={() => {
                  setAiStage('upload');
                  setRawImageURL(null);
                  setEnhancedImageURL(null);
                  setGeneratedCaptions([]);
                  setSelectedCaption('');
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
    user,
    loading
  ]);

  return <div className="p-4 sm:p-0">{renderContent}</div>;
};

