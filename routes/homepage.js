const router = require('express').Router();
const HomepageController = require('../controllers/homepage');

router.get('/homepage', HomepageController.getAll);
router.get('/cities', HomepageController.getCity);

module.exports = router;