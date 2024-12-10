const router = require('express').Router();
const UserController = require('../controllers/user');
const Auth = require('../middlewares/restrict');

router.get('/users', Auth.admin, UserController.getAll);
router.get('/users/:id', Auth.sameUserParam, UserController.getById);
router.post('/users', Auth.admin, UserController.create);
router.patch('/users/:id', Auth.sameUserParam, UserController.update);
router.delete('/users/:id', Auth.admin, UserController.delete);

module.exports = router;