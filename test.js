
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/club', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
}).then(() => {
    console.log('Kết nối MongoDB thành công');
}).catch(err => {
    console.error('Không thể kết nối đến MongoDB:', err.message);
});