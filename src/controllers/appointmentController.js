const appointmentModel = require('../models/appointmentModel');

exports.getPatientAppointments = async (req, res) => {
    try {
        const patientId = req.user.id; // Assuming req.user contains the authenticated user's data
        const appointments = await appointmentModel.getAppointmentsByPatientId(patientId);
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
};

exports.bookAppointment = async (req, res) => {
    try {
        const {doctor_id, date, time, duration } = req.body;
        const patientId = req.user.id; // Extract Patient ID from JWT Token
        
        //Check if the specified date is in the past
        const appointmentDate = new Date(date);
        const currentDate = new Date();

        //Reset the time to 00:00:00 to compare only the dates
        currentDate.setHours(0, 0, 0, 0);

        if(appointmentDate < currentDate) {
            return res.status(400).json({ message: 'You cannot book appointments for past dates.' });
        }

        // Check if the doctor is available on the specified date and time
        const isAvailable = await appointmentModel.isDoctorAvailable(doctor_id, date, time, duration);

        // If the doctor is not available, return an error message
        if (!isAvailable) {
            return res.status(400).json({ message: 'The doctor is not available on the specified date and time.' });
        }

        //Create appointment
        const appointment = await appointmentModel.createAppointment(patientId, doctor_id, date, time, duration);

        res.status(201).json({ message: 'Appointment successfully scheduled.', appointment });

    } catch (err) {
        console.error('Error scheduling the appointment:', err);
        res.status(500).json({ message: 'Error when scheduling the appointment. Please try again later.' });
    }
};

exports.findNearestAvailableDate = async (req, res) => {
    try {
        const { specialty } = req.params;
        const availableDate = await appointmentModel.findNearestAvailableDateWithDoctorInfo(specialty);

        if (availableDate) {
            const availableTimeSlots = await appointmentModel.getAvailableTimeSlots(
                availableDate.doctor_id,
                availableDate.date
            );

            res.status(200).json({
                doctor_id: availableDate.doctor_id,
                doctor_name: availableDate.doctor_name,
                date: availableDate.date,
                time_slots: availableTimeSlots
            });
        } else {
            res.status(404).json({ message: 'No available dates found for this specialty' });
        }
    } catch (error) {
        console.error('Error finding nearest available date:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const patientId = req.user.id;
  
        const success = await appointmentModel.cancelAppointment(appointmentId, patientId);
  
        if (success) {
            res.status(200).json({ message: 'Appointment cancelled successfully' });
        } else {
            res.status(404).json({ message: 'Appointment not found or not yours to cancel' });
        }
    } catch (error) {
        console.error('Error cancelling the appointment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getAppointmentsByDoctorId = async (req, res) => {
    try {
        const doctorId = req.params.id;
        const appointments = await appointmentModel.getAppointmentsByDoctorId(doctorId);

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found for this doctor.' });
        }

        return res.status(200).json(appointments);
    } catch {
        res.status(500).json({ message: 'Error getting appointments for doctor' });
    }
};