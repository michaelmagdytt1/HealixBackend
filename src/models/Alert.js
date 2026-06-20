const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // غيرنا اسمها لـ alertId عشان مونجو بيعمل _id خاص بيه لوحده
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