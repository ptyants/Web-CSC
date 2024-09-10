router.get('/schedules', async (req, res) => {
    try {
      const schedules = await Schedule.find({});
      res.render('schedules', { schedules, title: 'Lịch trực CLB' });
    } catch (error) {
      console.error('Error while fetching schedules:', error);
      res.status(500).send('Lỗi khi lấy dữ liệu lịch.');
    }
  });
  
  
  router.get('/schedules/new', async (req, res) => {
    const mssv = req.query.mssv; // Lấy MSSV từ query
    let schedule = null;
  
    if (mssv) {
      schedule = await Schedule.findOne({ mssv });
    }
  
    res.render('new-schedule', { title: 'Đăng ký lịch trực CLB', schedule });
  });
  
  
  // router.post('/schedules', async (req, res) => {
  //   try {
  //     const { mssv, timeSlots } = req.body;
  
  //     // Kiểm tra dữ liệu đầu vào
  //     console.log('timeSlots:', timeSlots);
  //     if (!timeSlots || Object.keys(timeSlots).length === 0) {
  //       throw new Error('Dữ liệu timeSlots không hợp lệ.');
  //     }
  //     const dates = [];
  //     const timeSlotArray = [];
  
  //     // Sử dụng Object.entries() an toàn hơn
  //     for (const [dayIndex, slots] of Object.entries(timeSlots)) {
  //       if (slots && typeof slots === 'object') {
  //         for (const [slot, value] of Object.entries(slots)) {
  //           if (value === 'selected') {
  //             // Chuyển dayIndex và slot thành ngày và giờ thực tế
  //             dates.push(dayIndex); // Hoặc thực hiện chuyển đổi ngày nếu cần
  //             timeSlotArray.push(slot);
  //           }
  //         }
  //       }
  //     }
  
  //     // Kiểm tra và cập nhật hoặc tạo mới bản ghi
  //     let schedule = await Schedule.findOne({ mssv });
  
  //     if (schedule) {
  //       // Cập nhật bản ghi nếu đã tồn tại
  //       schedule.dates = dates;
  //       schedule.timeSlots = timeSlotArray;
  //       schedule.registrationTime = Date.now(); // Cập nhật thời gian đăng ký
  //       await schedule.save();
  //     } else {
  //       // Tạo mới bản ghi nếu chưa tồn tại
  //       schedule = new Schedule({ mssv, dates, timeSlots: timeSlotArray });
  //       await schedule.save();
  //     }
  
  //     res.redirect('/schedules');
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send('Lỗi khi xử lý đăng ký lịch.');
  //   }
  // });
  
  
  router.post('/schedules', async (req, res) => {
    try {
      const { mssv, timeSlots } = req.body;
      console.log("ok1");
      console.log("data lịch: ", req.body);
  
      // Xử lý và kiểm tra dữ liệu timeSlots
      const parsedTimeSlots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
      if (!parsedTimeSlots || typeof parsedTimeSlots !== 'object') {
        console.log('Invalid timeSlots data:', parsedTimeSlots); // Debugging output
        throw new Error('Dữ liệu timeSlots không hợp lệ.');
      }
  
      const scheduleData = {};
  
      // Xử lý dữ liệu timeSlots
      for (const [dayIndex, slots] of Object.entries(parsedTimeSlots)) {
        if (slots && typeof slots === 'object') {
          for (const [slot, value] of Object.entries(slots)) {
            if (value === 'selected') {
              if (!scheduleData[dayIndex]) {
                scheduleData[dayIndex] = [];
              }
              scheduleData[dayIndex].push(slot);  // Liên kết ngày với khung giờ
            }
          }
        }
      }
  
      console.log('Parsed schedule data:', scheduleData);
  
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
      console.error('Error while processing schedule registration:', error);
      res.status(500).send('Lỗi khi xử lý đăng ký lịch.');
    }
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
  
  
  
  // Route để xem lịch
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
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = ['7h50 - 9h30', '9h30 - 11h15', '13h - 15h15', '15h15 - 17h'];
  
    // Tạo cấu trúc lịch dựa trên các ngày và khung giờ
    let organized = daysOfWeek.map((day, dayIndex) => ({
      day,
      slots: timeSlots.map(slot => {
        const slotData = schedules.filter(schedule => {
          // Kiểm tra xem ngày hiện tại có chứa khung giờ này không
          return schedule.scheduleData[dayIndex] && schedule.scheduleData[dayIndex].includes(slot);
        });
  
        return {
          slot,
          members: slotData.map(schedule => ({
            name: `Tên ${schedule.mssv}`, // Thay thế bằng tên thật nếu cần
            mssv: schedule.mssv
          }))
        };
      })
    }));
  
    console.log("data: ", organized);
  
    return organized;
  }
  