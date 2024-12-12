const router = require('express').Router();
const BookingController = require('../controllers/booking');
const Auth = require('../middlewares/restrict');

router.get('/bookings', Auth.sameUserQuery, BookingController.getAll);
router.get('/bookings/:id', Auth.sameUserParamBooking, BookingController.getById);
router.post('/bookings', BookingController.create);



module.exports = router;