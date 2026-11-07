const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');

// Public Emergency Routes (No Auth Middleware - Vital for First Responders)
router.get('/:token', emergencyController.getEmergencyProfile);
router.post('/:token/location', emergencyController.shareLocation);
router.post('/:token/alert', emergencyController.triggerAlert);

module.exports = router;
