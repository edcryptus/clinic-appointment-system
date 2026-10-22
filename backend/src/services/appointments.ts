import { PoolClient } from 'pg';
import { query, transaction } from '../db/index.js';
import { nanoid } from 'nanoid';

export interface CreateAppointmentRequest {
  serviceId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMin: number;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dateOfBirth?: string;
  reason?: string;
}

export interface Appointment {
  id: number;
  reference: string;
  serviceId: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMin: number;
  price: number | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dateOfBirth?: string;
  reason?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

function generateReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'WM-';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function calculateEndTime(startTime: string, durationMin: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMin;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

function mapAppointmentRow(row: any): Appointment {
  return {
    id: row.id,
    reference: row.reference,
    serviceId: row.service_id,
    serviceName: row.service_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    appointmentDate: row.appointment_date,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMin: row.duration_min,
    price: row.price,
    patientName: row.patient_name,
    patientEmail: row.patient_email,
    patientPhone: row.patient_phone,
    dateOfBirth: row.date_of_birth,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * CRITICAL: Atomic booking operation that prevents race conditions
 * Uses PostgreSQL exclusion constraint to block overlapping appointments
 */
export async function createAppointment(req: CreateAppointmentRequest): Promise<Appointment> {
  return transaction(async (client: PoolClient) => {
    // Step 1: Validate service exists and get details
    const serviceResult = await client.query(
      'SELECT id, name, duration_min, price FROM services WHERE id = $1',
      [req.serviceId]
    );
    
    if (serviceResult.rows.length === 0) {
      throw new Error('Invalid service');
    }
    
    const service = serviceResult.rows[0];
    
    // Step 2: Validate doctor exists and is eligible for this service
    const doctorResult = await client.query(
      'SELECT id, name, service_ids, working_days FROM doctors WHERE id = $1',
      [req.doctorId]
    );
    
    if (doctorResult.rows.length === 0) {
      throw new Error('Invalid doctor');
    }
    
    const doctor = doctorResult.rows[0];
    const serviceIds = doctor.service_ids as string[];
    
    if (!serviceIds.includes(req.serviceId)) {
      throw new Error('Doctor does not provide this service');
    }
    
    // Step 3: Validate appointment date and time
    const appointmentDate = new Date(req.date + 'T00:00:00Z');
    const dayOfWeek = appointmentDate.getUTCDay();
    const workingDays = doctor.working_days as number[];
    
    if (!workingDays.includes(dayOfWeek)) {
      throw new Error('Doctor is not available on this day');
    }
    
    // Step 4: Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      throw new Error('Cannot book appointments in the past');
    }
    
    // Step 5: Calculate end time
    const endTime = calculateEndTime(req.startTime, req.durationMin);
    
    // Step 6: Generate unique reference
    let reference = generateReference();
    let attempts = 0;
    while (attempts < 10) {
      const existingRef = await client.query(
        'SELECT id FROM appointments WHERE reference = $1',
        [reference]
      );
      if (existingRef.rows.length === 0) break;
      reference = generateReference();
      attempts++;
    }
    
    if (attempts >= 10) {
      throw new Error('Failed to generate unique reference');
    }
    
    // Step 7: CRITICAL - Insert appointment (exclusion constraint prevents conflicts)
    try {
      const result = await client.query(
        `INSERT INTO appointments (
          reference, service_id, service_name, doctor_id, doctor_name,
          appointment_date, start_time, end_time, duration_min, price,
          patient_name, patient_email, patient_phone, date_of_birth, reason, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'confirmed')
        RETURNING *`,
        [
          reference, service.id, service.name, doctor.id, doctor.name,
          req.date, req.startTime, endTime, req.durationMin, service.price,
          req.patientName, req.patientEmail, req.patientPhone,
          req.dateOfBirth || null, req.reason || null
        ]
      );
      
      return mapAppointmentRow(result.rows[0]);
      
    } catch (error: any) {
      // PostgreSQL exclusion constraint violation
      if (error.code === '23P01') {
        throw new Error('This time slot is no longer available');
      }
      throw error;
    }
  });
}

export async function getAppointmentByReference(
  reference: string,
  email: string
): Promise<Appointment | null> {
  const result = await query(
    `SELECT * FROM appointments 
     WHERE reference = $1 AND LOWER(patient_email) = LOWER($2)
     LIMIT 1`,
    [reference.toUpperCase().trim(), email.trim()]
  );
  
  return result.rows.length > 0 ? mapAppointmentRow(result.rows[0]) : null;
}

export async function cancelAppointment(
  appointmentId: number,
  email: string
): Promise<Appointment> {
  return transaction(async (client: PoolClient) => {
    // Verify ownership
    const checkResult = await client.query(
      'SELECT * FROM appointments WHERE id = $1 AND LOWER(patient_email) = LOWER($2)',
      [appointmentId, email.trim()]
    );
    
    if (checkResult.rows.length === 0) {
      throw new Error('Appointment not found or unauthorized');
    }
    
    const appointment = checkResult.rows[0];
    
    if (appointment.status === 'cancelled') {
      throw new Error('Appointment is already cancelled');
    }
    
    // Check if appointment is in the past
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    if (appointmentDateTime < new Date()) {
      throw new Error('Cannot cancel past appointments');
    }
    
    // Cancel the appointment
    const result = await client.query(
      `UPDATE appointments 
       SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [appointmentId]
    );
    
    return mapAppointmentRow(result.rows[0]);
  });
}

export async function getAppointmentsForDoctorDate(
  doctorId: string,
  date: string
): Promise<Appointment[]> {
  const result = await query(
    `SELECT * FROM appointments 
     WHERE doctor_id = $1 AND appointment_date = $2 
     ORDER BY start_time`,
    [doctorId, date]
  );
  
  return result.rows.map(mapAppointmentRow);
}
