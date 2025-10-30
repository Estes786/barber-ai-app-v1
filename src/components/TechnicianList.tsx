import React, { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { supabase, Technician } from '../lib/supabase';

interface TechnicianListProps {
  setMainStage: (stage: string) => void;
  setSelectedTechnician: (tech: Technician) => void;
}

export const TechnicianList: React.FC<TechnicianListProps> = ({
  setMainStage,
  setSelectedTechnician,
}) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('*, profile:profiles(*)');

      if (error) throw error;
      setTechnicians((data as any) || []);
    } catch (error) {
      console.error('Error loading technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Daftar Capster Kami</h2>
      {technicians.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Belum ada teknisi terdaftar. Daftar sebagai teknisi untuk memulai!
        </p>
      ) : (
        technicians.map((tech) => (
          <div
            key={tech.user_id}
            className="p-4 bg-white rounded-xl shadow-md flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
            onClick={() => {
              setMainStage('technician_profile');
              setSelectedTechnician(tech);
            }}
          >
            <div>
              <p className="font-bold text-lg text-blue-700">
                {tech.profile?.full_name || 'Teknisi'}
              </p>
              <p className="text-sm text-gray-500">{tech.specialty}</p>
            </div>
            <div className="flex items-center text-yellow-500 font-semibold">
              <Star className="w-4 h-4 fill-yellow-400 mr-1" />
              {tech.rating}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
