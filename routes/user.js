const router = require('express').Router();
const UserControllers = require('../controllers/user');

router.get('/users', UserControllers.getAll);
router.get('/users/{userId}', UserControllers.getById);
router.post('/users', UserControllers.create);
router.put('/users', UserControllers.update);
router.delete('/users', UserControllers.delete);

module.exports = router;