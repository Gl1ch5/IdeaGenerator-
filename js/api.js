// api.js - Handles communication with the Groq API

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama3-70b-8192'; // Using the most powerful available public model on Groq

/**
 * Validates and saves the API key to session storage
 */
function saveApiKey(key) {
    if (!key || key.trim() === '') {
        return false;
    }
    sessionStorage.setItem('groq_api_key', key.trim());
    return true;
}

/**
 * Retrieves the API key from session storage
 */
function getApiKey() {
    return sessionStorage.getItem('groq_api_key');
}

/**
 * Generates a Game Design Document using Groq API
 * @param {string} prompt - User's input prompt (empty for random)
 * @returns {Promise<string>} - The generated GDD content
 */
async function generateGDD(prompt) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('API key is missing. Please save your Groq API key first.');
    }

    let systemMessage = `You are a legendary, veteran Game Designer from the 1990s using a terminal.
Your task is to generate a comprehensive Game Design Document (GDD).
Format your output in clean, readable markdown that looks good on a vintage terminal (using uppercase headers, bullet points, ASCII lines).
Include the following sections:
- GAME TITLE (Invent a catchy one)
- LOGLINE (One sentence summary)
- CORE GAMEPLAY LOOP
- MECHANICS & CONTROLS
- NARRATIVE & WORLD SETTING
- ART & AUDIO STYLE (Black and white/vintage focus if applicable)
- MONETIZATION STRATEGY
- GUERRILLA MARKETING STRATEGY (A unique, low-budget, crazy marketing idea)

Keep it highly creative, detailed, and completely immersive. Do NOT break character.`;

    let userMessage = prompt && prompt.trim() !== ''
        ? `Generate a GDD based on this core concept: "${prompt}"`
        : `Generate a completely random, wildly original GDD for a game no one has ever seen before.`;

    const requestBody = {
        model: MODEL,
        messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 3000,
        top_p: 1
    };

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
