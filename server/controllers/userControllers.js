const User = require('../models/User');

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const profilePicturePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: profilePicturePath },
      { new: true }
    );
    res.json({ profilePicture: user.profilePicture });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ...existing code...
exports.updateProfile = async (req, res) => {
  console.log("Received profile update request");
  try {
    const userId = req.user.id;
    const { name, email, collegeId, dietGoals } = req.body;
    const updateFields = { name, email, collegeId };
    if (dietGoals) updateFields.dietGoals = dietGoals;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ message: 'User not found' });
    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      collegeId: updatedUser.collegeId,
      profilePicture: updatedUser.profilePicture,
      dietGoals: updatedUser.dietGoals
    });
  } catch (err) {
    res.status(500).json({ message: 'Profile update failed', error: err.message });
  }
};
// ...existing code...