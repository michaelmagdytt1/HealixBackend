const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');

// العنوان اللي الموبايل هيبعت عليه الداتا
router.post('/add', measurementController.addMeasurement);

module.exports = router;