# Wellnest Medical Clinic Backend

Production-ready Node.js + Express + PostgreSQL backend with atomic booking operations and race condition prevention.

## Features

✓ **Atomic Booking Operations** - PostgreSQL exclusion constraints prevent double-booking  
✓ **Transaction Safety** - All critical operations use database transactions  
✓ **Input Validation & Sanitization** - XSS and injection prevention  
✓ **Rate Limiting** - Prevents abuse and DoS attacks  
✓ **Audit Logging** - Complete security audit trail  
✓ **Health Monitoring** - Database health checks  
✓ **CORS Configuration** - Secure cross-origin resource sharing  
✓ **Error Handling** - Structured error responses  

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://localhost:5432/wellnest_dev
PORT=3002
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5174
```

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE wellnest_dev;
\q
```

### 4. Run Migrations

```bash
npm run migrate
```

This creates all tables with the critical `no_overlapping_appointments` exclusion constraint that prevents race conditions.

### 5. Seed Data

```bash
npm run seed
```

This imports all data from `../db.json` including services, doctors, availability rules, and demo appointments.

### 6. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3002`.

## Database Schema

### Critical: Race Condition Prevention

The `appointments` table uses a PostgreSQL exclusion constraint:

```sql
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
```

This constraint **atomically blocks** any INSERT or UPDATE that would create overlapping confirmed appointments for the same doctor on the same date. Race conditions are impossible.

### Tables

- `services` - Medical services catalog
- `doctors` - Doctor profiles and specialties  
- `availability` - Doctor working hours by day of week
- `appointments` - Patient appointments with conflict prevention
- `contact_messages` - Contact form submissions
- `appointment_access_tokens` - Secure lookup tokens (future enhancement)
- `audit_log` - Security audit trail

## API Endpoints

### Services

- `GET /services` - List all services
- `GET /services/:slugOrId` - Get service details

### Doctors

- `GET /doctors` - List all doctors
- `GET /doctors/:slugOrId` - Get doctor details

### Availability

- `GET /availability` - Get all availability rules

### Appointments

- `POST /appointments` - Create appointment (atomic operation)
- `GET /appointments?doctorId=X&date=YYYY-MM-DD` - List appointments for conflict checking
- `GET /appointments/lookup?reference=WM-XXX&email=xxx` - Lookup appointment
- `PATCH /appointments/:id` - Cancel appointment

### Contact

- `POST /contactMessages` - Submit contact form

### Health Check

- `GET /health` - Server and database health status

## Security Features

### 1. Input Validation

All inputs are validated using `validator` library:
- Email format validation
- Phone number format validation  
- Date and time format validation
- String length limits
- XSS prevention via escaping

### 2. Rate Limiting

Default: 100 requests per minute per IP (configurable via `RATE_LIMIT_*` env vars)

### 3. Audit Logging

All critical operations are logged to `audit_log` table.

### 4. Secure Headers

Helmet.js provides security headers including CSP, X-Frame-Options, etc.

### 5. CORS

Configurable allowed origins via `ALLOWED_ORIGINS` environment variable.

## Testing Race Conditions

The exclusion constraint can be tested with concurrent requests:

```bash
# Terminal 1
curl -X POST http://localhost:3002/appointments \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"consultation","doctorId":"dr-santos","date":"2026-10-20","startTime":"10:00","durationMin":30,"patientName":"Test 1","patientEmail":"test1@example.com","patientPhone":"0917 555 0001"}'

# Terminal 2 (run simultaneously)
curl -X POST http://localhost:3002/appointments \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"consultation","doctorId":"dr-santos","date":"2026-10-20","startTime":"10:00","durationMin":30,"patientName":"Test 2","patientEmail":"test2@example.com","patientPhone":"0917 555 0002"}'
```

One request will succeed, the other will receive:  
`{"error": "This time slot is no longer available"}`

