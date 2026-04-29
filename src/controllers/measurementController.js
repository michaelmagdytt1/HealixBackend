const Measurement = require('../models/Measurement');

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