const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

// المسار ده هيستقبل طلب الـ POST ويبعته للكونترولر
router.post('/', alertController.saveAlerts);

module.exports = router;