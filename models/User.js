const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    mssv: {
      type: String,
      required: true,
      unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['guest', 'member', 'admin'], // Các vai trò
        default: 'guest'
    }
});

// Hash password trước khi lưu vào DB
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Phương thức kiểm tra mật khẩu
UserSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
