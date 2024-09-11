const express = require('express');
const passport = require('passport');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// Cấu hình view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình thư mục chứa các tệp static (CSS, JS, ảnh, ...)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để xử lý dữ liệu từ body request
app.use(express.json()); // Middleware để xử lý JSON
app.use(express.urlencoded({ extended: false })); // Middleware để xử lý dữ liệu từ form (x-www-form-urlencoded)

// Middleware khác
app.use(methodOverride('_method'));
app.use(session({
    secret: 'your-secret-key', // Thay thế với một khóa bí mật an toàn
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Đặt secure: true nếu dùng HTTPS
  }));


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// Middleware to make user available in views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', require('./routes')); // Sử dụng các route trong index.js

// Kết nối tới MongoDB
mongoose.connect('mongodb+srv://phamtheants:MjJg26IjuyUft9pu@webcscdb.tlk67.mongodb.net/CSC_db?retryWrites=true&w=majority', 
    { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

// Xử lý lỗi kết nối
db.on('error', (error) => {
    console.error('Kết nối MongoDB gặp lỗi:', error);
});

// Khi kết nối thành công
db.once('open', () => {
    console.log('Kết nối MongoDB thành công');

    // Khởi động server chỉ khi MongoDB đã kết nối
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '127.0.0.1', () => {
        console.log(`Server chạy tại http://127.0.0.1:${PORT}/`);
    });
});
