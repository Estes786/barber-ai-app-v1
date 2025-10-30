import React, { useState, useMemo } from 'react';
import { Zap, Calendar, Users, Scissors, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { GenerativeFlow } from './components/GenerativeFlow';
import { BookingPage } from './components/BookingPage';
import { TechnicianList } from './components/TechnicianList';
import { TechnicianProfile } from './components/TechnicianProfile';
import { Technician } from './lib/supabase';

type MainStage = 'generative' | 'booking' | 'technician_list' | 'technician_profile';

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, active, onClick }) => (
  <button
    className={`flex flex-col items-center p-2 rounded-full transition duration-300 ${
      active
        ? 'bg-blue-500 text-white shadow-md'
        : 'text-gray-500 hover:text-blue-500'
    }`}
    onClick={onClick}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium hidden sm:block mt-1">{label}</span>
  </button>
);

const AppContent: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const [mainStage, setMainStage] = useState<MainStage>('generative');
  const [message, setMessage] = useState('Selamat datang di Barber-AI App!');
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderMainContent = useMemo(() => {
    switch (mainStage) {
      case 'booking':
        return (
          <BookingPage
            setMainStage={setMainStage}
            setMessage={setMessage}
            initialTechnician={selectedTechnician}
          />
        );
      case 'technician_list':
        return (
          <TechnicianList
            setMainStage={setMainStage}
            setSelectedTechnician={setSelectedTechnician}
          />
        );
      case 'technician_profile':
        if (!selectedTechnician) {
          setMainStage('technician_list');
          return null;
        }
        return (
          <TechnicianProfile
            technician={selectedTechnician}
            setMainStage={setMainStage}
            setTechnician={setSelectedTechnician}
          />
        );
      case 'generative':
      default:
        return <GenerativeFlow setStage={setMainStage} setMessage={setMessage} />;
    }
  }, [mainStage, selectedTechnician]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-6 relative">
          <h1 className="text-4xl font-extrabold text-blue-700 flex items-center justify-center">
            <Scissors className="w-8 h-8 mr-2 text-blue-500 rotate-90" /> Barber-AI
            App
          </h1>
          {user && (
            <div className="absolute top-0 right-0 flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </header>

        <nav className="flex justify-around mb-6 p-2 bg-white rounded-full shadow-lg sticky top-4 z-10">
          <NavItem
            icon={Zap}
            label="AI Content"
            active={mainStage === 'generative'}
            onClick={() => setMainStage('generative')}
          />
          <NavItem
            icon={Calendar}
            label="Booking"
            active={mainStage === 'booking'}
            onClick={() => setMainStage('booking')}
          />
          <NavItem
            icon={Users}
            label="Capster"
            active={
              mainStage === 'technician_list' || mainStage === 'technician_profile'
            }
            onClick={() => setMainStage('technician_list')}
          />
        </nav>

        {message && (
          <div className="mt-6 mb-6 p-4 rounded-xl text-center shadow-lg bg-yellow-100 text-yellow-700">
            <p className="font-medium">{message}</p>
          </div>
        )}

        <main className="p-6 sm:p-8 rounded-3xl shadow-2xl bg-white border border-gray-200 min-h-[500px]">
          {renderMainContent}
        </main>

        <footer className="text-center mt-10 text-sm text-gray-400">
          Aplikasi Generatif Barbershop | Prototype Integrasi AI & Booking
        </footer>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
};

const AppWrapper: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <AppContent />;
};

export default App;
