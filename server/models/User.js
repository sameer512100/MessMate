const mongoose = require('mongoose');


const dietGoalsSchema = new mongoose.Schema({
  targetCalories: { type: Number, default: 2000 },
  protein: { type: Number, default: 150 },
  carbs: { type: Number, default: 250 },
  fats: { type: Number, default: 67 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true },
  collegeId: { type: String },
  profilePicture: { type: String ,default: ''},
  dietGoals: { type: dietGoalsSchema, default: () => ({}) },
});

module.exports = mongoose.model('User', userSchema);