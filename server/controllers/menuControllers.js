const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const path = require('path');

exports.getMenuItems = async (req, res) => {
  const items = await MenuItem.find();
  res.json(items);
};

exports.addMenuItem = async (req, res) => {
  const item = new MenuItem(req.body);
  await item.save();
  res.status(201).json(item);
};

exports.updateMenuItem = async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};

exports.deleteMenuItem = async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};


// ...existing code...
exports.voteMenuItem = async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body; // 'up' or 'down'
  const userId = req.user.id;

  if (!['up', 'down'].includes(vote)) {
    return res.status(400).json({ message: 'Invalid vote type' });
  }

  const item = await MenuItem.findById(id);
  if (!item) return res.status(404).json({ message: 'Menu item not found' });

  // Check if user already voted
  const existingVote = item.votedBy.find(v => v.user.toString() === userId);

  if (existingVote) {
    // If same vote, remove vote
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
    upvotes: item.votes.upvotes,
    downvotes: item.votes.downvotes,
    userVote: item.votedBy.find(v => v.user.toString() === userId)?.vote || null
  });
};


