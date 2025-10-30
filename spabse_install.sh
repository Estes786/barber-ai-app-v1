# Ganti <VERSI_TERBARU> dengan versi Supabase CLI saat ini (contoh: v1.157.0)
# Kamu bisa cek versi terbaru di halaman rilis GitHub Supabase CLI.

# Coba gunakan versi stabil terbaru:
LATEST_VERSION="v1.157.0"

# Unduh binary yang dikompilasi untuk Linux ARM64
curl -L https://github.com/supabase/cli/releases/download/$LATEST_VERSION/supabase_linux_arm64.tar.gz -o /tmp/supabase.tar.gz

# Ekstrak file
tar -zxvf /tmp/supabase.tar.gz -C /tmp

# Pindahkan binary ke direktori PATH Termux dan berikan izin eksekusi
mv /tmp/supabase $PREFIX/bin/supabase
chmod +x $PREFIX/bin/supabase

