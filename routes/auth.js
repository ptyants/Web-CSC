const express = require('express');
const router = express.Router();
const passport = require('passport'); // Khai báo passport ở đây
const User = require('../models/User');

// Route đăng nhập (hiển thị form đăng nhập)
router.get('/login', (req, res) => {
  res.render('login', { title: 'Đăng nhập', message: req.flash('error') });
});

// Route xử lý đăng nhập với passport-local
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));

// Route đăng ký (hiển thị form đăng ký)
router.get('/register', (req, res) => {
  res.render('register', { title: 'Đăng ký', message: '' });
});

// Route xử lý đăng ký
router.post('/register', async (req, res) => {
  const { username, mssv, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.render('register', { title: 'Đăng ký', message: 'Mật khẩu không khớp.' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('register', { title: 'Đăng ký', message: 'Tài khoản đã tồn tại.' });
    }

    const newUser = new User({ username, mssv, password, role: 'member' });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    res.render('register', { title: 'Đăng ký', message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

// Route đăng xuất
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });
});

module.exports = router;
