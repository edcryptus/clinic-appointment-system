import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool, query } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  console.log('Seeding database with demo data from db.json...');
  
  try {
    // Read the existing db.json
    const dbJsonPath = join(__dirname, '../../../db.json');
    const dbData = JSON.parse(readFileSync(dbJsonPath, 'utf-8'));
    
    // Seed services
    console.log('Seeding services...');
    for (const service of dbData.services) {
      await query(
        `INSERT INTO services (id, slug, name, category, short_description, description, includes, duration_min, price, price_note, image, faqs)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [
          service.id,
          service.slug,
          service.name,
          service.category,
          service.shortDescription,
          service.description,
          JSON.stringify(service.includes),
          service.durationMin,
          service.price,
          service.priceNote || null,
          service.image || null,
          JSON.stringify(service.faqs || [])
        ]
      );
    }
    console.log(`✓ Seeded ${dbData.services.length} services`);
    
    // Seed doctors
    console.log('Seeding doctors...');
    for (const doctor of dbData.doctors) {
      await query(
        `INSERT INTO doctors (id, slug, name, role, specialty, bio, interests, service_ids, image, working_days, slots_note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          doctor.id,
          doctor.slug,
          doctor.name,
          doctor.role,
          doctor.specialty,
          doctor.bio,
          JSON.stringify(doctor.interests || []),
          JSON.stringify(doctor.serviceIds || []),
          doctor.image || null,
          JSON.stringify(doctor.workingDays || []),
          doctor.slotsNote || null
        ]
      );
    }
    console.log(`✓ Seeded ${dbData.doctors.length} doctors`);
    
    // Seed availability
    console.log('Seeding availability rules...');
    for (const avail of dbData.availability) {
      await query(
        `INSERT INTO availability (id, doctor_id, day_of_week, start_time, end_time, slot_minutes)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO NOTHING`,
        [
          avail.id,
          avail.doctorId,
          avail.dayOfWeek,
          avail.start,
          avail.end,
          avail.slotMinutes
        ]
      );
    }
    console.log(`✓ Seeded ${dbData.availability.length} availability rules`);
    
    // Seed demo appointments
    console.log('Seeding demo appointments...');
    for (const appt of dbData.appointments) {
      await query(
        `INSERT INTO appointments (reference, service_id, service_name, doctor_id, doctor_name, 
                                   appointment_date, start_time, end_time, duration_min, price,
                                   patient_name, patient_email, patient_phone, date_of_birth, reason, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (reference) DO NOTHING`,
        [
          appt.reference,
          appt.serviceId,
          appt.serviceName,
          appt.doctorId,
          appt.doctorName,
          appt.date,
          appt.startTime,
          appt.endTime,
          appt.durationMin,
          appt.price,
          appt.patientName,
          appt.patientEmail,
          appt.patientPhone,
          appt.dateOfBirth || null,
          appt.reason || null,
          appt.status,
          appt.createdAt
        ]
      );
    }
    console.log(`✓ Seeded ${dbData.appointments.length} demo appointments`);
    
    console.log('\n✓ Database seeding complete!');
    console.log('Demo appointment: WM-DEMO01 with email: patient@example.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
