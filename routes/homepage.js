const router = require('express').Router();
const HomepageController = require('../controllers/homepage');

router.get('/homepage', HomepageController.getAll);

module.exports = router;