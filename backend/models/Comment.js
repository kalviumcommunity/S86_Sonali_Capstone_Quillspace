const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true 
    },
    postId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
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
