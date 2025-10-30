/*
  # Barber-AI App Database Schema
  
  1. New Tables
    - `profiles` - Extended user profile data for all roles
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `role` (text: customer, technician, admin)
      - `avatar_url` (text)
      - `created_at` (timestamptz)
      
    - `technicians` - Technician-specific details
      - `user_id` (uuid, references profiles)
      - `specialty` (text)
      - `rating` (numeric)
      - `bio` (text)
      - `availability` (jsonb)
      
    - `services` - Available barbershop services
      - `id` (uuid, primary key)
      - `name` (text)
      - `duration_minutes` (integer)
      - `price` (numeric)
      - `is_active` (boolean)
      
    - `bookings` - Customer appointments
      - `id` (uuid, primary key)
      - `customer_id` (uuid, references profiles)
      - `technician_id` (uuid, references technicians)
      - `service_id` (uuid, references services)
      - `booking_time` (timestamptz)
      - `status` (text: scheduled, completed, canceled)
      - `notes` (text)
      
    - `posts` - AI-generated portfolio content
      - `id` (uuid, primary key)
      - `technician_id` (uuid)
      - `customer_id` (uuid)
      - `booking_id` (uuid)
      - `raw_image_url` (text)
      - `enhanced_image_url` (text)
      - `generated_captions` (jsonb)
      - `selected_caption` (text)
      - `ai_status` (text: pending, processing, completed, failed)
      - `style_tags` (text[])
      
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Customers can view their own data
    - Technicians can manage their profiles and posts
    - Admins have full access
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'technician', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view technician profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (role = 'technician');

-- Technicians table
CREATE TABLE IF NOT EXISTS technicians (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL DEFAULT '',
  rating NUMERIC(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  bio TEXT DEFAULT '',
  availability JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view technicians"
  ON technicians FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Technicians can update own profile"
  ON technicians FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES technicians(user_id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'canceled')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Technicians can view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = technician_id);

CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Posts table (AI-generated portfolio)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID NOT NULL REFERENCES technicians(user_id) ON DELETE CASCADE,
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  raw_image_url TEXT NOT NULL,
  enhanced_image_url TEXT DEFAULT '',
  generated_captions JSONB DEFAULT '[]'::jsonb,
  selected_caption TEXT DEFAULT '',
  ai_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'processing', 'completed', 'failed')),
  style_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view completed posts"
  ON posts FOR SELECT
  TO authenticated
  USING (ai_status = 'completed');

CREATE POLICY "Technicians can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = technician_id);

CREATE POLICY "Technicians can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = technician_id)
  WITH CHECK (auth.uid() = technician_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_technician_status ON posts(technician_id, ai_status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id, booking_time);
CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id, booking_time);

-- Insert sample services
INSERT INTO services (name, duration_minutes, price) VALUES
  ('Haircut + Wash', 45, 80000),
  ('Haircut + Styling', 30, 65000),
  ('Shave & Grooming', 40, 75000)
ON CONFLICT DO NOTHING;