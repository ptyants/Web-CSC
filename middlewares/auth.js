// Kiểm tra xem người dùng đã đăng nhập hay chưa
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Kiểm tra vai trò người dùng
function checkRole(role) {
    return function (req, res, next) {
        if (req.isAuthenticated() && (req.user.role === role || req.user.role === 'admin')) {
            return next();
        }
        res.status(403).send('Bạn không có quyền truy cập');
    };
}

module.exports = { isAuthenticated, checkRole };
