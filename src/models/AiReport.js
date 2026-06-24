const mongoose = require("mongoose");

const AiReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // تأكد من اسم موديل المستخدمين عندك
    required: true,
  },
  period: {
    type: String,
    enum: ["daily", "weekly", "monthly", "yearly"],
    required: true,
  },
  avgVitals: {
    hr: { type: Number, default: 0 },
    spo2: { type: Number, default: 0 },
    temp: { type: Number, default: 0 },
  },
  aiScore: {
    type: Number,
    required: true,
  },
  aiDiagnosis: {
    type: String,
    required: true,
  },
  dateAnalyzed: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AiReport", AiReportSchema);