const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const menuController = require('../controllers/menuControllers');
const authenticate = require('../middleware/authenticate');

// Multer setup for uploading images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// --- Routes ---

// Upload image (public access)
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Public: Get all menu items
router.get('/', menuController.getMenuItems);

// --- Protected Admin Routes (RESTful) ---
router.post('/', authenticate(true), menuController.addMenuItem);
router.put('/:id', authenticate(true), menuController.updateMenuItem);
router.delete('/:id', authenticate(true), menuController.deleteMenuItem);

// --- Authenticated User Route (Voting) ---
router.post('/:id/vote', authenticate(), menuController.voteMenuItem);

module.exports = router;