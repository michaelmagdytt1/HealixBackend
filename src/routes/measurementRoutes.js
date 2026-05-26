const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');

// 1. اللينك اللي الموبايل بيبعت عليه الداتا (إضافة قياس جديد)
router.post('/add', measurementController.addMeasurement);

// 2. اللينك اللي الموبايل هيقرأ منه الهيستوري بناءً على الـ ID والتاريخ
router.get('/history/:patientId/:date', measurementController.getHistoryByDate);

// 3. اللينك بتاع الرسم البياني
router.get('/chart/:patientId/:vitalType', measurementController.getChartData);

// 4. 🚀 اللينك الجديد اللي شاشة الدكتور بتسحب منه الداتا الحقيقية والتنبيهات
router.get('/dashboard/:patientId', measurementController.getDashboardData);

module.exports = router;