import fetch from 'node-fetch'; // Vercel mendukung fetch bawaan

// Ambil token dari Environment Variable Vercel (HF_API_TOKEN)
const HF_TOKEN = process.env.HF_API_TOKEN;

// Model Image-to-Text (untuk Caption Generation) yang sering GRATIS di HF
const CAPTION_MODEL = 'Salesforce/blip-image-captioning-base'; 

// Model Image-to-Image (untuk Enhancement/Style Transfer) - Digunakan untuk simulasi enhancement
// *Catatan: Image-to-Image Inference API seringkali lambat atau berbayar, jadi kita simulasikan untuk sementara*

export default async (req, res) => {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // Cek Environment Variable Hugging Face
  if (!HF_TOKEN) {
      return res.status(500).json({ 
          error: "HF_API_TOKEN hilang! Pastikan variabel ini ada di Vercel Environment Variables." 
      });
  }

  const { image_url } = req.body;

  if (!image_url) {
      return res.status(400).json({ error: "image_url diperlukan di body request." });
  }

  try {
      // 1. PANGGIL HUGGING FACE INFERENCE API (Caption Generation)
      const captionResponse = await fetch(
          `https://api-inference.huggingface.co/models/${CAPTION_MODEL}`,
          {
              headers: { 
                  Authorization: `Bearer ${HF_TOKEN}`,
                  'Content-Type': 'application/json' 
              },
              method: 'POST',
              // Diperlukan payload JSON dengan URL gambar
              body: JSON.stringify({ inputs: image_url }),
          }
      );

      if (!captionResponse.ok) {
          const apiError = await captionResponse.json();
          throw new Error(`HF Caption API gagal: ${apiError.error || captionResponse.statusText}`);
      }
      
      const captionResult = await captionResponse.json();
      
      // Ambil teks caption pertama
      const generatedCaption = captionResult[0]?.generated_text || "Potongan keren dan bergaya maksimal!";

      // 2. SIMULASI Image Enhancement
      // Karena Image-to-Image sering kompleks/lambat, kita ganti URL gambarnya agar terlihat 'enhanced'
      const enhancedUrl = image_url.replace('http:', 'https:').replace('placehold', 'placehold.co/600x600/38a169/ffffff?text=AI+Enhanced+HF');
      
      // Kirim respons sukses ke frontend
      res.status(200).json({
          enhancedImage: enhancedUrl,
          // Berikan 3 varian caption
          captions: [
              generatedCaption.charAt(0).toUpperCase() + generatedCaption.slice(1), // Kapitalisasi awal
              `Varian 1: ${generatedCaption}. Potongan ini luar biasa!`, 
              'Varian 2: Gaya yang baru, kepercayaan diri yang maksimal. Hasil terbaik!', 
          ], 
      });

  } catch (error) {
      console.error('Serverless Function Error:', error);
      res.status(500).json({ error: error.message || "Internal Server Error saat memanggil Hugging Face." });
  }
};

