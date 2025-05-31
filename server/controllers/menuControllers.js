const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// Get all menu items (public)
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch menu items', error: err.message });
  }
};

// Add a new menu item (admin only)
exports.addMenuItem = async (req, res) => {
  try {
    const item = new MenuItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add menu item', error: err.message });
  }
};

// Update a menu item (admin only) — ID in req.params.id
exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if (!id) return res.status(400).json({ message: 'Menu item ID is required' });

    const item = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update menu item', error: err.message });
  }
};

// Delete a menu item (admin only) — ID in req.params.id
exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Menu item ID is required' });

    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete menu item', error: err.message });
  }
};

// Vote on a menu item (authenticated users) — ID in req.params.id
exports.voteMenuItem = async (req, res) => {
  try {
    const { id } = req.params; // <-- get id from URL
    const { vote } = req.body; // 'up' or 'down'
    const userId = req.user.id;

    if (!id || !['up', 'down'].includes(vote)) {
      return res.status(400).json({ message: 'Invalid vote request' });
    }

    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    const existingVote = item.votedBy.find(v => v.user.toString() === userId);

    if (existingVote) {
      // If same vote, remove it
      if (existingVote.vote === vote) {
        if (vote === 'up') item.votes.upvotes--;
        else item.votes.downvotes--;
        item.votedBy = item.votedBy.filter(v => v.user.toString() !== userId);
      } else {
        // Change vote
        if (vote === 'up') {
          item.votes.upvotes++;
          item.votes.downvotes--;
        } else {
          item.votes.downvotes++;
          item.votes.upvotes--;
        }
        existingVote.vote = vote;
      }
    } else {
      // New vote
      if (vote === 'up') item.votes.upvotes++;
      else item.votes.downvotes++;

      item.votedBy.push({ user: userId, vote });
    }

    await item.save();

    res.json({
      message: 'Vote recorded',
      upvotes: item.votes.upvotes,
      downvotes: item.votes.downvotes,
      userVote: item.votedBy.find(v => v.user.toString() === userId)?.vote || null
    });

  } catch (err) {
    res.status(500).json({ message: 'Failed to vote on menu item', error: err.message });
  }
};