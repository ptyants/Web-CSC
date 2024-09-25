const express = require('express');
const router = express.Router();
const passport = require('passport'); // Khai báo passport ở đây
const User = require('../models/User');

router.get('/attend', (req, res) => {
    res.render('attend-view')
})


router.post('/save-location', (req, res) => {
    const { latitude, longitude } = req.body;

    // Lưu vị trí hoặc xử lý thêm tại đây
    console.log(`Vĩ độ: ${latitude}, Kinh độ: ${longitude}`);

    res.json({ status: 'success', message: 'Vị trí đã được lưu' });
});

module.exports = router;
