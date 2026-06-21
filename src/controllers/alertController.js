const Alert = require('../models/Alert');
const axios = require('axios'); // 🚀 استدعاء axios لإرسال طلبات لتليجرام

// 🔑 التوكن بتاع البوت بتاعك اللي جبناه من BotFather
const TELEGRAM_BOT_TOKEN = '8810466711:AAGGMGxs26ZitW4yamWzFnuhpDji7rWSFtg';

// دالة مساعدة لإرسال الرسالة إلى تليجرام
const sendTelegramNotification = async (chatId, alertData) => {
  try {
    const message = `
🚨 *تنبيه طبي عاجل من Healix!*

👤 *معرف المريض:* ${alertData.patientId}
📊 *مستوى الخطورة:* ${alertData.riskLevel}%
⏱️ *الوقت:* ${alertData.date}

🫀 *المؤشرات الحيوية وقت الإنذار:*
• نبضات القلب: ${alertData.vitalsAtThatTime.hr} BPM
• نسبة الأكسجين: ${alertData.vitalsAtThatTime.spo2}%
• درجة الحرارة: ${alertData.vitalsAtThatTime.temp}°C
    `;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    await axios.post(url, {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown' // عشان يظهر النص منسق
    });

    console.log("🔹 تم إرسال إنذار التليجرام بنجاح!");
  } catch (error) {
    console.error("❌ فشل إرسال رسالة التليجرام:", error.message);
  }
};

exports.saveAlerts = async (req, res) => {
  try {
    const { alerts } = req.body;

    if (!alerts || alerts.length === 0) {
      return res.status(400).json({ message: "مفيش إنذارات مبعوتة" });
    }

    const formattedAlerts = alerts.map(alert => ({
      patientId: alert.patientId,
      alertId: alert.id,
      date: alert.date,
      riskLevel: alert.riskLevel,
      vitalsAtThatTime: alert.vitalsAtThatTime
    }));

    // حفظ الإنذارات في قاعدة البيانات
    const savedAlerts = await Alert.insertMany(formattedAlerts);

    // 🚀 الـ Chat ID بتاعك اللي هيستلم الرسالة
    const TEST_CHAT_ID = '7829720963'; 
    
    // بنبعت أحدث إنذار تم حفظه للتليجرام
    if (savedAlerts.length > 0) {
        await sendTelegramNotification(TEST_CHAT_ID, savedAlerts[0]);
    }

    res.status(200).json({ message: "تم حفظ الإنذارات بنجاح وإرسالها للتليجرام!" });
  } catch (error) {
    console.error("❌ إيرور في حفظ الإنذارات السيرفر:", error);
    res.status(500).json({ message: "مشكلة داخلية في السيرفر" });
  }
};