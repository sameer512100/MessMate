const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true },
  collegeId: { type: String },
  profilePicture: { type: String },
});

module.exports = mongoose.model('User', userSchema);