const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// مسار ربط الدكتور بالمريض
router.post('/link', chatController.linkDoctorAndPatient);

// مسار إرسال رسالة
router.post('/send', chatController.sendMessage);

// مسار إلغاء الربط (الجديد)
router.post('/unlink', chatController.unlinkDoctorAndPatient);

// 🚀 مسار جلب دكاترة المريض (لازم يكون فوق المسار المتغير عشان ميتبلعش)
router.get('/mydoctors/:patientId', chatController.getMyDoctors);

// مسار جلب الرسايل (متطابق مع الموبايل - لازم يكون آخر واحد تحت)
router.get('/:user1/:user2', chatController.getMessages);

module.exports = router;