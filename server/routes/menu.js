const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const menuController = require('../controllers/menuControllers');
const authenticate = require('../middleware/authenticate');

// Set up storage for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Image upload endpoint (public, but you can protect it if you want)
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the image URL (relative to server)
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Anyone can view menu items
router.get('/', menuController.getMenuItems);

// Only authenticated admins can add, update, or delete
router.post('/', authenticate(true), menuController.addMenuItem);
router.put('/:id', authenticate(true), menuController.updateMenuItem);
router.delete('/:id', authenticate(true), menuController.deleteMenuItem);

// Voting endpoint
router.post('/:id/vote', authenticate(), menuController.voteMenuItem);

module.exports = router;