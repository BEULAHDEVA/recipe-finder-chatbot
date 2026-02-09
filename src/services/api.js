
const BACKEND_URL = 'http://localhost:5000/api';

export async function sendMessage(message, type = 'search', language = 'en') {
    try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, type, language }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Backend Error:', error);
        return {
            reply: "Sorry, I'm having trouble connecting to my brain (the server). Please make sure the Python backend is running!",
            recipe: null
        };
    }
}

export async function translateRecipe(recipe, language) {
    if (language === 'en') return recipe;

    try {
        const response = await fetch(`${BACKEND_URL}/translate_recipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipe, language }),
        });

        if (!response.ok) return recipe;

        return await response.json();
    } catch (error) {
        console.error('Translation Error:', error);
        return recipe;
    }
}
