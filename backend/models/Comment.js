const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    postId: {
        type: String,
        required: true
    },
    comments: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);
