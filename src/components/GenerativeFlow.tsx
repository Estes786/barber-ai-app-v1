import React, { useState, useCallback, useMemo } from 'react';
import {
  UploadCloud,
  Zap,
  Share2,
  CornerDownRight,
  ThumbsUp,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GenerativeFlowProps {
  setStage: (stage: string) => void;
  setMessage: (message: string) => void;
}

const simulateAIGeneration = (rawImage: string) => {
  return new Promise<{ enhancedImage: string; captions: string[] }>((resolve) => {
    setTimeout(() => {
      const enhancedImage = rawImage.replace(
        'placehold',
        'placehold.co/600x600/285d89/ffffff?text=AI+Enhanced+Style'
      );
      const captions = [
        'Fresh cut, who dis? Potongan rambut baru ini siap bikin kamu jadi sorotan!',
        'The transformation is complete. Detail presisi, gaya maksimal. Cek portofolio kami!',
        'Level up your look! Gaya ini dijamin menaikkan kepercayaan diri 100%. Apa caption pilihanmu?',
      ];

      resolve({
        enhancedImage,
        captions,
      });
    }, 3000);
  });
};

export const GenerativeFlow: React.FC<GenerativeFlowProps> = ({
  setStage,
  setMessage,
}) => {
  const { user, profile } = useAuth();
  const [aiStage, setAiStage] = useState<'upload' | 'processing' | 'result'>(
    'upload'
  );
  const [rawImageURL, setRawImageURL] = useState<string | null>(null);
  const [enhancedImageURL, setEnhancedImageURL] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [selectedCaption, setSelectedCaption] = useState('');
  const [postId, setPostId] = useState<string | null>(null);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user || profile?.role !== 'technician') {
        setMessage('Hanya teknisi yang dapat mengunggah foto.');
        return;
      }

      try {
        setAiStage('processing');
        setMessage('Foto sedang diunggah...');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `raw_photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from('posts').getPublicUrl(filePath);

        setRawImageURL(publicUrl);

        const { data: post, error: postError } = await supabase
          .from('posts')
          .insert({
            technician_id: user.id,
            raw_image_url: publicUrl,
            ai_status: 'processing',
          })
          .select()
          .single();

        if (postError) throw postError;
        setPostId(post.id);

        setMessage('Foto berhasil diunggah. Memulai pemrosesan AI...');
        await processAI(publicUrl, post.id);
      } catch (error: any) {
        console.error('Error uploading file:', error);
        setMessage('Gagal mengunggah foto. Silakan coba lagi.');
        setAiStage('upload');
      }
    },
    [user, profile, setMessage]
  );

  const processAI = useCallback(
    async (imageUrl: string, postId: string) => {
      try {
        const result = await simulateAIGeneration(imageUrl);

        const { error } = await supabase
          .from('posts')
          .update({
            enhanced_image_url: result.enhancedImage,
            generated_captions: result.captions,
            ai_status: 'completed',
          })
          .eq('id', postId);

        if (error) throw error;

        setEnhancedImageURL(result.enhancedImage);
        setGeneratedCaptions(result.captions);
        setAiStage('result');
        setMessage('Pemrosesan AI Selesai! Foto dan Caption siap dibagikan.');
      } catch (error) {
        console.error('Gagal memproses AI:', error);
        setMessage('Gagal memproses AI. Silakan coba lagi.');
        setAiStage('upload');

        if (postId) {
          await supabase
            .from('posts')
            .update({ ai_status: 'failed' })
            .eq('id', postId);
        }
      }
    },
    [setMessage]
  );

  const handleShare = async () => {
    if (!postId || !selectedCaption) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ selected_caption: selectedCaption })
        .eq('id', postId);

      if (error) throw error;

      setMessage('Foto dan Caption berhasil disimpan ke portofolio!');
    } catch (error) {
      console.error('Error saving caption:', error);
      setMessage('Gagal menyimpan caption.');
    }
  };

  const renderContent = useMemo(() => {
    if (profile?.role !== 'technician') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl h-64">
          <p className="text-lg text-gray-600 text-center">
            Fitur AI Content hanya tersedia untuk teknisi.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Silakan booking layanan untuk melihat hasil karya teknisi kami.
          </p>
        </div>
      );
    }

    switch (aiStage) {
      case 'upload':
        return (
          <div
            className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-blue-400 text-blue-700 bg-blue-50 hover:bg-blue-100 transition duration-300 rounded-2xl cursor-pointer w-full h-64"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <UploadCloud className="w-12 h-12 mb-3" />
            <p className="text-lg font-semibold">
              Ketuk untuk Unggah Foto Hasil Potong
            </p>
            <p className="text-sm text-blue-500 mt-1">
              Gunakan fitur AI untuk hasil konten terbaik.
            </p>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 text-gray-700 rounded-2xl w-full h-64 shadow-inner">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-xl font-bold">AI Sedang Bekerja Keras...</h3>
            <p className="text-sm text-gray-500 mt-2">
              Peningkatan gambar dan generasi caption.
            </p>
            {rawImageURL && (
              <img
                src={rawImageURL}
                alt="Foto Mentah"
                className="mt-4 w-20 h-20 object-cover rounded-lg border-2 border-red-500"
              />
            )}
          </div>
        );
      case 'result':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-yellow-500 fill-yellow-200" />{' '}
              Hasil Generatif AI
            </h3>
            <div className="relative bg-gray-200 rounded-xl overflow-hidden shadow-lg">
              <img
                src={enhancedImageURL || ''}
                alt="Foto Hasil AI"
                className="w-full h-auto max-h-96 object-cover"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    'https://placehold.co/600x600/374151/ffffff?text=Image+Load+Error';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-lg font-medium">
                  {selectedCaption || 'Pilih salah satu caption di bawah...'}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 space-y-3">
              <p className="text-sm font-semibold text-blue-600">
                Pilih Caption Terbaik:
              </p>
              {generatedCaptions.map((caption, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex items-start cursor-pointer transition ${
                    selectedCaption === caption
                      ? 'bg-blue-100 border-2 border-blue-500 shadow-sm'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCaption(caption)}
                >
                  <CornerDownRight
                    className={`w-4 h-4 mt-1 mr-2 flex-shrink-0 ${
                      selectedCaption === caption
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    {caption}
                  </span>
                  {selectedCaption === caption && (
                    <ThumbsUp className="w-4 h-4 ml-auto text-green-500 flex-shrink-0" />
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
