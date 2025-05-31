const MealHistory = require('../models/MealHistory');
const MenuItem = require('../models/MenuItem');

// Save a meal selection
exports.saveMeal = async (req, res) => {
  try {
    const { day, mealType, itemIds } = req.body;
    const user = req.user.id;

    // Fetch menu items to calculate totals
    const items = await MenuItem.find({ _id: { $in: itemIds } });

    const totalCalories = items.reduce((sum, i) => sum + (i.calories || 0), 0);
    const totalProtein = items.reduce((sum, i) => sum + (i.protein || 0), 0);
    const totalCarbs = items.reduce((sum, i) => sum + (i.carbs || 0), 0);
    const totalFats = items.reduce((sum, i) => sum + (i.fats || 0), 0);

    // Upsert (replace if exists for same user/day/mealType)
    const history = await MealHistory.findOneAndUpdate(
      { user, day, mealType },
      {
        user,
        day,
        mealType,
        items: items.map(i => i._id),
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        createdAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save meal history', error: err.message });
  }
};

// Get meal history for logged-in user
exports.getHistory = async (req, res) => {
  try {
    const user = req.user.id;
    const history = await MealHistory.find({ user })
      .populate('items')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch meal history', error: err.message });
  }
};