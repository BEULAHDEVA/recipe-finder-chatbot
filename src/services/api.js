export async function searchRecipes(query) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }
}

export async function getRandomRecipe() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error getting random recipe:', error);
        return null;
    }
}

export async function getRecipeById(id) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const data = await response.json();
        return data.meals ? data.meals[0] : null;
    } catch (error) {
        console.error('Error getting recipe details:', error);
        return null;
    }
}

export async function getRecipesByArea(area) {
    try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
        const data = await response.json();
        return data.meals || [];
    } catch (error) {
        console.error('Error getting recipes by area:', error);
        return [];
    }
}
