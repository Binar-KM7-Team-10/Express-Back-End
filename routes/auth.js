const router = require('express').Router();
const passport = require('passport');
const AuthController = require('../controllers/auth');
const Auth = require('../middlewares/restrict');
const PassportOauth = require('../utils/passportOauth');

router.post('/register', AuthController.register);
router.post('/register/otp', AuthController.verify);
router.post('/register/otp/resend', AuthController.resend);
router.post('/login', AuthController.login)
router.post('/forgot-password', AuthController.createPasswordReset)
router.post('/reset-password', AuthController.resetPassword)
router.get('/logout', Auth.allUser, AuthController.logout)
router.get('/auth', AuthController.authenticate);
router.get('/oauth', passport.authenticate("google", {scope : ['profile', 'email']}));
router.get('/callback', passport.authenticate("google", {
    failureRedirect: '/auth',
}), AuthController.handleOauth
// (req, res) => {
//     console.log('User successfully authenticated:', req.user);
//     res.redirect('/tes');
);

module.exports = router;