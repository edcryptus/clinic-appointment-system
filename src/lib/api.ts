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
  faqs: { q: string; a: string }[];
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

export interface Appointment {
  id: number | string;
  reference: string;
  serviceId: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  appointmentDate?: string; // PostgreSQL backend returns this
  date: string; // Canonical field the frontend renders (normalized from appointmentDate when needed)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMin: number;
  price: number | null;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  dateOfBirth?: string;
  reason?: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

export interface AvailabilityRule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  start: string;
  end: string;
  slotMinutes: number;
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3002";

// The PostgreSQL backend returns `appointmentDate`; the json-server mock uses `date`.
// Normalize to `date` so the UI always has a concrete string to render.
function withDate<T extends Appointment>(a: T): T {
  return { ...a, date: a.date || a.appointmentDate || "" };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  baseUrl: API_BASE,
  getServices: () => request<Service[]>("/services"),
  getService: (slugOrId: string) => request<Service>(`/services/${encodeURIComponent(slugOrId)}`),
  getDoctors: () => request<Doctor[]>("/doctors"),
  getDoctor: (slugOrId: string) => request<Doctor>(`/doctors/${encodeURIComponent(slugOrId)}`),
  getAvailability: () => request<AvailabilityRule[]>("/availability"),
  getAppointmentsForDoctorDate: async (doctorId: string, date: string) => {
    const rows = await request<Appointment[]>(`/appointments?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`);
    return rows.map(withDate);
  },
  createAppointment: async (payload: Omit<Appointment, "id" | "reference" | "createdAt" | "status">) =>
    withDate(await request<Appointment>("/appointments", { method: "POST", body: JSON.stringify(payload) })),
  // Cancel: send { email }. Reschedule: send { date, startTime, endTime }.
  updateAppointment: async (
    id: number | string,
    changes: { email: string } | { date: string; startTime: string; endTime: string }
  ) =>
    withDate(
      await request<Appointment>(`/appointments/${encodeURIComponent(String(id))}`, {
        method: "PATCH",
        body: JSON.stringify(changes),
      })
    ),
  lookupAppointment: async (reference: string, email: string) => {
    try {
      return withDate(
        await request<Appointment>(
          `/appointments/lookup?reference=${encodeURIComponent(reference.trim().toUpperCase())}&email=${encodeURIComponent(email.trim())}`
        )
      );
    } catch (error) {
      return null;
    }
  },
  submitContactMessage: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt?: string;
  }) => request("/contactMessages", { method: "POST", body: JSON.stringify(payload) }),
};
