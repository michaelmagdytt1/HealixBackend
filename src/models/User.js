const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // اليوزر نيم (بيجي من شاشة الـ Sign Up وبيتعرض في الهوم)
  name: { type: String, required: true }, 
  
  // الاسم الثلاثي (بيجي من شاشات الـ Profile Setup للمريض، الدكتور، أو العائلة)
  fullName: { type: String }, 
  
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'family'], default: 'patient' },
  
  // 👇 البيانات الخاصة ببروفايل المريض
  age: { type: Number },
  weight: { type: Number }, // بالكيلوجرام
  height: { type: Number }, // بالسنتيمتر
  gender: { type: String }, 

  // 👇 البيانات الخاصة ببروفايل الدكتور
  clinicName: { type: String }, // اسم العيادة
  nationalId: { type: String }, // الرقم القومي (14 رقم)

  // 👇 الحقل الخاص ببروفايل فرد العائلة
  relation: { type: String }, // نوع القرابة (أب، أم، ابن...)

  // 👇 🔗 روابط المتابعة والشات
  linkedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  linkedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
}, { timestamps: true }); // 🚀 السطر ده بيسجل الوقت والتاريخ أوتوماتيك باحترافية

module.exports = mongoose.model('User', userSchema);