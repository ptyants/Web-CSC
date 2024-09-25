const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Route trang bài viết
router.get('/posts', async (req, res) => {
  const posts = await Post.find({});
  res.render('posts', { title: 'Danh sách bài viết', posts });
});

// Route tạo bài viết mới
router.get('/posts/new', (req, res) => {
  res.render('new-post', { title: 'Viết bài mới' });
});

router.post('/posts', async (req, res) => {
  const { title, content, author } = req.body;
  const post = new Post({ title, content, author });
  await post.save();
  res.redirect('/posts');
});

module.exports = router;
