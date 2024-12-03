const router = require('express').Router();
const auth = require ('../controllers/auth');

router.post('/register', auth.register);
router.post('/register/otp', auth.verify);
router.post('/register/otp/resend', auth.resend);


module.exports = router;