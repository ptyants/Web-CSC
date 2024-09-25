const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Điều chỉnh tùy thuộc vào vị trí của model User


// Kiểm tra vai trò người dùng
function checkRole(role) {
    return function (req, res, next) {
        if (req.user && (req.user.role === role || req.user.role === 'admin')) {
            return next();
        }
        return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    };
}

module.exports = { checkRole };
