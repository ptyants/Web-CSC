const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Điều chỉnh tùy thuộc vào vị trí của model User

// Đăng nhập và trả về JWT
async function login(req, res) {
    const { mssv, password } = req.body;

    try {
        // Tìm người dùng theo MSSV
        const user = await User.findOne({ mssv });
        if (!user) {
            return res.status(400).json({ message: 'Tài khoản không tồn tại' });
        }

        // Kiểm tra mật khẩu
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secretKey',
            { expiresIn: '8h' } // Token có hiệu lực trong 8 giờ
        );

        console.log('Generated Token:', token); // Thêm dòng này để kiểm tra token

        return res.json({ token });
    } catch (err) {
        console.error('Error in login:', err); // Ghi lại lỗi nếu có
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}

// Middleware kiểm tra token JWT
function isAuthenticated(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Lấy token từ header Authorization

    if (!token) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Error verifying token:', err); // Ghi lại lỗi nếu có
        return res.status(401).json({ message: 'Token không hợp lệ' });
    }
}

// Kiểm tra vai trò người dùng
function checkRole(role) {
    return function (req, res, next) {
        if (req.user && (req.user.role === role || req.user.role === 'admin')) {
            return next();
        }
        return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    };
}

module.exports = { login, isAuthenticated, checkRole };
