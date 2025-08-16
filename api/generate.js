// File: /api/generate.js (Versi Revisi untuk Groq)

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { prompt, isJson } = req.body;

    // 1. Mengambil API Key Groq dari Vercel
    const apiKey = process.env.GROQ_API_KEY; 

    if (!apiKey) {
      console.error("GROQ_API_KEY tidak diatur.");
      return res.status(500).json({ message: "Konfigurasi server tidak lengkap." });
    }
    
    if (!prompt) {
      return res.status(400).json({ message: 'Input prompt tidak boleh kosong.' });
    }

    // 2. Menggunakan URL Endpoint Groq
    const apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    // 3. Membuat Payload (mirip OpenAI)
    const payload = {
      model: "llama3-8b-8192", // Contoh model yang tersedia di Groq
      messages: [{ "role": "user", "content": prompt }],
    };

    if (isJson) {
      payload.response_format = { "type": "json_object" };
    }

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` 
      },
      body: JSON.stringify(payload),
    });

    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Error dari Groq API:", responseData);
      const errorMessage = responseData?.error?.message || `HTTP error! Status: ${apiResponse.status}`;
      return res.status(apiResponse.status).json({ message: errorMessage });
    }
    
    // Mengambil hasil dari struktur response Groq (sama seperti OpenAI)
    const resultText = responseData.choices[0].message.content;

    // Mengemas ulang agar format output sama seperti sebelumnya
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
