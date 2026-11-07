const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const auth = require('../middleware/auth');

router.get('/active', auth, qrController.getActiveTag);
router.post('/regenerate', auth, qrController.regenerateTag);
router.put('/revoke/:id', auth, qrController.revokeTag);
router.get('/list', auth, qrController.listTags);

module.exports = router;
