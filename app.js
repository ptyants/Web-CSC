const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Post = require('./models/Post');
const Schedule = require('./models/Schedule');
const path = require('path');



const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Kết nối với MongoDB
//mongoose.connect('mongodb://127.0.0.1:27017/club', { useNewUrlParser: true, useUnifiedTopology: true });
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
    app.listen(3000, '127.0.0.1', () => {
        console.log('Server chạy tại http://127.0.0.1:3000/');
    });
});

// Trang chủ, nơi người dùng nhập thông tin
app.get('/', (req, res) => {
    res.render('index');
});

// Giới thiệu CLB
app.get('/about', (req, res) => {
    res.render('about');
});

// Sự kiện
app.get('/events', (req, res) => {
    res.render('events');
});

// Thành viên
app.get('/members', (req, res) => {
    res.render('members');
});

// Liên hệ
app.route('/contact')
    .get((req, res) => {
        res.render('contact'); // Hiển thị form liên hệ
    })
    .post((req, res) => {
        const { name, email, message } = req.body;

        // Xử lý dữ liệu POST
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Message: ${message}`);

        // Phản hồi sau khi xử lý
        res.send('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ sớm phản hồi.');
    });

// Trang bài viếtf
app.get('/posts', async (req, res) => {
    const posts = await Post.find({});
    res.render('posts', { title: 'Danh sách bài viết', posts: posts });
});

// Tạo bài viết mới
app.get('/posts/new', (req, res) => {
    res.render('new-post', { title: 'Viết bài mới', body: 'new-post' });
});


app.post('/posts', async (req, res) => {
    const { title, content, author } = req.body;
    const post = new Post({ title, content, author });
    await post.save();
    res.redirect('/posts');
});


// Dùng layout.ejs với các vấn đề của member

// Quản lý lịch trực
app.get('/schedules', async (req, res) => {
    const schedules = await Schedule.find({});
    res.render('schedules', { schedules, title: 'Lịch trực CLB' });
});


app.get('/schedules/new', async (req, res) => {
    const mssv = req.query.mssv; // Lấy MSSV từ query
    let schedule = null;

    if (mssv) {
        schedule = await Schedule.findOne({ mssv });
    }

    res.render('new-schedule', { title: 'Đăng ký lịch trực CLB', schedule });
});


app.post('/schedules', async (req, res) => {
    const { mssv, dates, timeSlots } = req.body;
    let schedule = await Schedule.findOne({ mssv });

    if (schedule) {
        // Cập nhật lịch trực nếu MSSV đã tồn tại
        schedule.dates = dates;
        schedule.timeSlots = timeSlots;
        schedule.registrationTime = Date.now(); // Cập nhật thời gian đăng ký
        await schedule.save();
    } else {
        // Tạo mới nếu MSSV chưa tồn tại
        schedule = new Schedule({ mssv, dates, timeSlots });
        await schedule.save();
    }

    res.redirect('/schedules');
});

app.post('/schedules/:id/approve', async (req, res) => {
    const { id } = req.params;
    await Schedule.findByIdAndUpdate(id, { status: 'Approved' });
    res.redirect('/schedules');
});

app.post('/schedules/:id/reject', async (req, res) => {
    const { id } = req.params;
    await Schedule.findByIdAndUpdate(id, { status: 'Rejected' });
    res.redirect('/schedules');
});

app.get('/posts/:id/edit', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render('edit-post', { title: 'Chỉnh sửa bài viết', post });
});

app.post('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, author } = req.body;
    await Post.findByIdAndUpdate(id, { title, content, author });
    res.redirect('/posts');
});

app.post('/posts/:id/delete', async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect('/posts');
});


    
// Xử lý yêu cầu của người dùng
app.post('/customize', (req, res) => {
    const layoutPreference = req.body.layout;
    
    // "AI" đơn giản để chọn bố cục dựa trên yêu cầu của người dùng
    if (layoutPreference === '1') {
        res.render('layout1');
    } else if (layoutPreference === '2') {
        res.render('layout2');
    } else {
        res.send('Lựa chọn không hợp lệ');
    }
});

// app.listen(3000, '127.0.0.1', ()=>{
//     console.log('Server running at http://127.0.0.1:3000/');
// })