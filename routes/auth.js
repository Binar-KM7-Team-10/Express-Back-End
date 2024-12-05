const router = require('express').Router();
const AuthController = require ('../controllers/auth');

router.post('/register', AuthController.register);
router.post('/register/otp', AuthController.verify);
router.post('/register/otp/resend', AuthController.resend);


module.exports = router;