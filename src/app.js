const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // 1. استدعاء مكتبة المونجو
require('dotenv').config();           // 2. تفعيل قراءة ملف الـ .env

// استدعاء الروابط (Routes)
const authRoutes = require('./routes/authRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// --- 3. كود الاتصال بقاعدة البيانات ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));
// --------------------------------------

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);     // بوابات الدخول
app.use('/api/health', healthRoutes); // بوابات القراءات الصحية

// تجربة إن السيرفر شغال
app.get('/', (req, res) => {
    res.send('Healix Backend Server is Running... 🟢');
});

module.exports = app;