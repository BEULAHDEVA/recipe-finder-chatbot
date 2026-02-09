import os
import google.generativeai as genai
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("VITE_GEMINI_API_KEY")
if not api_key:
    # Try looking in parent directory .env as well if not found in current context
    # But python-dotenv should handle it if we point to the right file.
    # For now, we assume the environment variable is set or loaded.
    pass

# Configure GenAI
if api_key:
    genai.configure(api_key=api_key)

def is_configured():
    return bool(api_key)

def analyze_query(user_text):
    if not is_configured():
        return {"language": "en", "translatedQuery": user_text}
    
    try:
        model = genai.GenerativeModel("gemini-pro")
        prompt = f"""
        Analyze the following text related to food/recipes: "{user_text}"
        1. Detect the language (ISO 639-1 code, e.g., 'en', 'es', 'hi', 'fr').
        2. Translate it to English if it's not in English.
        3. Extract the core food search term (e.g., "pollo frito" -> "fried chicken").
        
        Return ONLY a JSON object with this format:
        {{
          "language": "es",
          "translatedQuery": "fried chicken",
          "isGreeting": false
        }}
        """
        
        result = model.generate_content(prompt)
        text = result.text
        
        # Clean up markdown
        json_str = text.replace('```json', '').replace('```', '').strip()
        return json.loads(json_str)
    except Exception as e:
        print(f"AI Analysis failed: {e}")
        return {"language": "en", "translatedQuery": user_text}

def translate_response(text, target_lang):
    if not is_configured() or target_lang == 'en':
        return text
        
    try:
        model = genai.GenerativeModel("gemini-pro")
        prompt = f'Translate the following text to {target_lang}. Keep the tone friendly and helpful. Do not translate proper nouns of dishes if they are widely known (like Pizza, Sushi) but translate descriptions. Text: "{text}"'
        
        result = model.generate_content(prompt)
        return result.text
    except Exception as e:
        print(f"AI Translation failed: {e}")
        return text

def translate_recipe(recipe, target_lang):
    if not is_configured() or target_lang == 'en':
        return recipe

    try:
        model = genai.GenerativeModel("gemini-pro")
        prompt = f"""
          Translate the following recipe details to {target_lang}:
          Title: {recipe.get('strMeal')}
          Instructions: {recipe.get('strInstructions')}
          Category: {recipe.get('strCategory')}
          Area: {recipe.get('strArea')}

          Return ONLY a JSON object with the detected keys translated:
          {{
            "strMeal": "...",
            "strInstructions": "...",
            "strCategory": "...",
            "strArea": "..."
          }}
        """
        
        result = model.generate_content(prompt)
        text = result.text
        
        json_str = text.replace('```json', '').replace('```', '').strip()
        translated_part = json.loads(json_str)
        
        # Merge translation into recipe
        # ensure we fallback to originals if keys missing
        updated_recipe = recipe.copy()
        updated_recipe.update(translated_part)
        return updated_recipe

    except Exception as e:
        print(f"AI Recipe Translation failed: {e}")
        return recipe
