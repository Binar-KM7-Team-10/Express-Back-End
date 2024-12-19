const router = require('express').Router();
const NotificationController = require('../controllers/notification');
const Auth = require('../middlewares/restrict');

router.get('/notifications', NotificationController.getAll);
router.get('/notifications/:id', NotificationController.getById);
router.patch('/notifications/:id', NotificationController.patch);

module.exports = router;