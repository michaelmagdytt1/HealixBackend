const express = require("express");
const router = express.Router();
const aiReportController = require("../controllers/aiReportController");

// مسار جلب المتوسطات
router.get("/measurements/average/:patientId", aiReportController.getAverageVitals);

// مسار حفظ التقرير النهائي
router.post("/ai-reports/save", aiReportController.saveAiReport);

module.exports = router;