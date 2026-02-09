import os
import requests
import json
import random
from dotenv import load_dotenv

load_dotenv()

THEMEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1"

def search_recipes(query):
    try:
        response = requests.get(f"{THEMEALDB_BASE_URL}/search.php?s={query}")
        data = response.json()
        return data.get('meals') or []
    except Exception as e:
        print(f"Error fetching recipes: {e}")
        return []

def get_random_recipe():
    try:
        response = requests.get(f"{THEMEALDB_BASE_URL}/random.php")
        data = response.json()
        return data.get('meals')[0] if data.get('meals') else None
    except Exception as e:
        print(f"Error getting random recipe: {e}")
        return None

def get_recipe_by_id(id):
    try:
        response = requests.get(f"{THEMEALDB_BASE_URL}/lookup.php?i={id}")
        data = response.json()
        return data.get('meals')[0] if data.get('meals') else None
    except Exception as e:
        print(f"Error getting recipe details: {e}")
        return None

def get_recipes_by_area(area):
    try:
        response = requests.get(f"{THEMEALDB_BASE_URL}/filter.php?a={area}")
        data = response.json()
        return data.get('meals') or []
    except Exception as e:
        print(f"Error getting recipes by area: {e}")
        return []
