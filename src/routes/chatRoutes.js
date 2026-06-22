const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// مسار ربط الدكتور بالمريض
router.post('/link', chatController.linkDoctorAndPatient);

// مسار إرسال رسالة
router.post('/send', chatController.sendMessage);

// مسار جلب الرسايل (متطابق مع الموبايل)
router.get('/:user1/:user2', chatController.getMessages);

// مسار جلب دكاترة المريض (متطابق مع الموبايل)
router.get('/mydoctors/:patientId', chatController.getMyDoctors);

// 🚀 مسار إلغاء الربط (الجديد)
router.post('/unlink', chatController.unlinkDoctorAndPatient);

module.exports = router;