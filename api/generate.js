// File: /api/generate.js
// Ini adalah kode backend yang akan berjalan di server Vercel.

module.exports = async (req, res) => {

  try {
    const { prompt, isJson } = req.body;
    
    // Ambil API Key dari Environment Variable yang aman
    const apiKey = process.env.AIzaSyD6kSeINJXXn-098S1BijT_VtnQjMdAaBQ;

    if (!apiKey) {
      throw new Error("API Key tidak ditemukan.");
    }
    
    if (!prompt) {
        return res.status(400).json({ message: 'Prompt tidak boleh kosong.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };
    
    if (isJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    // Panggil Google API dari sisi server
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from Google API:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Kirim kembali hasil yang sukses ke frontend
    res.status(200).json(result);

  } catch (error) {
    console.error("Error di serverless function:", error);
    res.status(500).json({ message: "Terjadi kesalahan internal di server.", error: error.message });
  }
}
