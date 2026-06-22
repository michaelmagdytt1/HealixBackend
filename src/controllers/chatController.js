const Message = require('../models/Message');
const User = require('../models/User');

// 1. ربط المريض بالدكتور (لما الدكتور يضيف الـ ID بتاع المريض)
exports.linkDoctorAndPatient = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;
        
        // إضافة المريض لقائمة الدكتور، والدكتور لقائمة المريض (بدون تكرار)
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

// 3. جلب الرسايل بين شخصين (دكتور ومريض)
exports.getMessages = async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ createdAt: 1 }); // ترتيب من القديم للجديد
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. 🚀 جلب قائمة الدكاترة الضايفين مريض معين (المريض بيشوف مين ضافه)
exports.getMyDoctors = async (req, res) => {
    try {
        const { patientId } = req.params;

        // السحر هنا: بنبحث عن أي مستخدم دوره "دكتور" وجوه قائمة مرضاه الـ ID بتاع المريض ده
        const doctors = await User.find({
            role: 'doctor',
            linkedPatients: patientId 
        }).select('name fullName clinicName'); // بنجيب بس الاسم والعيادة عشان السرعة والأمان

        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. 🚀 إلغاء ربط المريض بالطبيب (المستقبلة من زرار الـ Unlink الجديد)
exports.unlinkDoctorAndPatient = async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;
        
        // إزالة الـ ID الخاص بكل طرف من قائمة الطرف الآخر
        await User.findByIdAndUpdate(doctorId, { $pull: { linkedPatients: patientId } });
        await User.findByIdAndUpdate(patientId, { $pull: { linkedDoctors: doctorId } });

        res.status(200).json({ message: "تم إلغاء ربط المريض بالطبيب بنجاح!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};