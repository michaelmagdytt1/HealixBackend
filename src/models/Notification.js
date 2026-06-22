const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // مين اليوزر اللي رايحله الإشعار (ممكن مريض، دكتور، الخ)
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // نوع الإشعار عشان نحدد لونه والأيقونة في الموبايل
    type: { type: String, enum: ['alert', 'ai', 'message'], required: true },
    
    // عنوان وتفاصيل الإشعار
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    // هل اتقرأ ولا لسه (عشان لو حبيت تعمل بادج أرقام بعدين)
    isRead: { type: Boolean, default: false }
}, { timestamps: true }); // timestamps دي بتسجل الوقت أوتوماتيك عشان دالة timeAgo تشتغل

module.exports = mongoose.model('Notification', notificationSchema);