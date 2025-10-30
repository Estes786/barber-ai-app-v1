import React, { useEffect, useState } from 'react';
import { User, Briefcase, Star, Loader2 } from 'lucide-react';
import { supabase, Technician, Post } from '../lib/supabase';

interface TechnicianProfileProps {
  technician: Technician;
  setMainStage: (stage: string) => void;
  setTechnician: (tech: Technician) => void;
}

export const TechnicianProfile: React.FC<TechnicianProfileProps> = ({
  technician,
  setMainStage,
  setTechnician,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [technician]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('technician_id', technician.user_id)
        .eq('ai_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-md">
        <User className="w-16 h-16 text-blue-500 p-2 border-2 border-blue-300 rounded-full flex-shrink-0" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {technician.profile?.full_name || 'Teknisi'}
          </h2>
          <p className="text-lg text-blue-600 font-semibold flex items-center">
            <Briefcase className="w-4 h-4 mr-1" /> {technician.specialty}
          </p>
          <div className="flex items-center mt-1 text-yellow-500">
            <Star className="w-4 h-4 fill-yellow-400" />
            <span className="ml-1 font-medium">{technician.rating}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          Tentang {technician.profile?.full_name?.split(' ')[0] || 'Teknisi'}
        </h3>
        <p className="text-gray-600 italic border-l-4 border-blue-400 pl-3">
          {technician.bio || 'Teknisi profesional dengan pengalaman bertahun-tahun.'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Portofolio AI (Hasil Terbaik)
        </h3>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Belum ada portofolio tersedia.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="rounded-lg overflow-hidden shadow-lg border border-gray-100 transform hover:scale-[1.02] transition duration-300"
              >
                <img
                  src={post.enhanced_image_url || post.raw_image_url}
                  alt="Portfolio"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://placehold.co/400x400/38a169/ffffff?text=Portfolio+Image';
                  }}
                />
                <div className="p-3 bg-gray-50">
                  <p className="text-xs text-gray-500 italic truncate">
                    {post.selected_caption || 'Hasil karya terbaik'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        className="w-full p-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
        onClick={() => {
          setMainStage('booking');
          setTechnician(technician);
        }}
      >
        Pesan Sekarang dengan{' '}
        {technician.profile?.full_name?.split(' ')[0] || 'Teknisi'}
      </button>
    </div>
  );
};
