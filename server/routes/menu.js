const express = require('express');

const router = express.Router();
const menuController = require('../controllers/menuControllers');
const authenticate = require('../middleware/authenticate');

// Anyone can view menu items
router.get('/', menuController.getMenuItems);

// Only authenticated admins can add, update, or delete
router.post('/', authenticate(true), menuController.addMenuItem);
router.put('/:id', authenticate(true), menuController.updateMenuItem);
router.delete('/:id', authenticate(true), menuController.deleteMenuItem);

// ...existing code...
router.post('/:id/vote', authenticate(), menuController.voteMenuItem);
// ...existing code...

module.exports = router;