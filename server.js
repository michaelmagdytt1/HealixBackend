require('dotenv').config();
const app = require('./src/app');
const { GoogleGenerativeAI } = require("@google/generative-ai"); 

// استدعاء مسار القياسات
const measurementRoutes = require('./src/routes/measurementRoutes');

const PORT = process.env.PORT || 3000;

// ربط المسار بالسيرفر
app.use('/api/measurements', measurementRoutes);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `أنت مساعد طبي شخصي ذكي اسمك "Healix AI" مدمج داخل تطبيق طبي. 
    مهمتك الإجابة على أسئلة المستخدم الصحية باختصار، بأسلوب ودود، ومطمئن باللغة العربية. 
    تجنب الإجابات الطويلة جداً. في الحالات التي تبدو خطيرة، انصحه بزيارة الطبيب فوراً.
    
    سؤال المستخدم: ${message}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "عذراً، لم أتمكن من معالجة طلبك الآن." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Local: http://localhost:${PORT}`);
});