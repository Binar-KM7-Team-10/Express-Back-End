const router = require('express').Router();
const scheduleRoutes = require('./schedule');
const bookingRoutes = require('./booking');
const userRoutes = require('./user');
const authRoutes = require('./auth');
const homepageRoutes = require('./homepage');

router.use(scheduleRoutes);
router.use(bookingRoutes);
router.use(userRoutes);
router.use(authRoutes);
router.use(homepageRoutes);

module.exports = router;