
// const Schema = mongoose.Schema;

// const scheduleSchema = new Schema({
//     member: { type: String, required: true },
//     date: { type: String, required: true }, // Ngày trong tuần: "Thứ 2", "Thứ 3", ...
//     timeSlots: {
//         type: [String], // Các ca trực: ["7h50 - 11h15", "13h35 - 17h", ...]
//         required: true
//     },
//     registrationDate: { type: Date, default: Date.now }, // Ngày đăng ký lịch trực
//     status: { type: String, default: 'Pending' } // Trạng thái: Pending, Approved, Rejected
// });

// const scheduleSchema = new Schema({
//     mssv: { type: String, required: true }, // MSSV là bắt buộc
//     dates: [{
//         day: { type: Number, required: true }, // Ngày trong tuần (1: Mon, 7: Sun)
//         timeSlot: { type: String, required: true }, // Khung giờ
//     }],
//     registrationTime: { type: Date, default: Date.now }, // Thời gian đăng ký
//     status: { type: String, default: 'Pending' } // Trạng thái: Pending, Approved, Rejected
// });

// const mongoose = require('mongoose');
// const scheduleSchema = new mongoose.Schema({
//     mssv: String,
//     dates: [Date],
//     timeSlots: {
//       type: [String], // Đảm bảo là một mảng các chuỗi
//       default: []
//     },
//     registrationTime: { type: Date, default: Date.now },
//     status: { type: String, default: 'Pending' }
//   });
  

// module.exports = mongoose.model('Schedule', scheduleSchema);


const mongoose = require('mongoose');

// Định nghĩa schema cho lịch trực
const scheduleSchema = new mongoose.Schema({
  mssv: String,
  scheduleData: {
    type: Map,
    of: [String], // Mỗi key là một ngày (dạng chỉ số ngày), giá trị là một mảng khung giờ
    default: {}
  },
  registrationTime: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending' }
});

module.exports = mongoose.model('Schedule', scheduleSchema);