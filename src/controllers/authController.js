const User = require('../models/User'); // استدعاء الموديل الحقيقي

// --- تسجيل دخول (Login) ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && user.password === password) {
            return res.status(200).json({
                message: "تم تسجيل الدخول بنجاح ✅",
                user: {
                    _id: user._id, // تأكدنا من استخدام _id
                    name: user.name,
                    role: user.role,
                    email: user.email
                }
            });
        } else {
            return res.status(401).json({ message: "الإيميل أو كلمة السر خطأ ❌" });
        }

    } catch (error) {
        res.status(500).json({ error: "خطأ في السيرفر: " + error.message });
    }
};

// --- تسجيل حساب جديد (Register) ---
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "هذا الإيميل مسجل بالفعل ⚠️" });
        }

        const newUser = new User({
            name,
            email,
            password,
            role: role || 'patient'
        });

        await newUser.save();

        res.status(201).json({ 
            message: "تم إنشاء الحساب بنجاح! 🎉",
            user: { // غيرنا الكلمة من data لـ user عشان الموبايل يلقطها صح
                _id: newUser._id,
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role 
            }
        });

    } catch (error) {
        res.status(500).json({ error: "خطأ أثناء التسجيل: " + error.message });
    }
};

// --- تحديث بيانات المريض (Patient Profile Setup) ---
exports.updatePatientProfile = async (req, res) => {
    try {
        const { userId, fullName, age, weight, height, gender } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                fullName: fullName, // حفظنا الاسم الثلاثي في حقل لوحده عشان ميمسحش اليوزر نيم
                age, 
                weight, 
                height, 
                gender 
            },
            { new: true } // يرجع البيانات الجديدة بعد التعديل
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "المستخدم غير موجود ❌" });
        }

        res.status(200).json({ 
            message: "تم تحديث الملف بنجاح ✅", 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// --- 🚀 تحديث بيانات الدكتور (Doctor Profile Setup) ---
exports.updateDoctorProfile = async (req, res) => {
    try {
        const { userId, fullName, clinicName, nationalId } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, clinicName, nationalId },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "المستخدم غير موجود ❌" });
        }

        res.status(200).json({ 
            message: "تم تحديث بيانات الطبيب بنجاح ✅", 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// --- 🚀 تحديث بيانات فرد العائلة (Family Profile Setup) ---
exports.updateFamilyProfile = async (req, res) => {
    try {
        const { userId, fullName, relation } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, relation }, // relation: نوع القرابة
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "المستخدم غير موجود ❌" });
        }

        res.status(200).json({ 
            message: "تم تحديث بيانات العائلة بنجاح ✅", 
            user: updatedUser 
        });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// --- جلب بيانات المستخدم للبروفايل (سواء دكتور أو مريض) ---
exports.getUserProfile = async (req, res) => {
    try {
        // بنجيب البيانات من غير الباسورد عشان الأمان (select('-password'))
        const user = await User.findById(req.params.id).select('-password'); 
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};

// --- تغيير كلمة المرور ---
exports.changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "المستخدم غير موجود" });
        }

        // التأكد من الباسورد القديم
        if (user.password !== oldPassword) {
            return res.status(400).json({ message: "كلمة المرور القديمة غير صحيحة ❌" });
        }

        // تحديث الباسورد
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح ✅" });
    } catch (error) {
        res.status(500).json({ message: "خطأ في السيرفر", error: error.message });
    }
};