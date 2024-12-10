const router = require('express').Router();
const BookingController = require('../controllers/booking');
const Auth = require('../middlewares/restrict');

router.get('/bookings', Auth.admin, BookingController.getAll);
router.get('/bookings/:id', Auth.admin, BookingController.getDTO);



module.exports = router;