// File: /api/generate.js (Versi Revisi untuk OpenAI)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Input dari frontend tetap sama
    const { prompt, isJson } = req.body;

    // 1. Mengambil API Key yang berbeda dari Vercel
    const apiKey = process.env.OPENAI_API_KEY; 

    if (!apiKey) {
      console.error("OPENAI_API_KEY tidak diatur.");
      return res.status(500).json({ message: "Konfigurasi server tidak lengkap." });
    }
    
    if (!prompt) {
      return res.status(400).json({ message: 'Input prompt tidak boleh kosong.' });
    }

    // 2. Menggunakan URL Endpoint OpenAI
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    // 3. Membuat Payload dengan format yang sesuai untuk OpenAI
    const payload = {
      model: "gpt-4o", // Memilih model AI yang ingin dipakai
      messages: [{ "role": "user", "content": prompt }],
    };

    // Jika ingin response dalam format JSON (bisa disesuaikan)
    if (isJson) {
      payload.response_format = { "type": "json_object" };
    }

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // OpenAI menggunakan format otorisasi "Bearer"
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify(payload),
    });

    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Error dari OpenAI API:", responseData);
      const errorMessage = responseData?.error?.message || `HTTP error! Status: ${apiResponse.status}`;
      return res.status(apiResponse.status).json({ message: errorMessage });
    }
    
    // 4. Mengambil hasil dari struktur response OpenAI
    const resultText = responseData.choices[0].message.content;

    // Mengemas ulang agar format output sama seperti sebelumnya
    // Ini agar frontend tidak perlu diubah
    const finalResponse = {
        candidates: [{
            content: {
                parts: [{
                    text: resultText
                }]
            }
        }]
    };
    
    res.status(200).json(finalResponse);

  } catch (error) {
    console.error("Error di dalam serverless function:", error);
    res.status(500).json({ message: "Terjadi kesalahan internal pada server." });
  }
};
