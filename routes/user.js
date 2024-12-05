const router = require('express').Router();
const UserControllers = require('../controllers/user');

router.get('/users', UserControllers.getAll);
router.get('/users/:id', UserControllers.getById);
router.post('/users', UserControllers.create);
router.patch('/users/:id', UserControllers.update);
router.delete('/users/:id', UserControllers.delete);

module.exports = router;