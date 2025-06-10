const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image : {
        type: String
    },
    username: { 
        type: String,
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    categories: String,
    createdAt: { 
        type: Date,
        default: Date.now 
    }
});

module.exports = mongoose.model('Post', PostSchema);
