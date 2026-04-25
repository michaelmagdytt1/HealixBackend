require('dotenv').config();
const app = require('./src/app');
const { GoogleGenerativeAI } = require("@google/generative-ai"); // 👈 1. استدعاء مكتبة الذكاء الاصطناعي

const PORT = process.env.PORT || 3000;

// 👈 2. تهيئة الموديل باستخدام المفتاح اللي في ملف .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 👈 3. مسار الشات (API Route) اللي الموبايل هيكلمه
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    // استخدام موديل Gemini السريع
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // الـ Prompt ده هو "شخصية" الـ AI، بنفهمه هو مين وبيعمل إيه
    const prompt = `أنت مساعد طبي شخصي ذكي اسمك "Healix AI" مدمج داخل تطبيق طبي. 
    مهمتك الإجابة على أسئلة المستخدم الصحية باختصار، بأسلوب ودود، ومطمئن باللغة العربية. 
    تجنب الإجابات الطويلة جداً. في الحالات التي تبدو خطيرة، انصحه بزيارة الطبيب فوراً.
    
    سؤال المستخدم: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // إرسال الرد للموبايل
    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "عذراً، لم أتمكن من معالجة طلبك الآن." });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});