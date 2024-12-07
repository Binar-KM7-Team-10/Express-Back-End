const router = require('express').Router();
const AuthController = require('../controllers/auth');
const Auth = require('../middlewares/restrict');

router.post('/register', AuthController.register);
router.post('/register/otp', AuthController.verify);
router.post('/register/otp/resend', AuthController.resend);
router.post('/login', AuthController.login)
router.post('/forgot-password', AuthController.createPasswordReset)
router.post('/reset-password', AuthController.resetPassword)
router.get('/logout', Auth.allUser, AuthController.logout)

module.exports = router;