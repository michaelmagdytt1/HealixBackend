const Alert = require('../models/Alert');

exports.saveAlerts = async (req, res) => {
  try {
    const { alerts } = req.body;

    if (!alerts || alerts.length === 0) {
      return res.status(400).json({ message: "مفيش إنذارات مبعوتة" });
    }

    // بنقل الـ patientId من الفرونت إند للباك إند
    const formattedAlerts = alerts.map(alert => ({
      patientId: alert.patientId, // 👈 السطر الجديد
      alertId: alert.id,
      date: alert.date,
      riskLevel: alert.riskLevel,
      vitalsAtThatTime: alert.vitalsAtThatTime
    }));

    await Alert.insertMany(formattedAlerts);

    res.status(200).json({ message: "تم حفظ الإنذارات بنجاح وفصلها لكل مريض!" });
  } catch (error) {
    console.error("❌ إيرور في حفظ الإنذارات السيرفر:", error);
    res.status(500).json({ message: "مشكلة داخلية في السيرفر" });
  }
};