
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export const aiService = {
    isConfigured: () => !!genAI,

    async analyzeQuery(userText) {
        if (!genAI) return { language: 'en', translatedQuery: userText };

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const prompt = `
        Analyze the following text related to food/recipes: "${userText}"
        1. Detect the language (ISO 639-1 code, e.g., 'en', 'es', 'hi', 'fr').
        2. Translate it to English if it's not in English.
        3. Extract the core food search term (e.g., "pollo frito" -> "fried chicken").
        
        Return ONLY a JSON object with this format:
        {
          "language": "es",
          "translatedQuery": "fried chicken",
          "isGreeting": false
        }
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            try {
                // Clean up markdown code blocks if present
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(jsonStr);
            } catch (e) {
                console.error("Failed to parse AI response", e);
                return { language: 'en', translatedQuery: userText };
            }
        } catch (error) {
            console.error("AI Analysis failed:", error);
            return { language: 'en', translatedQuery: userText };
        }
    },

    async translateResponse(text, targetLang) {
        if (!genAI || targetLang === 'en') return text;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Translate the following text to ${targetLang}. Keep the tone friendly and helpful. Do not translate proper nouns of dishes if they are widely known (like Pizza, Sushi) but translate descriptions. Text: "${text}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Translation failed:", error);
            return text;
        }
    },

    async translateRecipe(recipe, targetLang) {
        if (!genAI || targetLang === 'en') return recipe;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `
          Translate the following recipe details to ${targetLang}:
          Title: ${recipe.strMeal}
          Instructions: ${recipe.strInstructions}
          Category: ${recipe.strCategory}
          Area: ${recipe.strArea}

          Return ONLY a JSON object with the detected keys translated:
          {
            "strMeal": "...",
            "strInstructions": "...",
            "strCategory": "...",
            "strArea": "..."
          }
        `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            try {
                const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
                const translatedPart = JSON.parse(jsonStr);
                return { ...recipe, ...translatedPart };
            } catch (e) {
                console.error("Failed to parse AI recipe translation", e);
                return recipe;
            }

        } catch (error) {
            console.error("AI Recipe Translation failed:", error);
            return recipe;
        }
    }
};
