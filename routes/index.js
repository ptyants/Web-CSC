const express = require('express');
const router = express.Router();
const passport = require('passport');

// các Model
const Post = require('../models/Post');
const Schedule = require('../models/Schedule');

// Route cho trang chủ
router.get('/', (req, res) => {
  res.render('index', { title: 'Trang chủ' });
});

// Route đăng nhập (hiển thị form đăng nhập)
router.get('/login', (req, res) => {
  res.render('login', { title: 'Đăng nhập' });
});

// Route xử lý đăng nhập với passport-local
router.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard', // Điều hướng đến trang dashboard sau khi đăng nhập thành công
  failureRedirect: '/login', // Điều hướng lại trang login nếu thất bại
  failureFlash: true // Hiển thị thông báo lỗi
}));

// Route dashboard (chỉ dành cho người dùng đã đăng nhập)
router.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login'); // Nếu chưa đăng nhập, chuyển hướng về trang login
  }
  res.render('dashboard', { user: req.user }); // Hiển thị dashboard với thông tin người dùng
});

// Giới thiệu CLB
router.get('/about', (req, res) => {
  res.render('about');
});

// Sự kiện
router.get('/events', (req, res) => {
  res.render('events');
});

// Thành viên
router.get('/members', (req, res) => {
  res.render('members');
});

// Liên hệ
router.route('/contact')
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
router.get('/posts', async (req, res) => {
  const posts = await Post.find({});
  res.render('posts', { title: 'Danh sách bài viết', posts: posts });
});

// Tạo bài viết mới
router.get('/posts/new', (req, res) => {
  res.render('new-post', { title: 'Viết bài mới', body: 'new-post' });
});


router.post('/posts', async (req, res) => {
  const { title, content, author } = req.body;
  const post = new Post({ title, content, author });
  await post.save();
  res.redirect('/posts');
});


// Dùng layout.ejs với các vấn đề của member

// Quản lý lịch trực
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find({});
    console.log("data schedules: ", schedules)
    res.render('schedules', { schedules, title: 'Lịch trực CLB' });
  } catch (error) {
    console.error('Error while fetching schedules:', error);
    res.status(500).send('Lỗi khi lấy dữ liệu lịch.');
  }
});

// Route để xem và tạo lịch mới
router.get('/schedules/new', async (req, res) => {
  const mssv = req.query.mssv; // Lấy MSSV từ query
  let schedule = null;

  if (mssv) {
    schedule = await Schedule.findOne({ mssv });
  }

  res.render('new-schedule', { title: 'Đăng ký lịch trực CLB', schedule });
});

router.post('/schedules/:id/approve', async (req, res) => {
  const { id } = req.params;
  await Schedule.findByIdAndUpdate(id, { status: 'Approved' });
  res.redirect('/schedules');
});

router.post('/schedules/:id/reject', async (req, res) => {
  const { id } = req.params;
  await Schedule.findByIdAndUpdate(id, { status: 'Rejected' });
  res.redirect('/schedules');
});

// Route để đăng ký lịch mới
router.post('/schedules', async (req, res) => {
  try {
    const { mssv, timeSlots } = req.body;
    console.log("Dữ liệu đăng ký:", req.body);

    // Xử lý dữ liệu timeSlots
    const parsedTimeSlots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;

    if (!parsedTimeSlots || typeof parsedTimeSlots !== 'object') {
      throw new Error('Dữ liệu timeSlots không hợp lệ.');
    }

    const scheduleData = {};

    // Tạo cấu trúc dữ liệu cho các ngày và khung giờ
    for (const [dayIndex, slots] of Object.entries(parsedTimeSlots)) {
      if (slots && typeof slots === 'object') {
        for (const [slot, value] of Object.entries(slots)) {
          if (value === 'selected') {
            if (!Array.isArray(scheduleData[dayIndex])) {
              scheduleData[dayIndex] = [];
            }
            scheduleData[dayIndex].push(slot);  // Liên kết ngày với khung giờ
          }
        }
      }
    }

    console.log('Dữ liệu lịch đã được xử lý:', scheduleData);

    // Kiểm tra và cập nhật hoặc tạo mới bản ghi
    let schedule = await Schedule.findOne({ mssv });
    if (schedule) {
      // Cập nhật bản ghi nếu đã tồn tại
      schedule.scheduleData = scheduleData;
      schedule.registrationTime = Date.now(); // Cập nhật thời gian đăng ký
      await schedule.save();
    } else {
      // Tạo mới bản ghi nếu chưa tồn tại
      schedule = new Schedule({ mssv, scheduleData });
      await schedule.save();
    }

    res.redirect('/schedules');
  } catch (error) {
    console.error('Lỗi khi xử lý đăng ký lịch:', error);
    res.status(500).send('Lỗi khi xử lý đăng ký lịch.');
  }
});


// Route để xem lịch theo dạng lưới
router.get('/schedules/view', async (req, res) => {
  try {
    const schedules = await Schedule.find({});
    const organizedSchedules = organizeSchedules(schedules);
    res.render('schedules-view', { schedules: organizedSchedules, title: 'Lịch trực' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lấy dữ liệu lịch.');
  }
});


function organizeSchedules(schedules) {
  // Các ngày trong tuần theo chỉ số từ 0 đến 6
  const daysOfWeek = ['0', '1', '2', '3', '4', '5', '6'];
  const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const timeSlots = ['7h50 - 9h30', '9h30 - 11h15', '13h - 15h15', '15h15 - 17h'];

  // Tạo cấu trúc lịch dựa trên các ngày và khung giờ
  let organized = dayNames.map((dayName, dayIndex) => ({
    day: dayName,
    slots: timeSlots.map(slot => {
      // Lọc ra những thành viên có lịch trực cho ngày và khung giờ cụ thể
      const slotData = schedules.filter(schedule => {
        // Chuyển đổi Map thành đối tượng thông thường
        const scheduleMap = schedule.scheduleData instanceof Map ? Object.fromEntries(schedule.scheduleData) : schedule.scheduleData;
        // Kiểm tra xem ngày hiện tại có chứa khung giờ này không
        return scheduleMap[daysOfWeek[dayIndex]] && scheduleMap[daysOfWeek[dayIndex]].includes(slot);
      });

      // Tạo danh sách thành viên cho từng khung giờ
      return {
        slot,
        members: slotData.map(schedule => ({
          name: schedule.mssv, // Thay thế bằng tên thật nếu có
          mssv: schedule.mssv
        }))
      };
    })
  }));

  console.log("Data organized for view:", JSON.stringify(organized, null, 2)); // Log dữ liệu
  return organized;
}



// route đăng bài post
router.get('/posts/:id/edit', async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  res.render('edit-post', { title: 'Chỉnh sửa bài viết', post });
});

router.post('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, author } = req.body;
  await Post.findByIdAndUpdate(id, { title, content, author });
  res.redirect('/posts');
});

router.post('/posts/:id/delete', async (req, res) => {
  const { id } = req.params;
  await Post.findByIdAndDelete(id);
  res.redirect('/posts');
});



// Xử lý yêu cầu của người dùng
router.post('/customize', (req, res) => {
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



module.exports = router;
