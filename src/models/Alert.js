const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  patientId: { type: String, required: true }, // 👈 السطر الجديد لحفظ معرف المريض
  alertId: { type: String, required: true }, 
  date: { type: String, required: true },
  riskLevel: { type: String, required: true },
  vitalsAtThatTime: {
    hr: { type: Number },
    spo2: { type: Number },
    temp: { type: Number }
  }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);