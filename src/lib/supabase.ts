import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'technician' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Technician {
  user_id: string;
  specialty: string;
  rating: number;
  bio: string;
  availability: string[];
  created_at: string;
  profile?: Profile;
}

export interface Service {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  technician_id: string;
  service_id: string;
  booking_time: string;
  status: 'scheduled' | 'completed' | 'canceled';
  notes: string;
  created_at: string;
}

export interface Post {
  id: string;
  technician_id: string;
  customer_id: string | null;
  booking_id: string | null;
  raw_image_url: string;
  enhanced_image_url: string;
  generated_captions: string[];
  selected_caption: string;
  ai_status: 'pending' | 'processing' | 'completed' | 'failed';
  style_tags: string[];
  created_at: string;
}
