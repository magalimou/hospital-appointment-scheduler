const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, appointmentController.getPatientAppointments); //
router.post('/book', authenticate, appointmentController.bookAppointment);
router.get('/nearest/:specialty', appointmentController.findNearestAvailableDate);
router.delete('/:id', authenticate, appointmentController.cancelAppointment); //

module.exports = router;