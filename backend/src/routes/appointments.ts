import { Router } from 'express';
import { asyncHandler } from '../middleware/errors.js';
import * as appointmentService from '../services/appointments.js';
import { validateEmail, validateDate, validateTime, validateReference, sanitizeString, validatePhone } from '../middleware/validation.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();

// Create new appointment
router.post('/', asyncHandler(async (req, res) => {
  const {
    serviceId,
    doctorId,
    date,
    startTime,
    durationMin,
    patientName,
    patientEmail,
    patientPhone,
    dateOfBirth,
    reason
  } = req.body;

  // Validation
  if (!serviceId || !doctorId || !date || !startTime || !durationMin || !patientName || !patientEmail || !patientPhone) {
    res.status(400);
    throw new Error('Missing required fields');
  }

  if (!validateEmail(patientEmail)) {
    res.status(400);
    throw new Error('Invalid email address');
  }

  if (!validatePhone(patientPhone)) {
    res.status(400);
    throw new Error('Invalid phone number');
  }

  if (!validateDate(date)) {
    res.status(400);
    throw new Error('Invalid date format (expected YYYY-MM-DD)');
  }

  if (!validateTime(startTime)) {
    res.status(400);
    throw new Error('Invalid time format (expected HH:MM)');
  }

  if (typeof durationMin !== 'number' || durationMin <= 0) {
    res.status(400);
    throw new Error('Invalid duration');
  }

  if (dateOfBirth && !validateDate(dateOfBirth)) {
    res.status(400);
    throw new Error('Invalid date of birth format');
  }

  // Sanitize inputs
  const sanitizedData = {
    serviceId: sanitizeString(serviceId, 50),
    doctorId: sanitizeString(doctorId, 50),
    date,
    startTime,
    durationMin,
    patientName: sanitizeString(patientName, 200),
    patientEmail: patientEmail.trim().toLowerCase(),
    patientPhone: sanitizeString(patientPhone, 50),
    dateOfBirth: dateOfBirth || undefined,
    reason: reason ? sanitizeString(reason, 500) : undefined
  };

  const appointment = await appointmentService.createAppointment(sanitizedData);

  // Audit log
  await logAudit(
    'CREATE_APPOINTMENT',
    'appointment',
    appointment.reference,
    appointment.patientEmail,
    req.ip,
    req.get('user-agent'),
    { serviceId, doctorId, date, startTime }
  );

  res.status(201).json(appointment);
}));

// Get appointments for doctor and date (for conflict checking)
router.get('/', asyncHandler(async (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    res.status(400);
    throw new Error('Missing doctorId or date parameter');
  }

  if (!validateDate(date as string)) {
    res.status(400);
    throw new Error('Invalid date format');
  }

  const appointments = await appointmentService.getAppointmentsForDoctorDate(
    sanitizeString(doctorId as string, 50),
    date as string
  );

  res.json(appointments);
}));

// Lookup appointment by reference
router.get('/lookup', asyncHandler(async (req, res) => {
  const { reference, email } = req.query;

  if (!reference || !email) {
    res.status(400);
    throw new Error('Missing reference or email parameter');
  }

  if (!validateEmail(email as string)) {
    res.status(400);
    throw new Error('Invalid email address');
  }

  if (!validateReference(reference as string)) {
    res.status(400);
    throw new Error('Invalid reference format');
  }

  const appointment = await appointmentService.getAppointmentByReference(
    (reference as string).toUpperCase().trim(),
    (email as string).trim()
  );

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  // Audit log
  await logAudit(
    'LOOKUP_APPOINTMENT',
    'appointment',
    appointment.reference,
    appointment.patientEmail,
    req.ip,
    req.get('user-agent')
  );

  res.json(appointment);
}));

// Cancel appointment
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Missing email');
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error('Invalid email address');
  }

  const appointmentId = parseInt(id, 10);
  if (isNaN(appointmentId)) {
    res.status(400);
    throw new Error('Invalid appointment ID');
  }

  const appointment = await appointmentService.cancelAppointment(appointmentId, email.trim());

  // Audit log
  await logAudit(
    'CANCEL_APPOINTMENT',
    'appointment',
    appointment.reference,
    appointment.patientEmail,
    req.ip,
    req.get('user-agent')
  );

  res.json(appointment);
}));

export default router;
