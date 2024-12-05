const router = require('express').Router();
const UserController = require('../controllers/user')

router.post('/login',UserController.login)
router.post('/forgot-password', UserController.createPasswordreset)
router.post('/reset-password', UserController.resetPassword)
router.get('/logout', UserController.logout)
module.exports = router;