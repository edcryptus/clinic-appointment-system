import { api, type Appointment, type AvailabilityRule, type Doctor } from "./api";
import { addDaysISO, overlaps, toMinutes, toTime, todayISO } from "./format";
import { brand } from "../config/brand";

export interface Slot {
  start: string;
  end: string;
  available: boolean;
  reason?: string;
}

function openWindowForDate(isoDate: string): { start: string; end: string } | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  if (dow === 0) return null;
  if (dow === 6) return { start: brand.openHours.saturdayStart, end: brand.openHours.saturdayEnd };
  return { start: brand.openHours.weekdayStart, end: brand.openHours.weekdayEnd };
}

function doctorWindow(
  rules: AvailabilityRule[],
  doctor: Doctor,
  isoDate: string
): { start: string; end: string; step: number } | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  if (!doctor.workingDays.includes(dow)) return null;
  const rule = rules.find((r) => r.doctorId === doctor.id && r.dayOfWeek === dow);
  const base = openWindowForDate(isoDate);
  if (!base) return null;
  if (!rule) return { ...base, step: 30 };
  // Clamp the doctor rule inside clinic open hours.
  const start = toMinutes(rule.start) < toMinutes(base.start) ? base.start : rule.start;
  const end = toMinutes(rule.end) > toMinutes(base.end) ? base.end : rule.end;
  return { start, end, step: rule.slotMinutes || 30 };
}

export async function buildSlotsForDoctor(
  doctor: Doctor,
  isoDate: string,
  durationMin: number
): Promise<Slot[]> {
  const rules = await api.getAvailability();
  const window = doctorWindow(rules, doctor, isoDate);
  if (!window) return [];
  const existing: Appointment[] = await api.getAppointmentsForDoctorDate(doctor.id, isoDate);
  const active = existing.filter((a) => a.status !== "cancelled");

  const slots: Slot[] = [];
  let cursor = toMinutes(window.start);
  const endLimit = toMinutes(window.end);
  while (cursor + durationMin <= endLimit) {
    const start = toTime(cursor);
    const end = toTime(cursor + durationMin);
    const clash = active.some((a) => overlaps(start, end, a.startTime, a.endTime));
    if (clash) {
      slots.push({ start, end, available: false, reason: "Booked" });
    } else {
      // Prevent same-day past slots.
      if (isoDate === todayISO()) {
        const now = new Date();
        const nowMins = now.getHours() * 60 + now.getMinutes();
        if (cursor <= nowMins + 30) {
          slots.push({ start, end, available: false, reason: "Passed" });
          cursor += window.step;
          continue;
        }
      }
      slots.push({ start, end, available: true });
    }
    cursor += window.step;
  }
  return slots;
}

export function next14Days(): string[] {
  const out: string[] = [];
  const t = todayISO();
  for (let i = 0; i < 14; i++) out.push(addDaysISO(t, i));
  return out;
}

export async function recheckConflict(
  doctorId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const existing = await api.getAppointmentsForDoctorDate(doctorId, date);
  return existing
    .filter((a) => a.status !== "cancelled")
    .some((a) => overlaps(startTime, endTime, a.startTime, a.endTime));
}
