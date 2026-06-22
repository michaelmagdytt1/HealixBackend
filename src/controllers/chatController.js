const Message = require('../models/Message');
const User = require('../models/User');

// 1. ربط المريض بالدكتور
exports.linkDoctorAndPatient = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;
        
        if (!doctorId || !patientId) {
            return res.status(400).json({ message: "Doctor ID or Patient ID is missing" });
        }

        // إضافة المريض لقائمة الدكتور، والدكتور لقائمة المريض
        await User.findByIdAndUpdate(doctorId, { $addToSet: { linkedPatients: patientId } });
        await User.findByIdAndUpdate(patientId, { $addToSet: { linkedDoctors: doctorId } });

        res.status(200).json({ message: "تم ربط المريض بالطبيب بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. إرسال رسالة
exports.sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, text } = req.body;
        const newMessage = new Message({ sender: senderId, receiver: receiverId, text });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. جلب الرسايل بين شخصين
exports.getMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ createdAt: 1 }); 
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. 🚀 جلب قائمة الدكاترة 
exports.getMyDoctors = async (req, res) => {
    try {
        // 🚀 تأمين: بيقرأ البراميتر سواء كان اسمه patientId أو id في الـ Route
        const patientId = req.params.patientId || req.params.id;

        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        // السحر هنا: بنبحث عن دكتور جوه قائمة مرضاه المريض ده
        const doctors = await User.find({
            role: { $in: ['doctor', 'Doctor'] }, // تأمين لحالة الحروف
            linkedPatients: patientId 
        }).select('name fullName clinicName'); 

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. 🚀 إلغاء ربط المريض بالطبيب
exports.unlinkDoctorAndPatient = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;
        
        await User.findByIdAndUpdate(doctorId, { $pull: { linkedPatients: patientId } });
        await User.findByIdAndUpdate(patientId, { $pull: { linkedDoctors: doctorId } });

        res.status(200).json({ message: "تم إلغاء ربط المريض بالطبيب بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};