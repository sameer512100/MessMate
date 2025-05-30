const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: String,
  day: String,
  description: String,
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'] },
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
  image: String,
  ingredients: [String],
  votes: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
  },
  votedBy: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      vote: { type: String, enum: ['up', 'down'] }
    }
  ]
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);