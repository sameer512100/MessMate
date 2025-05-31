const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { uploadProfilePicture, updateProfile } = require('../controllers/userControllers');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// Ensure 'uploads' directory exists, create if not
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage configuration for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Route: Upload profile picture (protected)
router.post(
  '/profile-picture',
  (req, res, next) => { 
    console.log('HIT /profile-picture'); 
    next(); 
  },
  authenticate(),
  upload.single('profilePicture'),
  uploadProfilePicture
);

// Route: Update user profile (protected)
router.put(
  '/profile',
  authenticate(),
  updateProfile
);

module.exports = router;
