// Definisi elemen-elemen HTML
const userInput = document.getElementById('userInput');
const generateBtn = document.getElementById('generateBtn');
const outputSection = document.getElementById('outputSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const loadingText = document.getElementById('loadingText');
const messageBox = document.getElementById('messageBox');
const promptTypeSelect = document.getElementById('promptTypeSelect');
const resultContainer = document.getElementById('resultContainer');
const promptOutput = document.getElementById('promptOutput');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const summaryContainer = document.getElementById('summaryContainer');
const summaryOutput = document.getElementById('summaryOutput');
const copySummaryBtn = document.getElementById('copySummaryBtn');

let selectedPromptType = null;

// Template JSON untuk berbagai tipe prompt
const templates = {
    veo2: { "project_vision": { "title": "", "logline": "REPLACE_ME", "core_emotion": "", "key_moment": "" }, "subjects": [{ "identifier": "", "category": "", "description": "", "physical_details": "", "action_and_movement": "", "positioning": "" }], "environment_and_setting": { "location_type": "", "specifics": "", "time_of_day": "", "weather": "", "atmosphere": "" }, "cinematography": { "camera_type": "", "shot_sequence": "", "camera_movement": "", "lens_and_focus": { "lens_type": "", "focus": "", "special_effects": "" }, "effects": { "slow_motion": "" } }, "visual_style": { "realism_level": "", "artistic_influence": "", "color_grading": "", "detail_and_texture": "" }, "audio_design": { "sound_concept": "", "sound_effects": "", "background_music": "" }, "technical_specifications": { "aspect_ratio": "16:9", "duration_in_seconds": 15, "frame_rate": "60fps", "negative_prompt": "" } },
    veo3: { "project_title": "", "scene_concept": { "logline": "REPLACE_ME", "scene_summary": "", "key_moment_to_capture": "" }, "subjects": [{ "identifier": "", "category": "", "physical_appearance": { "age": "", "ethnicity": "", "face_details": "", "body_type": "" }, "attire": "", "emotional_state": "", "primary_action": "", "secondary_action": "", "position_in_scene": "" }], "environment": { "setting_type": "", "era_and_style": "", "location_details": "", "atmosphere": "", "weather": "", "time_of_day": "" }, "cinematography": { "shot_sequence": [{ "type": "", "description": "" }], "camera_movement": "", "camera_angle": "", "lens_and_focus": { "lens_type": "", "depth_of_field": "", "focal_point": "", "special_effects": "" } }, "art_style": { "overall_visual_style": "", "artistic_influence": "", "color_palette": { "dominant_colors": [], "color_grading": "" }, "texture_and_materials": "" }, "audio_design": { "sound_concept": "", "sound_effects": [{ "sound": "" }], "background_music": { "genre": "", "tempo": "", "mood": "", "instrumentation": "" } }, "technical_specifications": { "aspect_ratio": "2.35:1", "duration_in_seconds": 12, "frame_rate": 24, "looping": "false", "negative_prompt": "" } },
    image: { "image_concept": { "title": "", "logline": "REPLACE_ME", "focal_point": "" }, "subjects": [{ "identifier": "", "description": "", "attire": "", "pose_and_action": "", "emotional_expression": "", "position_in_frame": "" }], "environment": { "setting": "", "architecture": "", "key_elements": "", "atmosphere": "" }, "photography": { "shot_type": "", "camera_angle": "", "lens_and_aperture": { "lens": "", "aperture": "" }, "composition": "", "lighting": { "style": "", "main_source": "", "secondary_source": "" } }, "art_style": { "medium": "", "overall_style": "", "artist_influence": "", "rendering_style": "", "color_palette": "", "detail_level": "" }, "technical_parameters": { "aspect_ratio": "3:4", "resolution": "8K", "negative_prompt": "" } }
};

// Fungsi untuk menampilkan pesan notifikasi
function showMessage(text, isError = false) {
    messageBox.textContent = text;
    messageBox.classList.remove('hidden', 'text-green-400', 'text-red-400');
    messageBox.classList.add(isError ? 'text-red-400' : 'text-green-400');
    setTimeout(() => { messageBox.classList.add('hidden'); }, 3000);
}

// Fungsi yang dijalankan saat tipe prompt dipilih
function handlePromptTypeSelection(e) {
    selectedPromptType = e.target.value;
    if (selectedPromptType) {
        userInput.disabled = false;
        userInput.placeholder = "Contoh: Astronot menemukan taman rahasia di bulan...";
        userInput.focus();
    } else {
        userInput.disabled = true;
        userInput.placeholder = "Pilih tipe prompt di atas untuk memulai...";
    }
}

// Fungsi untuk memanggil Gemini API
async function callGeminiAPI(prompt, isJson = false) {
    const apiKey = ""; // <-- PENTING: Masukkan API Key Anda di sini
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], };
    if (isJson) {
        payload.generationConfig = { responseMimeType: "application/json" };
    }
    
    let attempts = 0;
    while (attempts < 5) {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts?.[0]) {
                return result.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Invalid response structure from Gemini API.");
            }
        } catch (error) {
            attempts++;
            if (attempts >= 5) {
                console.error("Error calling Gemini API after multiple retries:", error);
                return null;
            }
            await new Promise(res => setTimeout(res, Math.pow(2, attempts) * 100)); // Exponential backoff
        }
    }
}

