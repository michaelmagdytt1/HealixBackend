const express = require('express');
const router = express.Router();

// راوت تجريبي عشان نتأكد إنه شغال
router.get('/', (req, res) => {
    res.status(200).json({ message: "Health routes are working!" });
});

// السطر ده هو اللي كان ناقص وعامل المشكلة دي كلها 👇
module.exports = router;