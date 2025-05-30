const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadProfilePicture } = require('../controllers/userControllers');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.post(
  '/profile-picture',
  (req, res, next) => { console.log('HIT /profile-picture'); next(); },
  authenticate,
  upload.single('profilePicture'),
  uploadProfilePicture
);

module.exports = router;