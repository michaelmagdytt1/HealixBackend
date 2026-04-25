const User = require('../models/User'); // استدعاء الموديل الحقيقي

// --- تسجيل دخول (Login) ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // البحث عن المستخدم في الداتابيز بالإيميل
        const user = await User.findOne({ email });

        // التأكد من وجود المستخدم ومطابقة كلمة السر
        // (ملحوظة: في المستقبل يفضل استخدام bcrypt لتشفير الباسورد)
        if (user && user.password === password) {
            return res.status(200).json({
                message: "تم تسجيل الدخول بنجاح ✅",
                user: {
                    id: user._id,
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

        // التأكد إذا كان الإيميل مسجل مسبقاً
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "هذا الإيميل مسجل بالفعل ⚠️" });
        }

        // إنشاء مستخدم جديد وحفظه في الداتابيز
        const newUser = new User({
            name,
            email,
            password, // سيتم تخزينها كما هي (للتجربة حالياً)
            role: role || 'patient' // القيمة الافتراضية مريض
        });

        await newUser.save();

        res.status(201).json({ 
            message: "تم إنشاء الحساب بنجاح! 🎉",
            data: { 
                id: newUser._id,
                name: newUser.name, 
                email: newUser.email, 
                role: newUser.role 
            }
        });

    } catch (error) {
        res.status(500).json({ error: "خطأ أثناء التسجيل: " + error.message });
    }
};