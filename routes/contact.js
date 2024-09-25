const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');


// Route liên hệ
router.route('/contact')
  .get((req, res) => {
    res.render('contact');
  })
  .post(async (req, res) => {
    const { name, email, message } = req.body;
    const newContact = new Contact({ name, email, message });

    try {
      await newContact.save();
      res.render('thankyou', { message: 'Cảm ơn bạn đã liên hệ! Bạn sẽ được chuyển về Trang chủ sau 10 giây.' });
    } catch (error) {
      console.error('Error saving contact:', error);
      res.status(500).send('Đã xảy ra lỗi, vui lòng thử lại sau.');
    }
  });

module.exports = router;
