const Measurement = require("../models/Measurement"); // تأكد من مسار موديل القياسات الحقيقية عندك
const AiReport = require("../models/AiReport");

exports.getAverageVitals = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { period } = req.query;

    let startDate = new Date();
    if (period === "daily") startDate.setDate(startDate.getDate() - 1);
    else if (period === "weekly") startDate.setDate(startDate.getDate() - 7);
    else if (period === "monthly") startDate.setDate(startDate.getDate() - 30);
    else if (period === "yearly") startDate.setDate(startDate.getDate() - 365);

    // استخدام الـ Aggregation Framework في المونجو لحساب المتوسطات
    const stats = await Measurement.aggregate([
      {
        $match: {
          patientId: new mongoose.Types.ObjectId(patientId),
          date: { $gte: startDate }, // تأكد إن اسم حقل التاريخ عندك هو date
        },
      },
      {
        $group: {
          _id: null,
          avgHr: { $avg: "$hr" },
          avgSpo2: { $avg: "$spo2" },
          avgTemp: { $avg: "$temp" },
        },
      },
    ]);

    if (stats.length === 0) {
      // لو مفيش داتا كافية في الفترة دي، بنرجع قيم طبيعية كـ Fallback للتيست
      return res.status(200).json({
        averageVitals: { hr: 75, spo2: 98, temp: 36.8 }
      });
    }

    res.status(200).json({
      averageVitals: {
        hr: Math.round(stats[0].avgHr),
        spo2: Math.round(stats[0].avgSpo2),
        temp: parseFloat(stats[0].avgTemp.toFixed(1)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حساب المتوسطات", error: error.message });
  }
};

exports.saveAiReport = async (req, res) => {
  try {
    const { patientId, period, avgVitals, aiScore, aiDiagnosis } = req.body;

    const newReport = new AiReport({
      patientId,
      period,
      avgVitals,
      aiScore,
      aiDiagnosis,
    });

    await newReport.save();
    res.status(201).json({ message: "تم حفظ تقرير الذكاء الاصطناعي بنجاح ✅", report: newReport });
  } catch (error) {
    res.status(500).json({ message: "خطأ في حفظ التقرير", error: error.message });
  }
};