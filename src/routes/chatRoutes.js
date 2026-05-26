const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/link', chatController.linkDoctorAndPatient);
router.post('/send', chatController.sendMessage);
router.get('/messages/:user1/:user2', chatController.getMessages);
router.get('/my-doctors/:patientId', chatController.getMyDoctors);

module.exports = router;