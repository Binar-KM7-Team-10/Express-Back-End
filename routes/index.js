const router = require('express').Router();
const scheduleRoutes = require('./schedule');
const bookingRoutes = require('./booking');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const homepageRoutes = require('./homepage');
const notificationRoutes = require('./notification');

router.use(scheduleRoutes);
router.use(bookingRoutes);
router.use(userRoutes);
router.use(authRoutes);
router.use(homepageRoutes);
router.use(notificationRoutes);

module.exports = router;