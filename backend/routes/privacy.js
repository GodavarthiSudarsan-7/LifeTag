const express = require('express');
const router = express.Router();
const privacyController = require('../controllers/privacyController');
const auth = require('../middleware/auth');

router.get('/', auth, privacyController.getPrivacySettings);
router.put('/', auth, privacyController.updatePrivacySettings);

module.exports = router;
