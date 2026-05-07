const express = require('express');
const router = express.Router();
const { verifierToken, verifierAdmin } = require('../middleware/auth');
const { getStats } = require('../controllers/statsController');

router.get('/', verifierToken, verifierAdmin, getStats);

module.exports = router;
