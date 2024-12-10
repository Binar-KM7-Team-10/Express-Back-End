const router = require('express').Router();
const ScheduleController = require('../controllers/schedule');
const Auth = require('../middlewares/restrict');

router.get('/schedules', ScheduleController.getAll);
router.get('/schedules/:id', ScheduleController.getById);
router.post('/schedules', Auth.admin, ScheduleController.create);
router.delete('/schedules/:id', Auth.admin, ScheduleController.delete);
router.patch('/schedules/:id', Auth.admin, ScheduleController.editById);

module.exports = router;
