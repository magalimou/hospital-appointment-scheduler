const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientsController');
const authenticate = require('../middleware/auth');

router.post('/signup', patientController.signup);
router.post('/login', patientController.login);
router.patch('/update', authenticate, patientController.updatePatient);
router.delete('/delete', authenticate, patientController.deletePatient);

module.exports = router;
