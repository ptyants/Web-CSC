const express = require('express');
const router = express.Router();




// Route cho trang chủ
router.get('/', (req, res) => {
  res.render('index', { title: 'Trang chủ', user: req.user });
});


// Route dashboard
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.user });
});

module.exports = router;
