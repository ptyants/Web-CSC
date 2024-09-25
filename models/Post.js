const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: String,
    content: String,
    author: String,
    date: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Post', postSchema);