// Fungsi utama untuk generate prompt
async function generatePrompt() {
    const idea = userInput.value.trim();
    if (!selectedPromptType) {
        showMessage("Pilih tipe prompt dulu, dong.", true);
        return;
    }
    if (!idea) {
        showMessage("Idenya jangan kosong, ya.", true);
        userInput.focus();
        return;
    }

    outputSection.classList.remove('hidden');
    loadingIndicator.classList.remove('hidden');
    summaryContainer.classList.add('hidden');
    resultContainer.classList.add('hidden');
    loadingText.textContent = "Markus sedang meracik resep detail (1/2)...";
    generateBtn.disabled = true;
    generateBtn.classList.add('opacity-50', 'cursor-not-allowed');

    try {
        // Step 1: Generate JSON yang detail
        const template = templates[selectedPromptType];
        const jsonInstruction = `Based on the user's core idea, creatively fill out all the fields in the following JSON structure. The user's idea is: "${idea}". Respond ONLY with the completed JSON object, without any extra text or markdown formatting. Ensure the logline directly reflects the user's idea.`;
        const jsonPrompt = `${jsonInstruction}\n\n${JSON.stringify(template, null, 2)}`;
        const jsonResultText = await callGeminiAPI(jsonPrompt, true);
        if (!jsonResultText) throw new Error("Failed to generate JSON recipe.");

        const aiResultJson = JSON.parse(jsonResultText);
        promptOutput.textContent = JSON.stringify(aiResultJson, null, 2);

        // Step 2: Generate ringkasan (prompt singkat)
        loadingText.textContent = "Markus sedang merangkum jadi kalimat sakti (2/2)...";
        const summaryInstruction = `Based on the following detailed JSON prompt, create a concise, single-paragraph descriptive prompt in English, suitable for a text-to-video or text-to-image AI. Combine the most important elements like subject, environment, and style into a natural-sounding sentence. Do not add any introductory phrases. Just give the prompt itself. Here is the JSON: \n\n ${jsonResultText}`;
        const summaryResultText = await callGeminiAPI(summaryInstruction, false);
        if (!summaryResultText) throw new Error("Failed to generate summary.");

        summaryOutput.textContent = summaryResultText;

        // Tampilkan hasil
        summaryContainer.classList.remove('hidden');
        resultContainer.classList.remove('hidden');

    } catch (error) {
        console.error("An error occurred during generation:", error);
        showMessage("Oops, ada yang error. Coba lagi nanti atau cek konsol.", true);
    } finally {
        // Sembunyikan loading dan aktifkan kembali tombol
        loadingIndicator.classList.add('hidden');
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Fungsi untuk menyalin teks ke clipboard
function copyToClipboard(text, buttonElement) {
    if (!text) return;
    const originalText = buttonElement.textContent;
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        buttonElement.textContent = 'Copied!';
        setTimeout(() => { buttonElement.textContent = originalText; }, 2000);
    } catch (err) {
        showMessage('Gagal menyalin.', true);
    }
    document.body.removeChild(textArea);
}

// Event Listeners (mengikat fungsi ke aksi pengguna)
promptTypeSelect.addEventListener('change', handlePromptTypeSelection);
generateBtn.addEventListener('click', generatePrompt);
copyJsonBtn.addEventListener('click', () => copyToClipboard(promptOutput.textContent, copyJsonBtn));
copySummaryBtn.addEventListener('click', () => copyToClipboard(summaryOutput.textContent, copySummaryBtn));
