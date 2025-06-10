const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');

// Post a new comment
router.post('/', async (req, res) => {
  try {
    const comment = new Comment(req.body);
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all comments for a post
router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId })
            .populate('postId', 'title')   
            .populate('userId', 'username email'); 
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update comment by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedComment) return res.status(404).json({ message: 'Comment not found' });

    res.status(200).json({ message: '✅ Comment updated successfully', comment: updatedComment });
  } catch (err) {
    res.status(500).json({ message: '❌ Update failed', error: err.message });
  }
});

module.exports = router;

// DELETE comment by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment) return res.status(404).json({ message: 'Comment not found' });
    res.status(200).json({ message: '🗑️ Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: '❌ Delete failed', error: err.message });
  }
});



