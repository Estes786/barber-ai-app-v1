# Barber-AI App

Aplikasi barbershop generatif yang menggunakan AI untuk mengubah foto hasil potong rambut menjadi konten digital yang siap dibagikan.

## Fitur Utama

### 1. Fitur Generatif AI

- **Upload & Enhancement**: Upload foto hasil potong rambut dan AI akan meningkatkan kualitasnya
- **Caption Generation**: AI membuat 3 varian caption siap pakai untuk media sosial
- **Portfolio Gallery**: Semua hasil AI tersimpan otomatis sebagai portofolio teknisi

### 2. Sistem Booking

- Lihat ketersediaan slot waktu real-time
- Pilih teknisi favorit berdasarkan rating dan spesialisasi
- Pilih layanan dengan harga dan durasi yang jelas

### 3. Manajemen Multi-Role

- **Customer**: Booking layanan dan lihat portofolio teknisi
- **Technician**: Upload foto, kelola portofolio AI, terima booking
- **Admin**: Kelola layanan dan teknisi (coming soon)

### 4. Profil Teknisi

- Rating dan review
- Spesialisasi dan bio
- Galeri portofolio hasil AI

## Teknologi Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Realtime)
- **Icons**: Lucide React
- **AI Integration**: Ready for Hugging Face API integration

## Struktur Database

### Tables

- `profiles` - Extended user data untuk semua role
- `technicians` - Detail spesifik teknisi (specialty, rating, bio)
- `services` - Layanan yang ditawarkan (haircut, shave, dll)
- `bookings` - Appointment/janji temu
- `posts` - Hasil foto dan caption AI-generated

### Storage

- `posts` bucket - Menyimpan foto mentah dan hasil enhanced

## Setup & Installation

1. Clone repository
2. Install dependencies:

```bash
npm install
```

3. Setup environment variables di `.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Database sudah di-setup otomatis dengan migrations

5. Run development server:

```bash
npm run dev
```

6. Build for production:

```bash
npm run build
```

## Cara Penggunaan

### Untuk Customer:

1. Daftar dengan email dan password (pilih role "Pelanggan")
2. Browse teknisi di tab "Capster"
3. Lihat portofolio dan rating teknisi
4. Booking layanan di tab "Booking"

### Untuk Technician:

1. Daftar dengan role "Teknisi (Capster)"
2. Upload foto hasil potong rambut di tab "AI Content"
3. Tunggu AI memproses foto (3-10 detik)
4. Pilih caption terbaik dan simpan ke portofolio
5. Portofolio akan tampil di profil Anda

## Integrasi AI (Future Enhancement)

Aplikasi ini sudah siap untuk integrasi dengan Hugging Face API:

1. **Image Enhancement**: Model Image-to-Image untuk meningkatkan kualitas foto
2. **Caption Generation**: Model BLIP/ViT-GPT2 untuk generate caption otomatis
3. **Style Transfer**: Filter gaya instan (Cinematic, Vaporwave, dll)

Untuk mengaktifkan fitur AI sungguhan, implementasikan Edge Function di Supabase yang memanggil Hugging Face Inference Endpoint.

## Security Features

- Row Level Security (RLS) enabled di semua tables
- Authentication dengan multi-role support
- Secure storage bucket dengan proper policies
- Users hanya bisa akses data mereka sendiri

## Mobile-First Design

Aplikasi di-design dengan pendekatan mobile-first:

- Responsive layout untuk semua ukuran layar
- Touch-friendly UI elements
- Optimized untuk penggunaan di lapangan

## License

Private project - All rights reserved
