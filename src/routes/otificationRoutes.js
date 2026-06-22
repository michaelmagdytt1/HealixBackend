const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// مسار جلب الإشعارات
router.get('/:userId', notificationController.getNotifications);

// مسار حذف إشعار
router.delete('/:id', notificationController.deleteNotification);

// مسار إنشاء إشعار جديد
router.post('/', notificationController.createNotification);

module.exports = router;