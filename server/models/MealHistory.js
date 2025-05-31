const mongoose = require('mongoose');

const mealHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFats: Number,
  createdAt: { type: Date, default: Date.now }
});
  
module.exports = mongoose.model('MealHistory', mealHistorySchema);