# 💈 Barber-AI App - AI-Powered Barbershop Management

> Aplikasi barbershop modern dengan AI enhancement & auto-posting untuk transformasi digital barbershop Anda!

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![React](https://img.shields.io/badge/React-18-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green)]()
[![AI Ready](https://img.shields.io/badge/AI-Ready-purple)]()

**Repository**: https://github.com/Estes786/barber-ai-app-v1.git

---

## 📖 Documentation

- 📄 **[Quick Summary](./README_SUMMARY.md)** - Ringkasan cepat project status
- 🎨 **[Architecture Diagram](./ARCHITECTURE_DIAGRAM.md)** - Visual architecture lengkap
- 🚀 **[Capstone Insights](./CAPSTONE_INSIGHTS_AND_RECOMMENDATIONS.md)** - Panduan implementasi lengkap

---

## ✨ Fitur Utama

### 🎨 1. AI Photo Enhancement (Coming Soon!)

- **Image Upscaling**: Tingkatkan resolusi foto 2x-4x dengan Real-ESRGAN
- **Face Restoration**: Perbaiki wajah customer otomatis dengan GFPGAN
- **Auto Caption**: Generate 3 varian caption siap pakai untuk media sosial
- **Before-After Preview**: Tampilkan perbandingan foto sebelum & sesudah enhancement
- **Portfolio Gallery**: Semua hasil AI tersimpan otomatis sebagai portofolio teknisi

### 📱 2. Auto-Post to Social Media (Coming Soon!)

- **Multi-Platform**: Post otomatis ke Instagram, Facebook, Twitter/X, LinkedIn
- **Smart Scheduling**: Jadwalkan posting untuk waktu optimal
- **Engagement Tracking**: Monitor likes, comments, shares dari satu dashboard
- **One-Click Publishing**: Satu klik untuk publish ke semua platform

### 📅 3. Sistem Booking

### 📅 3. Sistem Booking

- ⏰ Ketersediaan slot waktu real-time
- 👨‍🦰 Pilih teknisi favorit berdasarkan rating dan spesialisasi
- 💰 Pilih layanan dengan harga dan durasi yang jelas
- 📧 Notifikasi booking otomatis (Email/WhatsApp)

### 👥 4. Manajemen Multi-Role

- **Customer**: Booking layanan, lihat portofolio teknisi, berikan review
- **Technician**: Upload foto, kelola portofolio AI, terima booking, track earnings
- **Admin**: Kelola layanan, teknisi, dan analytics (coming soon)

### ⭐ 5. Profil Teknisi

- 📊 Rating dan review dari customer
- 💼 Spesialisasi dan bio profesional
- 🖼️ Galeri portofolio hasil AI enhancement
- 📈 Statistics & earnings tracking

---

## 🛠️ Teknologi Stack

### Frontend
- ⚛️ **React 18** - Modern UI framework
- 📘 **TypeScript** - Type-safe development
- ⚡ **Vite** - Lightning-fast build tool
- 🎨 **Tailwind CSS** - Utility-first styling
- 🎯 **Lucide React** - Beautiful icons

### Backend
- 🗄️ **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Storage untuk images
  - Real-time subscriptions
  - Edge Functions (serverless)

### AI Integration (Planned)
- 🤖 **Replicate API** - AI model hosting
  - Real-ESRGAN (image upscaling)
  - GFPGAN (face restoration)
  - BLIP (caption generation)
- 📱 **Ayrshare API** - Multi-platform social media posting

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
Extended user data untuk semua role
```sql
- id (uuid, references auth.users)
- full_name (text)
- role (customer | technician | admin)
- avatar_url (text)
- created_at (timestamp)
```

#### `technicians`
Detail spesifik teknisi
```sql
- user_id (uuid, references profiles)
- specialty (text)
- rating (numeric 0-5)
- bio (text)
- availability (jsonb)
```

#### `services`
Layanan barbershop
```sql
- id (uuid)
- name (text)
- duration_minutes (integer)
- price (numeric)
- is_active (boolean)
```

#### `bookings`
Appointment/janji temu
```sql
- id (uuid)
- customer_id (uuid)
- technician_id (uuid)
- service_id (uuid)
- booking_time (timestamp)
- status (scheduled | completed | canceled)
- notes (text)
```

#### `posts`
AI-generated portfolio content
```sql
- id (uuid)
- technician_id (uuid)
- customer_id (uuid)
- raw_image_url (text)
- enhanced_image_url (text)
- generated_captions (jsonb)
- selected_caption (text)
- ai_status (pending | processing | completed | failed)
- style_tags (text[])
```

#### `social_posts` (Planned)
Social media post tracking
```sql
- id (uuid)
- post_id (uuid, references posts)
- platform (instagram | facebook | twitter | linkedin)
- platform_post_id (text)
- platform_post_url (text)
- status (pending | posted | failed)
- engagement_data (jsonb)
```

### Storage Buckets

- **`posts`** - Menyimpan foto mentah dan hasil enhanced

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- npm atau yarn
- Supabase account

### Quick Start

1. **Clone repository**
```bash
git clone https://github.com/Estes786/barber-ai-app-v1.git
cd barber-ai-app-v1
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Setup Supabase database**

Database migrations sudah tersedia di `supabase/migrations/`. 
Run di Supabase SQL Editor atau dengan Supabase CLI.

5. **Run development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

7. **Preview production build**
```bash
npm run preview
```

---

## 📱 Cara Penggunaan

### Untuk Customer:

1. 📝 Daftar dengan email dan password (pilih role "Pelanggan")
2. 👀 Browse teknisi di tab "Capster"
3. 🖼️ Lihat portofolio dan rating teknisi
4. 📅 Booking layanan di tab "Booking"
5. ⭐ Berikan review setelah service selesai

### Untuk Technician:

1. 📝 Daftar dengan role "Teknisi (Capster)"
2. ✏️ Lengkapi profil (specialty, bio, foto)
3. 📸 Upload foto hasil potong rambut di tab "AI Content"
4. ⏳ Tunggu AI memproses foto (7-11 detik)
5. ✅ Review hasil enhancement & pilih caption terbaik
6. 🚀 Auto-post ke social media (Instagram, Facebook, Twitter)
7. 📊 Lihat engagement & analytics dari dashboard

---

## 🎯 Roadmap Development

### ✅ Phase 1: Core Features (Completed)
- [x] Authentication & multi-role system
- [x] Customer booking flow
- [x] Technician profile management
- [x] Database schema & migrations
- [x] Basic UI/UX with Tailwind

### 🔄 Phase 2: AI Integration (In Progress)
- [ ] Integrate Replicate API
- [ ] Real-ESRGAN image upscaling
- [ ] GFPGAN face restoration
- [ ] BLIP caption generation
- [ ] Before-after comparison UI

### 📅 Phase 3: Social Media (Planned)
- [ ] Integrate Ayrshare API
- [ ] Instagram posting
- [ ] Facebook posting
- [ ] Twitter/X posting
- [ ] Post scheduling
- [ ] Engagement analytics

### 🎨 Phase 4: Polish & Extras (Future)
- [ ] WhatsApp notifications
- [ ] Email notifications
- [ ] Customer reviews & ratings
- [ ] Admin dashboard
- [ ] Analytics & reports
- [ ] Payment integration
- [ ] PWA support
- [ ] Mobile app (React Native)

---

## 🔒 Security Features

- 🔐 **Row Level Security (RLS)** enabled di semua tables
- 🔑 **JWT-based authentication** dengan multi-role support
- 🛡️ **Secure storage bucket** dengan proper access policies
- 👤 **User isolation** - Users hanya bisa akses data mereka sendiri
- 🚫 **API key protection** - Tidak ada API key yang exposed di frontend
- ⚡ **Rate limiting** untuk prevent abuse
- 📝 **Input validation** untuk semua form

---

## 📱 Mobile-First Design

Aplikasi di-design dengan pendekatan mobile-first:

- 📱 Responsive layout untuk semua ukuran layar (mobile, tablet, desktop)
- 👆 Touch-friendly UI elements dengan proper spacing
- ⚡ Optimized performance untuk koneksi lambat
- 🎨 Clean & modern interface dengan Tailwind CSS
- 🖼️ Lazy loading untuk images
- 📦 Progressive Web App (PWA) ready

---

## 💰 Cost Estimation

### Development Phase (Testing)
- Replicate API: ~$0.50 - $5/month
- Ayrshare API: Free tier (25 posts)
- Supabase: Free tier
- Vercel: Free tier
- **Total**: ~$0.50 - $5/month

### Production Phase
- Replicate API: ~$2.50/month (500 photos)
- Ayrshare API: $14.99/month (Starter)
- Supabase Pro: $25/month
- Vercel Pro: $20/month (optional)
- **Total**: ~$63/month

### Scaling Phase (100+ customers/day)
- Replicate API: ~$15/month (3,000 photos)
- Ayrshare API: $49.99/month (Pro)
- Supabase: ~$50/month (with add-ons)
- Vercel Pro: $20/month
- **Total**: ~$135/month

---

## 🤝 Contributing

Proyek ini adalah capstone project. Contributions welcome!

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

Private project - All rights reserved

---

## 👨‍💻 Developer

**Barber-AI Team**
- Email: developer@barber-ai.app
- Repository: https://github.com/Estes786/barber-ai-app-v1

---

## 📚 Additional Resources

- 📖 [Supabase Documentation](https://supabase.com/docs)
- 🤖 [Replicate Documentation](https://replicate.com/docs)
- 📱 [Ayrshare Documentation](https://docs.ayrshare.com)
- ⚛️ [React Documentation](https://react.dev)
- 🎨 [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🙏 Acknowledgments

- Supabase team untuk platform backend yang powerful
- Replicate team untuk AI model hosting
- Ayrshare team untuk social media API
- Open source community untuk amazing tools & libraries

---

**⭐ Star project ini jika bermanfaat!**

**📧 Questions? Issues? Open an issue di GitHub!**

---

Last updated: January 13, 2026
