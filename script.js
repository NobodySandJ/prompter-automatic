// File: script.js (Versi BARU dan AMAN)

document.addEventListener('DOMContentLoaded', () => {
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

    // Template JSON (tetap sama)
    const templates = {
        veo2: { "project_vision": { "title": "", "logline": "REPLACE_ME", "core_emotion": "", "key_moment": "" }, "subjects": [{ "identifier": "", "category": "", "description": "", "physical_details": "", "action_and_movement": "", "positioning": "" }], "environment_and_setting": { "location_type": "", "specifics": "", "time_of_day": "", "weather": "", "atmosphere": "" }, "cinematography": { "camera_type": "", "shot_sequence": "", "camera_movement": "", "lens_and_focus": { "lens_type": "", "focus": "", "special_effects": "" }, "effects": { "slow_motion": "" } }, "visual_style": { "realism_level": "", "artistic_influence": "", "color_grading": "", "detail_and_texture": "" }, "audio_design": { "sound_concept": "", "sound_effects": "", "background_music": "" }, "technical_specifications": { "aspect_ratio": "16:9", "duration_in_seconds": 15, "frame_rate": "60fps", "negative_prompt": "" } },
        veo3: { "project_title": "", "scene_concept": { "logline": "REPLACE_ME", "scene_summary": "", "key_moment_to_capture": "" }, "subjects": [{ "identifier": "", "category": "", "physical_appearance": { "age": "", "ethnicity": "", "face_details": "", "body_type": "" }, "attire": "", "emotional_state": "", "primary_action": "", "secondary_action": "", "position_in_scene": "" }], "environment": { "setting_type": "", "era_and_style": "", "location_details": "", "atmosphere": "", "weather": "", "time_of_day": "" }, "cinematography": { "shot_sequence": [{ "type": "", "description": "" }], "camera_movement": "", "camera_angle": "", "lens_and_focus": { "lens_type": "", "depth_of_field": "", "focal_point": "", "special_effects": "" } }, "art_style": { "overall_visual_style": "", "artistic_influence": "", "color_palette": { "dominant_colors": [], "color_grading": "" }, "texture_and_materials": "" }, "audio_design": { "sound_concept": "", "sound_effects": [{ "sound": "" }], "background_music": { "genre": "", "tempo": "", "mood": "", "instrumentation": "" } }, "technical_specifications": { "aspect_ratio": "2.35:1", "duration_in_seconds": 12, "frame_rate": 24, "looping": "false", "negative_prompt": "" } },
        image: { "image_concept": { "title": "", "logline": "REPLACE_ME", "focal_point": "" }, "subjects": [{ "identifier": "", "description": "", "attire": "", "pose_and_action": "", "emotional_expression": "", "position_in_frame": "" }], "environment": { "setting": "", "architecture": "", "key_elements": "", "atmosphere": "" }, "photography": { "shot_type": "", "camera_angle": "", "lens_and_aperture": { "lens": "", "aperture": "" }, "composition": "", "lighting": { "style": "", "main_source": "", "secondary_source": "" } }, "art_style": { "medium": "", "overall_style": "", "artist_influence": "", "rendering_style": "", "color_palette": "", "detail_level": "" }, "technical_parameters": { "aspect_ratio": "3:4", "resolution": "8K", "negative_prompt": "" } }
    };

    function showMessage(text, isError = false) {
        messageBox.textContent = text;
        messageBox.classList.remove('hidden', 'text-green-400', 'text-red-400');
        messageBox.classList.add(isError ? 'text-red-400' : 'text-green-400');
        setTimeout(() => messageBox.classList.add('hidden'), 3000);
    }

    function handlePromptTypeSelection(e) {
        selectedPromptType = e.target.value;
        userInput.disabled = !selectedPromptType;
        userInput.placeholder = selectedPromptType ? "Contoh: Astronot menemukan taman rahasia di bulan..." : "Pilih tipe prompt di atas untuk memulai...";
        if(selectedPromptType) userInput.focus();
    }
    
    // FUNGSI INI BERUBAH TOTAL
    async function callBackendAPI(prompt, isJson = false) {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, isJson })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.candidates && result.candidates[0]?.content?.parts?.[0]) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Struktur response tidak valid:", result);
            throw new Error("Struktur response dari API tidak valid.");
        }
    }

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
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');

        try {
            loadingText.textContent = "Markus sedang meracik resep detail (1/2)...";
            const template = templates[selectedPromptType];
            const jsonInstruction = `Based on the user's core idea, creatively fill out all the fields in the following JSON structure. The user's idea is: "${idea}". Respond ONLY with the completed JSON object, without any extra text or markdown formatting. Ensure the logline directly reflects the user's idea.`;
            const jsonPrompt = `${jsonInstruction}\n\n${JSON.stringify(template, null, 2)}`;
            const jsonResultText = await callBackendAPI(jsonPrompt, true);

            const aiResultJson = JSON.parse(jsonResultText);
            promptOutput.textContent = JSON.stringify(aiResultJson, null, 2);

            loadingText.textContent = "Markus sedang merangkum jadi kalimat sakti (2/2)...";
            const summaryInstruction = `Based on the following detailed JSON prompt, create a concise, single-paragraph descriptive prompt in English, suitable for a text-to-video or text-to-image AI. Combine the most important elements like subject, environment, and style into a natural-sounding sentence. Do not add any introductory phrases. Just give the prompt itself. Here is the JSON: \n\n ${jsonResultText}`;
            const summaryResultText = await callBackendAPI(summaryInstruction, false);
            
            summaryOutput.textContent = summaryResultText;
            summaryContainer.classList.remove('hidden');
            resultContainer.classList.remove('hidden');
        } catch (error) {
            console.error("An error occurred during generation:", error);
            showMessage(`Oops, ada error: ${error.message}`, true);
        } finally {
            loadingIndicator.classList.add('hidden');
            generateBtn.disabled = false;
            generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    function copyToClipboard(text, buttonElement) {
        if (!text) return;
        const originalText = buttonElement.textContent;
        navigator.clipboard.writeText(text).then(() => {
            buttonElement.textContent = 'Copied!';
            setTimeout(() => { buttonElement.textContent = originalText; }, 2000);
        }).catch(err => {
            console.error('Gagal menyalin: ', err);
            showMessage('Gagal menyalin.', true);
        });
    }

    promptTypeSelect.addEventListener('change', handlePromptTypeSelection);
    generateBtn.addEventListener('click', generatePrompt);
    copyJsonBtn.addEventListener('click', () => copyToClipboard(promptOutput.textContent, copyJsonBtn));
    copySummaryBtn.addEventListener('click', () => copyToClipboard(summaryOutput.textContent, copySummaryBtn));
});
