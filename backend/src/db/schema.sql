-- Wellnest Medical Clinic Database Schema
-- Production-ready schema with transactional integrity

-- Drop existing tables if re-running
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS availability CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS appointment_access_tokens CASCADE;
DROP TABLE IF EXISTS audit_log CASCADE;

-- Services Table
CREATE TABLE services (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  includes JSONB NOT NULL DEFAULT '[]',
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  price INTEGER CHECK (price IS NULL OR price >= 0),
  price_note TEXT,
  image VARCHAR(500),
  faqs JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category ON services(category);

-- Doctors Table
CREATE TABLE doctors (
  id VARCHAR(50) PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  role VARCHAR(100) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  bio TEXT NOT NULL,
  interests JSONB NOT NULL DEFAULT '[]',
  service_ids JSONB NOT NULL DEFAULT '[]',
  image VARCHAR(500),
  working_days JSONB NOT NULL DEFAULT '[]',
  slots_note VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctors_slug ON doctors(slug);
CREATE INDEX idx_doctors_specialty ON doctors(specialty);

-- Availability Rules Table
CREATE TABLE availability (
  id VARCHAR(50) PRIMARY KEY,
  doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_minutes > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_availability_doctor ON availability(doctor_id, day_of_week);

-- Appointments Table with Conflict Prevention
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  reference VARCHAR(20) UNIQUE NOT NULL,
  service_id VARCHAR(50) NOT NULL REFERENCES services(id),
  service_name VARCHAR(200) NOT NULL,
  doctor_id VARCHAR(50) NOT NULL REFERENCES doctors(id),
  doctor_name VARCHAR(200) NOT NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  price INTEGER CHECK (price IS NULL OR price >= 0),
  patient_name VARCHAR(200) NOT NULL,
  patient_email VARCHAR(200) NOT NULL,
  patient_phone VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Critical: Prevent double-booking with exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE INDEX idx_appointments_reference ON appointments(reference);
CREATE INDEX idx_appointments_doctor_date ON appointments(doctor_id, appointment_date);
CREATE INDEX idx_appointments_patient_email ON appointments(patient_email);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Unique constraint: Prevents overlapping confirmed appointments (CRITICAL FOR RACE CONDITIONS)
ALTER TABLE appointments ADD CONSTRAINT no_overlapping_appointments
  EXCLUDE USING gist (
    doctor_id WITH =,
    appointment_date WITH =,
    tsrange(
      (appointment_date + start_time)::timestamp,
      (appointment_date + end_time)::timestamp
    ) WITH &&
  )
  WHERE (status = 'confirmed');

-- Appointment Access Tokens (for secure lookup without full auth system)
CREATE TABLE appointment_access_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(64) UNIQUE NOT NULL,
  appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_email VARCHAR(200) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_access_tokens_token ON appointment_access_tokens(token);
CREATE INDEX idx_access_tokens_expires ON appointment_access_tokens(expires_at);

-- Contact Messages Table
CREATE TABLE contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  subject VARCHAR(300) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_messages_created ON contact_messages(created_at DESC);

-- Audit Log Table (for security monitoring)
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  patient_email VARCHAR(200),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON CONSTRAINT no_overlapping_appointments ON appointments IS 'CRITICAL: Prevents race conditions by blocking overlapping confirmed appointments at database level';
