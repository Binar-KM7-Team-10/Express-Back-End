const router = require('express').Router();
const AuthController = require('../controllers/auth')

router.post('/login',AuthController.login)
router.post('/forgot-password', AuthController.createPasswordreset)
router.post('/reset-password', AuthController.resetPassword)
router.get('/logout', AuthController.logout)

module.exports = router;