
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import random

# Add current directory to path to find modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services import recipe_service, ai_service
from data.indian_recipes import popular_indian_dishes, known_dish_names

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "ai_configured": ai_service.is_configured()})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_text = data.get('message', '')
    query_type = data.get('type', 'search') # search, random, area, indian_priority
    current_lang = data.get('language', 'en')
    
    if not user_text and query_type != 'random':
        return jsonify({"error": "No message provided"}), 400

    # 1. AI Analysis & Language Detection
    analysis = {"language": current_lang, "translatedQuery": user_text}
    if ai_service.is_configured() and user_text:
        analysis = ai_service.analyze_query(user_text)
        # If the user typed in a language, we want to reply in that language
        # unless the UI says otherwise? Let's trust the detected language 
        # or the passed language if detection fails/is 'en' but user passed 'es'.
        # Actually, let's prefer the detected language if it's specific.
        if analysis.get('language') and analysis.get('language') != 'en':
            target_lang = analysis['language']
        else:
            target_lang = current_lang
    else:
        target_lang = current_lang
        
    search_query = analysis.get('translatedQuery', user_text)
    
    # 2. Search Logic
    recipe = None
    reply_text = ""
    
    # Check Local Data
    local_match = None
    if query_type in ['search', 'indian_priority', 'area']: # 'area' check is loose here, but mostly for 'Indian' area
        lower_query = search_query.lower()
        
        # Helper for loose matching
        def is_match(dish):
             if lower_query in dish['strMeal'].lower(): return True
             if dish['strMeal'].lower() in lower_query: return True
             if 'keywords' in dish:
                 for k in dish['keywords']:
                     if lower_query in k.lower() or k.lower() in lower_query:
                         return True
             return False

        # Filter local
        matches = [d for d in popular_indian_dishes if is_match(d)]
        if matches:
            local_match = matches[0]

    if local_match:
        recipe = local_match
        # We need to format the string responses similar to the frontend's i18n keys
        # Since we are moving logic to backend, we can just return English text 
        # and let the AI translate it, OR return a key.
        # Returning English text is easier for the AI translator.
        reply_text = f"I found a delicious recipe for {recipe['strMeal']}!"
    
    elif query_type == 'random':
        # Local random vs API random mix
        if random.random() > 0.4:
            recipe = random.choice(popular_indian_dishes)
            reply_text = f"Here is a random pick for you: {recipe['strMeal']} 🇮🇳"
        else:
            recipe = recipe_service.get_random_recipe()
            if recipe:
                reply_text = f"Here is a random discovery: {recipe['strMeal']}"
            else:
                reply_text = "I couldn't find a random recipe at the moment."

    elif query_type == 'area':
        # API Area search
        area_recipes = recipe_service.get_recipes_by_area(search_query)
        if area_recipes:
            # Pick one random from the list to show details
            summary = random.choice(area_recipes[:5])
            recipe = recipe_service.get_recipe_by_id(summary['idMeal'])
            reply_text = f"Here is a {search_query} dish: {recipe['strMeal']}" if recipe else f"Found {search_query} dishes."
        else:
            reply_text = f"Sorry, I couldn't find any recipes for {search_query}."
            
    else:
        # Standard Search
        api_recipes = recipe_service.search_recipes(search_query)
        if api_recipes:
             recipe = api_recipes[0]
             reply_text = f"I found this recipe for you: {recipe['strMeal']}"
        else:
            # Fallback suggestion
            fallback = random.choice(popular_indian_dishes)
            reply_text = f"I couldn't find '{search_query}'. How about trying {fallback['strMeal']} instead?"
            recipe = fallback

    # 3. Translate Response
    if target_lang != 'en':
        reply_text = ai_service.translate_response(reply_text, target_lang)

    return jsonify({
        "reply": reply_text,
        "recipe": recipe,
        "detectedLanguage": target_lang
    })

@app.route('/api/translate_recipe', methods=['POST'])
def translate_recipe_endpoint():
    data = request.json
    recipe = data.get('recipe')
    target_lang = data.get('language', 'en')
    
    if not recipe:
        return jsonify({"error": "No recipe provided"}), 400
        
    translated_recipe = ai_service.translate_recipe(recipe, target_lang)
    return jsonify(translated_recipe)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
