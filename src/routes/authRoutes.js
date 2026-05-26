const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ==========================================
// Auth & Profile Routes
// ==========================================

// POST: http://localhost:3000/api/auth/login
router.post('/login', authController.login);

// POST: http://localhost:3000/api/auth/register
router.post('/register', authController.register);

// PUT: http://localhost:3000/api/auth/update-profile
// المسار لتحديث بيانات المريض لأول مرة (الاسم الثلاثي، العمر، الوزن، الطول، الجنس)
router.put('/update-profile', authController.updatePatientProfile);

// PUT: http://localhost:3000/api/auth/update-doctor-profile
// 🚀 المسار لتحديث بيانات الطبيب (الاسم، العيادة، الرقم القومي)
router.put('/update-doctor-profile', authController.updateDoctorProfile);

// PUT: http://localhost:3000/api/auth/update-family-profile
// 🚀 المسار الجديد لتحديث بيانات فرد العائلة (الاسم الثلاثي، نوع القرابة)
router.put('/update-family-profile', authController.updateFamilyProfile);

// GET: http://localhost:3000/api/auth/profile/:id
// 🚀 المسار لجلب بيانات المستخدم (مريض، طبيب، أو عائلة) وعرضها في شاشة البروفايل
router.get('/profile/:id', authController.getUserProfile);

// PUT: http://localhost:3000/api/auth/change-password
// 🚀 المسار لتغيير الباسورد من داخل البروفايل
router.put('/change-password', authController.changePassword);

module.exports = router;