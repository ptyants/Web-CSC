const express = require('express');
const router = express.Router();

const Schedule = require('../models/Schedule');
const User = require('../models/User');

const { checkRole } = require('../middlewares/auth');
const passport = require('passport');



// Dùng layout.ejs với các vấn đề của member

// Quản lý lịch trực
router.get('/schedules', async (req, res) => {
  try {
      const schedules = await Schedule.find({});
      
      // Lấy username cho từng schedule và đếm số buổi trực
      const userPromises = schedules.map(async (schedule) => {
          const user = await User.findOne({ mssv: schedule.mssv });
          // Đếm số buổi trực từ scheduleData
          const totalSessions = Array.from(schedule.scheduleData.values()).reduce((acc, days) => acc + days.length, 0);
          return {
              ...schedule.toObject(),
              username: user ? user.username : 'Không xác định',
              totalSessions // thêm thuộc tính totalSessions
          };
      });

      const schedulesWithUsernames = await Promise.all(userPromises);

      // Sắp xếp theo ngày đăng ký
      schedulesWithUsernames.sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime));

      console.log("data schedules: ", schedulesWithUsernames);
      res.render('schedules', { schedules: schedulesWithUsernames, title: 'Lịch trực CLB' });
  } catch (error) {
      console.error('Error while fetching schedules:', error);
      res.status(500).send('Lỗi khi lấy dữ liệu lịch.');
  }
});



// Route để xem và tạo lịch mới
router.get('/schedules/new', checkRole('member'), async (req, res) => {
  const user = req.user;
  const mssv = user.mssv;

  let schedule = await Schedule.findOne({ mssv });
  const scheduleData = schedule ? Object.fromEntries(schedule.scheduleData) : {};
  
  res.render('new-schedule', { title: 'Đăng ký lịch trực CLB', scheduleData, mssv });
});

// Route để đăng ký lịch mới
router.post('/schedules', checkRole('member'), async (req, res) => {
  try {
    const { mssv, timeSlots } = req.body;
    const parsedTimeSlots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
    
    const scheduleData = {};
    for (const [dayIndex, slots] of Object.entries(parsedTimeSlots)) {
      if (slots && typeof slots === 'object') {
        for (const [slot, value] of Object.entries(slots)) {
          if (value === 'selected') {
            if (!Array.isArray(scheduleData[dayIndex])) {
              scheduleData[dayIndex] = [];
            }
            scheduleData[dayIndex].push(slot);
          }
        }
      }
    }

    let schedule = await Schedule.findOne({ mssv });
    if (schedule) {
      if (JSON.stringify(schedule.scheduleData) !== JSON.stringify(scheduleData)) {
        schedule.scheduleData = scheduleData;
        schedule.registrationTime = Date.now();
        schedule.status = 'Pending';
        await schedule.save();
      }
    } else {
      schedule = new Schedule({ mssv, scheduleData });
      await schedule.save();
    }

    res.redirect('/schedules/view');
  } catch (error) {
    console.error('Lỗi khi xử lý đăng ký lịch:', error);
    res.status(500).send('Lỗi khi xử lý đăng ký lịch.');
  }
});

// Route để xem lịch theo dạng lưới
router.get('/schedules/view', checkRole('member'), async (req, res) => {
  try {
    const schedules = await Schedule.find({});
    const organizedSchedules = await organizeSchedules(schedules);
    res.render('schedules-view', { schedules: organizedSchedules, title: 'Lịch trực' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lấy dữ liệu lịch.');
  }
});

async function organizeSchedules(schedules) {
  const users = await User.find({});
  const userLookup = {};
  users.forEach(user => {
    userLookup[user.mssv] = user.username;
  });

  const daysOfWeek = ['0', '1', '2', '3', '4', '5', '6'];
  const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const timeSlots = ['7h50 - 9h30', '9h30 - 11h15', '13h - 15h15', '15h15 - 17h'];

  let organized = dayNames.map((dayName, dayIndex) => ({
    day: dayName,
    slots: timeSlots.map(slot => {
      const slotData = schedules.filter(schedule => {
        const scheduleMap = schedule.scheduleData instanceof Map ? Object.fromEntries(schedule.scheduleData) : schedule.scheduleData;
        return scheduleMap[daysOfWeek[dayIndex]] && scheduleMap[daysOfWeek[dayIndex]].includes(slot);
      });

      return {
        slot,
        members: slotData.map(schedule => ({
          name: userLookup[schedule.mssv] || schedule.mssv,
          mssv: schedule.mssv
        }))
      };
    })
  }));

  return organized;
}





router.post('/schedules/:id/approve', async (req, res) => {
  const { id } = req.params;
  await Schedule.findByIdAndUpdate(id, { status: 'Approved' });
  res.status(200).json({ message: 'Đã thay đổi', id });
});

router.post('/schedules/:id/reject', async (req, res) => {
  const { id } = req.params;
  await Schedule.findByIdAndUpdate(id, { status: 'Rejected' });
  res.status(200).json({ message: 'Đã thay đổi', id });
});




module.exports = router;