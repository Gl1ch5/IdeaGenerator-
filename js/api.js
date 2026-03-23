const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile"; // Use the updated public model

async function generateGDD(apiKey, promptType, customTopic = null) {
    if (!apiKey) {
        throw new Error("ERR_AUTH: NO API KEY PROVIDED.");
    }

    let systemPrompt = `You are GDD_GEN, an expert game design document generator. Output in markdown format, maintaining a strictly logical and structured sequence. Tone should be professional, precise, and analytical. Use ASCII formatting where possible.`;

    let userPrompt = "";
    if (promptType === "random") {
        userPrompt = `GENERATE_RANDOM_GAME_CONCEPT. Include: Core Loop, Setting, Mechanics, Art Style (Retro/Vintage preferred), and Monetization Strategy.`;
    } else if (promptType === "custom") {
        userPrompt = `GENERATE_CUSTOM_CONCEPT [TOPIC: ${customTopic}]. Expand this idea into a full Game Design Document. Include: Core Loop, Setting, Mechanics, Art Style, Monetization Strategy.`;
    }

    const payload = {
        model: MODEL,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2500,
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(`API_ERR: ${response.status} - ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}
