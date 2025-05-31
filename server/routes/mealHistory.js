const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const controller = require('../controllers/mealHistoryController');

// Save a meal selection
router.post('/', authenticate(), controller.saveMeal);

// Get meal history for logged-in user
router.get('/', authenticate(), controller.getHistory);

module.exports = router;