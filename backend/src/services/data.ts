import { query } from '../db/index.js';

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  includes: string[];
  durationMin: number;
  price: number | null;
  priceNote?: string;
  image: string;
  faqs: Array<{ q: string; a: string }>;
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  role: string;
  specialty: string;
  bio: string;
  interests: string[];
  serviceIds: string[];
  image: string;
  workingDays: number[];
  slotsNote: string;
}

export async function getServices(): Promise<Service[]> {
  const result = await query('SELECT * FROM services ORDER BY name');
  return result.rows.map(mapServiceRow);
}

export async function getServiceBySlugOrId(slugOrId: string): Promise<Service | null> {
  const result = await query(
    'SELECT * FROM services WHERE slug = $1 OR id = $1 LIMIT 1',
    [slugOrId]
  );
  return result.rows.length > 0 ? mapServiceRow(result.rows[0]) : null;
}

export async function getDoctors(): Promise<Doctor[]> {
  const result = await query('SELECT * FROM doctors ORDER BY name');
  return result.rows.map(mapDoctorRow);
}

export async function getDoctorBySlugOrId(slugOrId: string): Promise<Doctor | null> {
  const result = await query(
    'SELECT * FROM doctors WHERE slug = $1 OR id = $1 LIMIT 1',
    [slugOrId]
  );
  return result.rows.length > 0 ? mapDoctorRow(result.rows[0]) : null;
}

export async function getAvailabilityRules() {
  const result = await query('SELECT * FROM availability ORDER BY doctor_id, day_of_week');
  return result.rows.map(row => ({
    id: row.id,
    doctorId: row.doctor_id,
    dayOfWeek: row.day_of_week,
    start: row.start_time,
    end: row.end_time,
    slotMinutes: row.slot_minutes
  }));
}

function mapServiceRow(row: any): Service {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    shortDescription: row.short_description,
    description: row.description,
    includes: row.includes as string[],
    durationMin: row.duration_min,
    price: row.price,
    priceNote: row.price_note,
    image: row.image,
    faqs: row.faqs as Array<{ q: string; a: string }>
  };
}

function mapDoctorRow(row: any): Doctor {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    role: row.role,
    specialty: row.specialty,
    bio: row.bio,
    interests: row.interests as string[],
    serviceIds: row.service_ids as string[],
    image: row.image,
    workingDays: row.working_days as number[],
    slotsNote: row.slots_note
  };
}
