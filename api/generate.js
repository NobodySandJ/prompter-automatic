// File: /api/generate.js (Versi Revisi yang BENAR dan AMAN)

// Gunakan 'require' untuk 'fetch' jika environment Node.js Anda membutuhkannya.
// Namun untuk Vercel, 'fetch' global biasanya sudah tersedia.
// const fetch = require('node-fetch'); 

module.exports = async (req, res) => {
  // Hanya izinkan metode POST untuk keamanan
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { prompt, isJson } = req.body;
    
    // 1. CARA MEMANGGIL API KEY YANG BENAR DAN AMAN
    // Kode ini mengambil nilai dari Environment Variable bernama 'GEMINI_API_KEY' yang Anda atur di Vercel.
    const apiKey = process.env.GEMINI_API_KEY;

    // 2. VALIDASI PENTING
    if (!apiKey) {
      console.error("GEMINI_API_KEY tidak diatur di Vercel Environment Variables.");
      // Jangan bocorkan detail error ke pengguna
      return res.status(500).json({ message: "Konfigurasi server tidak lengkap." });
    }
    
    if (!prompt) {
        return res.status(400).json({ message: 'Input prompt tidak boleh kosong.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    
    if (isJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    // Panggil Google API dari sisi server
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Ambil data JSON dari respons Google
    const responseData = await apiResponse.json();

    // Jika respons dari Google tidak OK (misal: API key salah, input ditolak, dll)
    if (!apiResponse.ok) {
      console.error("Error dari Google API:", responseData);
      // Kirim pesan error yang lebih informatif dari Google ke frontend (jika ada)
      const errorMessage = responseData?.error?.message || `HTTP error! Status: ${apiResponse.status}`;
      return res.status(apiResponse.status).json({ message: errorMessage });
    }
    
    // Kirim kembali hasil yang sukses ke frontend
    res.status(200).json(responseData);

  } catch (error) {
    console.error("Error di dalam serverless function:", error);
    res.status(500).json({ message: "Terjadi kesalahan internal pada server." });
  }
};
