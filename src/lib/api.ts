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
  date: string; // YYYY-MM-DD
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
  getService: async (slugOrId: string) => {
    const bySlug = await request<Service[]>(`/services?slug=${encodeURIComponent(slugOrId)}`);
    if (bySlug.length > 0) return bySlug[0];
    return request<Service>(`/services/${encodeURIComponent(slugOrId)}`);
  },
  getDoctors: () => request<Doctor[]>("/doctors"),
  getDoctor: async (slugOrId: string) => {
    const bySlug = await request<Doctor[]>(`/doctors?slug=${encodeURIComponent(slugOrId)}`);
    if (bySlug.length > 0) return bySlug[0];
    return request<Doctor>(`/doctors/${encodeURIComponent(slugOrId)}`);
  },
  getAvailability: () => request<AvailabilityRule[]>("/availability"),
  getAppointmentsForDoctorDate: (doctorId: string, date: string) =>
    request<Appointment[]>(`/appointments?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`),
  createAppointment: (payload: Omit<Appointment, "id">) =>
    request<Appointment>("/appointments", { method: "POST", body: JSON.stringify(payload) }),
  updateAppointment: (id: number | string, patch: Partial<Appointment>) =>
    request<Appointment>(`/appointments/${encodeURIComponent(String(id))}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  lookupAppointment: async (reference: string, email: string) => {
    const ref = reference.trim().toUpperCase();
    const list = await request<Appointment[]>(
      `/appointments?reference=${encodeURIComponent(ref)}`
    );
    const match = list.find(
      (a) => a.patientEmail.toLowerCase() === email.trim().toLowerCase()
    );
    return match ?? null;
  },
  submitContactMessage: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
  }) => request("/contactMessages", { method: "POST", body: JSON.stringify(payload) }),
};
