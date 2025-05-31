const axios = require('axios');

const API_KEY = process.env.MEALPLANNER_API_KEY;

async function fetchMacros(ingredient) {
  try {
    // Search for the ingredient to get its ID
    const url = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(ingredient)}&apiKey=${API_KEY}`;
    const res = await axios.get(url);
    const firstResult = res.data.results?.[0];
    if (!firstResult) return null;

    // Get nutrition info for the found ingredient
    const nutritionUrl = `https://api.spoonacular.com/food/ingredients/${firstResult.id}/information?amount=100&unit=gram&apiKey=${API_KEY}`;
    const nutritionRes = await axios.get(nutritionUrl);
    const nutrition = nutritionRes.data.nutrition?.nutrients || [];

    const getValue = (name) => {
      const found = nutrition.find(n => n.name.toLowerCase() === name.toLowerCase());
      return found ? found.amount : 0;
    };

    return {
      calories: getValue('Calories'),
      protein: getValue('Protein'),
      carbs: getValue('Carbohydrates'),
      fats: getValue('Fat'),
    };
  } catch (err) {
    console.error('Macro fetch error:', err.message);
    return null;
  }
}

async function calculateMacros(ingredients = []) {
  let macros = { calories: 0, protein: 0, carbs: 0, fats: 0 };
  for (const ing of ingredients) {
    const data = await fetchMacros(ing);
    if (data) {
      macros.calories += data.calories;
      macros.protein += data.protein;
      macros.carbs += data.carbs;
      macros.fats += data.fats;
    }
  }
  Object.keys(macros).forEach(k => macros[k] = Math.round(macros[k] * 10) / 10);
  return macros;
}

module.exports = calculateMacros;