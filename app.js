const express = require('express');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
const path = require('path');
const passport = require('passport');
const indexRouter = require('./index');
require('./config/passport')(passport); // Khởi tạo Passport

// Load các biến môi trường từ file .env
require('dotenv').config();

const app = express();

// Cấu hình view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Cấu hình thư mục chứa các tệp static (CSS, JS, ảnh, ...)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware để xử lý dữ liệu từ body request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware khác
app.use(methodOverride('_method'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-default-secret', // Thay thế 'your-default-secret' bằng secret thực sự của bạn
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'your-default-mongodb-uri', // Thay thế 'your-default-mongodb-uri' bằng URL MongoDB thực sự của bạn
        collectionName: 'sessions'
    }),
    cookie: { secure: false } // Thay đổi thành true nếu sử dụng HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware để cung cấp thông tin người dùng cho views
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', indexRouter);

// Kết nối tới MongoDB
mongoose.connect(process.env.MONGODB_URI || 'your-default-mongodb-uri', { useNewUrlParser: true, useUnifiedTopology: true });

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
    app.listen(PORT, () => {
        console.log(`Server chạy tại http://localhost:${PORT}/`);
    });
});
