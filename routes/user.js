const router = require('express').Router();
const UserController = require('../controllers/user');

router.get('/users', UserController.getAll);
router.get('/users/:id', UserController.getById);
router.post('/users', UserController.create);
router.patch('/users/:id', UserController.update);
router.delete('/users/:id', UserController.delete);

module.exports = router;
