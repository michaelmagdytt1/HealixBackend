const Alert = require('../models/Alert');

exports.saveAlerts = async (req, res) => {
  try {
    const { alerts } = req.body;

    // لو مفيش داتا جاية نرد بإيرور
    if (!alerts || alerts.length === 0) {
      return res.status(400).json({ message: "مفيش إنذارات مبعوتة من التطبيق" });
    }

    // بنظبط شكل الداتا عشان تتوافق مع الـ Model اللي لسه عاملينه
    const formattedAlerts = alerts.map(alert => ({
      alertId: alert.id,
      date: alert.date,
      riskLevel: alert.riskLevel,
      vitalsAtThatTime: alert.vitalsAtThatTime
    }));

    // حفظ الدفعة كلها مرة واحدة في الداتابيز
    await Alert.insertMany(formattedAlerts);

    res.status(200).json({ message: "تم حفظ الإنذارات في الداتابيز بنجاح!" });
  } catch (error) {
    console.error("❌ إيرور في حفظ الإنذارات السيرفر:", error);
    res.status(500).json({ message: "مشكلة داخلية في السيرفر" });
  }
};