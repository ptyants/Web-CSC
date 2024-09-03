const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

const scheduleSchema = new Schema({
    mssv: String, // Thêm MSSV
    dates: [Date], // Cho phép nhiều ngày
    timeSlots: [String], // Các khung giờ
    registrationTime: { type: Date, default: Date.now }, // Thời gian đăng ký
    status: { type: String, default: 'Pending' } // Trạng thái: Pending, Approved, Rejected
});

module.exports = mongoose.model('Schedule', scheduleSchema);
