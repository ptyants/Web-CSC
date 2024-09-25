const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import model User
const { checkRole } = require('../middlewares/auth');

// Route để hiển thị thông tin thành viên
router.get('/members', async (req, res) => {
    try {
        // Lấy tất cả thành viên từ cơ sở dữ liệu
        const users = await User.find();

        // Tạo một đối tượng để lưu trữ thống kê
        const statistics = {};

        // Tính toán thống kê
        users.forEach(user => {
            // Lấy hai chữ số đầu của MSSV
            const mssvPrefix = user.mssv.slice(0, 2);
            // Tạo nhóm cho từng chữ số đầu
            if (!statistics[mssvPrefix]) {
                statistics[mssvPrefix] = { count: 0, roles: {} };
            }
            statistics[mssvPrefix].count++;

            // Đếm số lượng theo vai trò
            if (!statistics[mssvPrefix].roles[user.role]) {
                statistics[mssvPrefix].roles[user.role] = 0;
            }
            statistics[mssvPrefix].roles[user.role]++;
        });

        // Truyền thông tin người dùng đã đăng nhập để kiểm tra quyền hạn
        res.render('members', { users, statistics, currentUser: req.user }); // Gửi thông tin thống kê và người dùng hiện tại tới EJS
    } catch (error) {
        console.error(error);
        res.status(500).send('Có lỗi xảy ra');
    }
});

// Route để xóa người dùng theo id (chỉ admin mới có thể xóa)
router.post('/members/delete/:id', checkRole('admin'), async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.redirect('/members');
    } catch (error) {
        console.error(error);
        res.status(500).send('Có lỗi xảy ra khi xoá người dùng');
    }
});

// Route để thay đổi vai trò người dùng theo id (chỉ admin mới có thể thay đổi)
router.post('/members/change-role/:id', checkRole('admin'), async (req, res) => {
    try {
        const userId = req.params.id;
        const newRole = req.body.role;

        // Chỉ cho phép thay đổi sang các vai trò hợp lệ
        if (['guest', 'member', 'admin'].includes(newRole)) {
            await User.findByIdAndUpdate(userId, { role: newRole });
        }
        res.redirect('/members');
    } catch (error) {
        console.error(error);
        res.status(500).send('Có lỗi xảy ra khi thay đổi vai trò');
    }
});

module.exports = router;
