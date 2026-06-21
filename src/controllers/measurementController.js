const Measurement = require('../models/Measurement');
const Alert = require('../models/Alert'); // 🚀 السطر ده جديد عشان نقرأ الإنذارات الحقيقية

// دالة لاستلام القياسات وحفظها
exports.addMeasurement = async (req, res) => {
    try {
        const { patientId, hr, spo2, temp, steps, fall } = req.body;

        const newMeasurement = new Measurement({
            patientId,
            hr,
            spo2,
            temp,
            steps,
            fall
        });

        await newMeasurement.save();
        res.status(201).json({ message: "تم حفظ القياسات بنجاح!", data: newMeasurement });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// دالة لجلب آخر قراءة للمريض في تاريخ محدد
exports.getHistoryByDate = async (req, res) => {
    try {
        const { patientId, date } = req.params;

        // تحديد بداية ونهاية اليوم المختار (عشان نبحث في نطاق 24 ساعة)
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        // البحث عن آخر قراءة سجلها المريض في هذا اليوم
        const measurement = await Measurement.findOne({
            patientId: patientId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ createdAt: -1 }); // ترتيب تنازلي لجلب الأحدث

        if (!measurement) {
            return res.status(404).json({ message: "لا توجد بيانات لهذا التاريخ." });
        }

        res.status(200).json({ measurements: measurement });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// دالة لجلب بيانات الرسم البياني
exports.getChartData = async (req, res) => {
    try {
        const { patientId, vitalType } = req.params; // vitalType: hr, temp, spo2, steps
        const { range } = req.query; // Day, Week, Month

        // تحديد البداية بناءً على الفلتر
        let startDate = new Date();
        if (range === 'Week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (range === 'Month') {
            startDate.setMonth(startDate.getMonth() - 1);
        } else {
            // Day
            startDate.setHours(0, 0, 0, 0);
        }

        // جلب القراءات
        const measurements = await Measurement.find({
            patientId: patientId,
            createdAt: { $gte: startDate }
        }).sort({ createdAt: 1 }); // ترتيب تصاعدي عشان الرسم البياني من القديم للحديث

        // تجهيز الداتا للرسم البياني
        let labels = [];
        let data = [];

        // تبسيط: بناخد آخر 6 قراءات عشان الرسم البياني ميبقاش زحمة
        const limitedMeasurements = measurements.slice(-6); 

        limitedMeasurements.forEach(m => {
            if (m[vitalType] !== undefined && m[vitalType] !== 0) {
                // استخراج الساعة كـ Label (مثال: 10:30)
                const date = new Date(m.createdAt);
                labels.push(`${date.getHours()}:${date.getMinutes()}`);
                data.push(m[vitalType]);
            }
        });

        // لو مفيش داتا خالص نرجع أصفار
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

// --- 🚀 الدالة الجديدة: جلب بيانات لوحة تحكم الطبيب (Dashboard) ---
exports.getDashboardData = async (req, res) => {
    try {
        const { patientId } = req.params;

        // 1. جلب أحدث قراءة (Current Vitals)
        const latestMeasurement = await Measurement.findOne({ patientId }).sort({ createdAt: -1 });

        // 2. جلب قراءات آخر 7 أيام لحساب المتوسطات
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMeasurements = await Measurement.find({
            patientId,
            createdAt: { $gte: sevenDaysAgo }
        }).sort({ createdAt: -1 }); // بنرتب من الأحدث للأقدم

        // تجهيز المتغيرات الافتراضية للقرايات
        let currentVitals = { hr: 0, spo2: 0, temp: 0, steps: 0 };
        let avgVitals = { hr: 0, spo2: 0, temp: 0 };

        if (latestMeasurement) {
            currentVitals = {
                hr: latestMeasurement.hr,
                spo2: latestMeasurement.spo2,
                temp: latestMeasurement.temp,
                steps: latestMeasurement.steps
            };
        }

        if (recentMeasurements.length > 0) {
            // حساب المتوسطات فقط
            let totalHr = 0, totalSpo2 = 0, totalTemp = 0;
            
            recentMeasurements.forEach(m => {
                totalHr += m.hr;
                totalSpo2 += m.spo2;
                totalTemp += m.temp;
            });

            // تقريب نواتج المتوسطات
            avgVitals = {
                hr: Math.round(totalHr / recentMeasurements.length),
                spo2: Math.round(totalSpo2 / recentMeasurements.length),
                temp: parseFloat((totalTemp / recentMeasurements.length).toFixed(1))
            };
        }

        // 🚀 3. جلب الإنذارات الحقيقية الخاصة بالمريض ده من الداتابيز
        const realAlerts = await Alert.find({ patientId })
            .sort({ createdAt: -1 }) // الأحدث الأول
            .limit(5); // أحدث 5 إنذارات عشان الشاشة متزحمش

        // إرسال البيانات بنفس الشكل اللي الموبايل مستنيه بالظبط
        res.status(200).json({
            currentVitals,
            avgVitals,
            alerts: realAlerts // 👈 هنا بعتنا الإنذارات الحقيقية
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};