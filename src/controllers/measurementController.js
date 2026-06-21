const Measurement = require('../models/Measurement');
const Alert = require('../models/Alert'); 
const axios = require('axios'); 

// 🌐 لينك موديل الذكاء الاصطناعي بتاعك على Railway
const AI_API_URL = "https://healix-ai-api-production.up.railway.app/predict";

// 🧠 دالة مساعدة للتواصل مع الذكاء الاصطناعي
const getAIDiagnosis = async (vitals) => {
    try {
        const payload = {
            hr: vitals.hr,
            spo2: vitals.spo2,
            temp: vitals.temp,
            age: 30, 
            sex_enc: 1 
        };

        const response = await axios.post(AI_API_URL, payload);
        console.log("🤖 تشخيص الذكاء الاصطناعي:", response.data);
        return response.data; 
    } catch (error) {
        console.error("❌ فشل الاتصال بسيرفر الذكاء الاصطناعي:", error.message);
        return null;
    }
};

// 1️⃣ دالة لاستلام القياسات، فحصها بالـ AI، وحفظها
exports.addMeasurement = async (req, res) => {
    try {
        const { patientId, hr, spo2, temp, steps, fall } = req.body;

        // 🚀 نسأل الذكاء الاصطناعي رأيه في القرايات دي قبل أي حاجة!
        const aiResult = await getAIDiagnosis({ hr, spo2, temp });

        let aiStatus = "Normal";
        let severityScore = 0;

        if (aiResult && aiResult.status === "success") {
            aiStatus = aiResult.prediction; // هيطلع "Normal" أو "Danger"
            severityScore = aiResult.severity_score;

            if (aiStatus === "Danger") {
                console.log("🚨 الذكاء الاصطناعي بيقول إن المريض ده في خطر!");
            }
        }

        // حفظ القراءات وتشخيص الـ AI في الداتابيز
        const newMeasurement = new Measurement({
            patientId, // 👈 الربط بالمريض
            hr,
            spo2,
            temp,
            steps,
            fall,
            aiDiagnosis: aiStatus,         // 👈 حفظ تشخيص الذكاء الاصطناعي
            aiSeverityScore: severityScore // 👈 حفظ نسبة الخطورة
        });

        await newMeasurement.save();

        // الرد على الموبايل شامل تشخيص الذكاء الاصطناعي
        res.status(201).json({ 
            message: "تم حفظ القياسات بنجاح!", 
            data: newMeasurement,
            ai_diagnosis: aiStatus, 
            ai_severity_score: severityScore
        });

    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// 2️⃣ دالة لجلب آخر قراءة للمريض في تاريخ محدد
exports.getHistoryByDate = async (req, res) => {
    try {
        const { patientId, date } = req.params;

        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const measurement = await Measurement.findOne({
            patientId: patientId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ createdAt: -1 }); 

        if (!measurement) {
            return res.status(404).json({ message: "لا توجد بيانات لهذا التاريخ." });
        }

        res.status(200).json({ measurements: measurement });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// 3️⃣ دالة لجلب بيانات الرسم البياني
exports.getChartData = async (req, res) => {
    try {
        const { patientId, vitalType } = req.params; 
        const { range } = req.query; 

        let startDate = new Date();
        if (range === 'Week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (range === 'Month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else {
            startDate.setHours(0, 0, 0, 0);
        }

        const measurements = await Measurement.find({
            patientId: patientId,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 }); 

        let labels = [];
        let data = [];

        const limitedMeasurements = measurements.slice(-6); 

        limitedMeasurements.forEach(m => {
            if (m[vitalType] !== undefined && m[vitalType] !== 0) {
                const date = new Date(m.createdAt);
                labels.push(`${date.getHours()}:${date.getMinutes()}`);
                data.push(m[vitalType]);
            }
        });

        if (labels.length === 0) {
            labels = ["No Data"];
            data = [0];
        }

        res.status(200).json({ labels, data });
    } catch (error) {
        console.error("Error fetching chart data:", error);
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// 4️⃣ دالة جلب بيانات لوحة تحكم الطبيب (Dashboard)
exports.getDashboardData = async (req, res) => {
    try {
        const { patientId } = req.params;

        // 1. جلب أحدث قراءة
        const latestMeasurement = await Measurement.findOne({ patientId }).sort({ createdAt: -1 });

        // 2. جلب قراءات آخر 7 أيام لحساب المتوسطات
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMeasurements = await Measurement.find({
            patientId,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: -1 }); 

        // تجهيز المتغيرات الافتراضية
        let currentVitals = { hr: 0, spo2: 0, temp: 0, steps: 0 };
        let avgVitals = { hr: 0, spo2: 0, temp: 0 };
        
        let currentAiDiagnosis = "Normal"; // 👈 متغير جديد
        let currentAiSeverity = 0;         // 👈 متغير جديد

        if (latestMeasurement) {
            currentVitals = {
                hr: latestMeasurement.hr,
                spo2: latestMeasurement.spo2,
                temp: latestMeasurement.temp,
                steps: latestMeasurement.steps
            };
            
            // 👈 سحبنا بيانات الـ AI من الداتابيز عشان نعرضها في الشاشة
            currentAiDiagnosis = latestMeasurement.aiDiagnosis || "Normal";
            currentAiSeverity = latestMeasurement.aiSeverityScore || 0;
        }

        if (recentMeasurements.length > 0) {
            let totalHr = 0, totalSpo2 = 0, totalTemp = 0;
            
            recentMeasurements.forEach(m => {
                totalHr += m.hr;
                totalSpo2 += m.spo2;
                totalTemp += m.temp;
            });

            avgVitals = {
                hr: Math.round(totalHr / recentMeasurements.length),
                spo2: Math.round(totalSpo2 / recentMeasurements.length),
                temp: parseFloat((totalTemp / recentMeasurements.length).toFixed(1))
            };
        }

        // 3. جلب الإنذارات الحقيقية الخاصة بالمريض
        const realAlerts = await Alert.find({ patientId })
            .sort({ createdAt: -1 }) 
            .limit(5); 

        // 4. إرسال البيانات النهائية للموبايل
        res.status(200).json({
            currentVitals,
            avgVitals,
            alerts: realAlerts,
            aiDiagnosis: currentAiDiagnosis,     // 👈 باعتين تشخيص الذكاء الاصطناعي
            aiSeverityScore: currentAiSeverity   // 👈 باعتين نسبة الخطورة
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};