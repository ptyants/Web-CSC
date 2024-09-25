const express = require('express');
const router = express.Router();

// Import các route
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const scheduleRoutes = require('./routes/schedule');
const contactRoutes = require('./routes/contact');
const dashboardRoutes = require('./routes/dashboard');
const membersRouter = require('./routes/members')
const attendRouter = require('./routes/attend')

// Sử dụng các route
router.use(authRoutes);
router.use(postRoutes);
router.use(scheduleRoutes);
router.use(contactRoutes);
router.use(dashboardRoutes);
router.use(membersRouter);
router.use(attendRouter);

module.exports = router;
