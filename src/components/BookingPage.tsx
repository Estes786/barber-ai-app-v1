import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, Users, Star, Loader2 } from 'lucide-react';
import { supabase, Service, Technician } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookingPageProps {
  setMainStage: (stage: string) => void;
  setMessage: (message: string) => void;
  initialTechnician?: Technician | null;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  setMainStage,
  setMessage,
  initialTechnician,
}) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(
    initialTechnician || null
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, techniciansRes] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true),
        supabase.from('technicians').select('*, profile:profiles(*)'),
      ]);

      if (servicesRes.data) setServices(servicesRes.data);
      if (techniciansRes.data) setTechnicians(techniciansRes.data as any);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { weekday: 'long' });
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedTechnician || !selectedTime || !user) {
      setMessage('Harap lengkapi semua pilihan: Layanan, Teknisi, dan Waktu.');
      return;
    }

    setSubmitting(true);

    try {
      const bookingTime = new Date(`${selectedDate}T${selectedTime}:00`);

      const { error } = await supabase.from('bookings').insert({
        customer_id: user.id,
        technician_id: selectedTechnician.user_id,
        service_id: selectedService.id,
        booking_time: bookingTime.toISOString(),
        status: 'scheduled',
      });

      if (error) throw error;

      const dateDisplay = getDayName(selectedDate);
      setMessage(
        `Pemesanan berhasil! Anda pesan ${selectedService.name} dengan ${
          selectedTechnician.profile?.full_name || 'teknisi'
        } pada ${dateDisplay}, ${selectedTime}.`
      );
      setMainStage('generative');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setMessage('Gagal membuat pemesanan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <Calendar className="w-6 h-6 mr-2 text-red-500" /> Buat Janji Temu
      </h2>

      <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-blue-500">
        <p className="font-semibold text-lg mb-3 flex items-center text-blue-700">
          <Scissors className="w-5 h-5 mr-2" /> 1. Pilih Layanan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                selectedService?.id === service.id
                  ? 'bg-blue-50 border-blue-600 shadow-inner'
                  : 'bg-gray-50 border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedService(service)}
            >
              <p className="font-bold text-gray-800">{service.name}</p>
              <p className="text-sm text-gray-500">
                Rp {service.price.toLocaleString('id-ID')} ({service.duration_minutes}{' '}
                min)
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-yellow-500">
        <p className="font-semibold text-lg mb-3 flex items-center text-yellow-700">
          <Users className="w-5 h-5 mr-2" /> 2. Pilih Capster
        </p>
        <div className="grid grid-cols-2 gap-3">
          {technicians.map((tech) => (
            <div
              key={tech.user_id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition text-center ${
                selectedTechnician?.user_id === tech.user_id
                  ? 'bg-yellow-50 border-yellow-600 shadow-inner'
                  : 'bg-gray-50 border-gray-200 hover:border-yellow-300'
              }`}
              onClick={() => setSelectedTechnician(tech)}
            >
              <p className="font-bold text-gray-800 truncate">
                {tech.profile?.full_name || 'Teknisi'}
              </p>
              <p className="text-sm text-gray-500 flex items-center justify-center">
                <Star className="w-3 h-3 fill-yellow-400 mr-1" /> {tech.rating}
              </p>
              <p className="text-xs text-blue-500 mt-1">{tech.specialty}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedTechnician && (
        <div className="bg-white p-4 rounded-xl shadow-md border-t-4 border-green-500">
          <p className="font-semibold text-lg mb-3 flex items-center text-green-700">
            <Clock className="w-5 h-5 mr-2" /> 3. Pilih Waktu
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(null);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <p className="text-sm font-medium text-gray-700 mb-2">
            Slot Tersedia ({getDayName(selectedDate)}):
          </p>
          <div className="flex flex-wrap gap-3">
            {selectedTechnician.availability.map((time) => (
              <button
                key={time}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  selectedTime === time
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                }`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className="w-full p-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        onClick={handleBooking}
        disabled={
          !selectedService || !selectedTechnician || !selectedTime || submitting
        }
      >
        {submitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Konfirmasi Pemesanan (Rp{' '}
            {selectedService?.price.toLocaleString('id-ID') || '...'})
          </>
        )}
      </button>

      <button
        className="w-full p-3 text-blue-600 bg-blue-100 rounded-xl hover:bg-blue-200 transition"
        onClick={() => setMainStage('generative')}
      >
        Batal
      </button>
    </div>
  );
};
