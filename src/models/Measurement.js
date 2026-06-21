const mongoose = require('mongoose');

const measurementSchema = new mongoose.Schema({
  // ربط القراءة بالمريض
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient', 
    required: true 
  },
  
  // القياسات اللي السوار بيبعتها
  hr: { 
    type: Number,
    required: true
  },
  spo2: { 
    type: Number,
    required: true
  },
  temp: { 
    type: Number,
    required: true
  },
  steps: { 
    type: Number,
    required: true
  },
  fall: { 
    type: Boolean,
    required: true
  },

  // 🤖 الحقول الجديدة الخاصة بتشخيص الذكاء الاصطناعي
  aiDiagnosis: { 
    type: String, 
    default: "Normal" 
  },
  aiSeverityScore: { 
    type: Number, 
    default: 0 
  }

}, { timestamps: true });

module.exports = mongoose.model('Measurement', measurementSchema);