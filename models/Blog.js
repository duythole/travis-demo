const mongoose = require('mongoose');
const { Schema } = mongoose;

const blogSchema = new Schema({
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});

mongoose.model('Blog', blogSchema);