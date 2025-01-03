const router = require('express').Router();
const NotificationController = require('../controllers/notification');
const Auth = require('../middlewares/restrict');

router.get('/notifications', Auth.sameUserQueryNotification, NotificationController.getAll);
router.get('/notifications/:id', Auth.sameUserParamNotification, NotificationController.getById);
router.patch('/notifications/:id', Auth.sameUserParamNotification, NotificationController.patch);

module.exports = router;