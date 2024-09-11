const mongoose = require('mongoose');

// Tạo schema cho Contact
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }  // Tự động lưu ngày giờ hiện tại
});


module.exports = mongoose.model('Contact', contactSchema);
