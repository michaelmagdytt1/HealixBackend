const Notification = require('../models/Notification');

// 1. جلب إشعارات مستخدم معين (بترجع الجديد الأول)
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. حذف إشعار (لما اليوزر يعمل Swipe)
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await Notification.findByIdAndDelete(id);
        res.status(200).json({ message: "تم حذف الإشعار بنجاح" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. إنشاء إشعار (هتحتاجها عشان تبعت إشعارات للتجربة من Postman أو من السيستم بتاعك)
exports.createNotification = async (req, res) => {
    try {
        const { userId, type, title, message } = req.body;
        const newNotification = new Notification({ userId, type, title, message });
        await newNotification.save();
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};