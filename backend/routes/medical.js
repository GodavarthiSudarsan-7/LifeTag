const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const auth = require('../middleware/auth');

router.get('/', auth, medicalController.getMedicalInfo);
router.get('/catalogs', auth, medicalController.getCatalogs);
router.put('/', auth, medicalController.updateMedicalInfo);

router.post('/conditions', auth, medicalController.addCondition);
router.delete('/conditions/:conditionId', auth, medicalController.removeCondition);

router.post('/allergies', auth, medicalController.addAllergy);
router.delete('/allergies/:allergyId', auth, medicalController.removeAllergy);

router.post('/medications', auth, medicalController.addMedication);
router.delete('/medications/:medicationId', auth, medicalController.removeMedication);

module.exports = router;
