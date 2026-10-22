import { useEffect, useState } from "react";
import { CalendarClock, CalendarSearch, Loader2, Trash2 } from "lucide-react";
import { api, type Appointment, type Doctor } from "../lib/api";
import { buildSlotsForDoctor, next14Days, type Slot } from "../lib/availability";
import {
  formatLongDate,
  formatPrice,
  formatTimeLabel,
  overlaps,
  toMinutes,
  toTime,
  todayISO,
} from "../lib/format";
import { Container, Eyebrow, CopyButton } from "../components/ui";

export default function FindAppointment() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "missing" | "error">("idle");
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [message, setMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Rescheduling state
  const [rescheduling, setRescheduling] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [newDate, setNewDate] = useState(todayISO());
  const [newSlots, setNewSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [newStart, setNewStart] = useState("");
  const [saving, setSaving] = useState(false);
  const [reschedError, setReschedError] = useState("");
  const [reschedDone, setReschedDone] = useState("");

  const dates = next14Days();
  const appointmentDate = appt?.appointmentDate || appt?.date || '';
  const isPast = appointmentDate ? appointmentDate < todayISO() : false;

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) {
      setStatus("error");
      setMessage("Enter both your reference and the email used for booking.");
      return;
    }
    setStatus("loading");
    setMessage("");
    setAppt(null);
    setConfirmCancel(false);
    setRescheduling(false);
    setReschedDone("");
    try {
      const match = await api.lookupAppointment(reference, email);
      if (match) {
        setAppt(match);
        setStatus("found");
      } else {
        setStatus("missing");
        setMessage("We could not find a booking with that combination. Check the reference and email, then try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Lookup failed. Make sure the mock API is running with npm run server.");
    }
  }

  async function cancel() {
    if (!appt) return;
    setCancelling(true);
    try {
      const updated = await api.updateAppointment(appt.id, { email: email.trim() });
      setAppt(updated);
      setConfirmCancel(false);
      setRescheduling(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Cancellation failed. Please try again or call the clinic.");
    } finally {
      setCancelling(false);
    }
  }

  function startReschedule() {
    if (!appt) return;
    setReschedError("");
    setReschedDone("");
    setNewStart("");
    setNewDate(appt.date >= todayISO() ? appt.date : todayISO());
    setRescheduling(true);
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }

  useEffect(() => {
    if (!rescheduling || !appt) return;
    const current = appt;
    let cancelled = false;
    async function run() {
      setSlotsLoading(true);
      setNewSlots([]);
      try {
        const doc = doctors.find((d) => d.id === current.doctorId);
        if (!doc && doctors.length > 0) {
          setReschedError("We could not load this doctor's schedule. Please try again.");
          return;
        }
        if (!doc) return;
        const slots = await buildSlotsForDoctor(doc, newDate, current.durationMin);
        // Free up the appointment's own current slot so keeping
        // the same time is possible and never counts as a conflict.
        const freed = slots.map((s) =>
          newDate === current.date && s.start === current.startTime
            ? { ...s, available: true, reason: undefined }
            : s
        );
        if (!cancelled) setNewSlots(freed);
      } catch {
        if (!cancelled) setReschedError("We could not load open times. Please try again.");
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [rescheduling, newDate, appt, doctors]);

  async function saveReschedule() {
    if (!appt || !newStart) return;
    if (newDate === appt.date && newStart === appt.startTime) {
      setReschedError("That is your current time. Pick a different day or time to move your visit.");
      return;
    }
    setSaving(true);
    setReschedError("");
    try {
      const endTime = toTime(toMinutes(newStart) + appt.durationMin);
      const existing = await api.getAppointmentsForDoctorDate(appt.doctorId, newDate);
      const clash = existing
        .filter((a) => String(a.id) !== String(appt.id) && a.status !== "cancelled")
        .some((a) => overlaps(newStart, endTime, a.startTime, a.endTime));
      if (clash) {
        setReschedError("That time was just taken. Please choose another slot.");
        return;
      }
      const updated = await api.updateAppointment(appt.id, {
        date: newDate,
        startTime: newStart,
        endTime,
      });
      setAppt(updated);
      setRescheduling(false);
      setReschedDone(`Your visit is now set for ${formatLongDate(updated.date)} at ${formatTimeLabel(updated.startTime)}.`);
    } catch {
      setReschedError("Rescheduling failed. Please try again or call the clinic.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-28 sm:pt-32">
      <Container className="max-w-2xl">
        <Eyebrow>Find my appointment</Eyebrow>
        <h1 className="font-serif-display mt-3 text-4xl sm:text-5xl">Look up your visit.</h1>
        <p className="mt-3 text-stone2">Enter the reference from your confirmation <em>and</em> the email used for booking. Both must match, so other patients cannot see your visit.</p>
        <form onSubmit={search} className="mt-7 rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label>Appointment reference<input value={reference} onChange={(e) => setReference(e.target.value.toUpperCase())} placeholder="WM-XXXXXX" className="field-input mt-1.5 font-mono uppercase" autoComplete="off" /></label>
            <label>Email used for booking<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="field-input mt-1.5" autoComplete="email" /></label>
          </div>
          <button type="submit" disabled={status === "loading"} className="btn-transition mt-5 inline-flex items-center gap-2 rounded-full bg-pine px-7 py-3 font-semibold text-white disabled:opacity-50 hover:bg-pine-deep">
            {status === "loading" ? <><Loader2 size={16} className="animate-spin" /> Searching…</> : <><CalendarSearch size={16} /> Find appointment</>}
          </button>
        </form>

        {message && status !== "found" && <p className="mt-4 rounded-2xl border hairline bg-white p-4 text-sm" role="status">{message}</p>}

        {status === "found" && appt && (
          <div className="mt-6 overflow-hidden rounded-xl3 border hairline bg-white shadow-card" role="status">
            <div className="border-b hairline bg-mint-pale px-6 py-4 sm:px-8">
            <p className={`w-fit rounded-full px-4 py-1.5 text-[13px] font-bold shadow-card ring-1 ${appt.status === "cancelled" ? "bg-red-100 text-red-800 ring-red-200" : "bg-pine text-white ring-pine"}`}>
              {appt.status === "cancelled" ? "Cancelled" : "Confirmed · ready for your visit"}
            </p>
            </div>
            <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            {reschedDone && <p className="mt-4 rounded-2xl bg-mint-pale p-4 text-sm font-medium text-pine" role="status">{reschedDone}</p>}
            <dl className="mt-4 divide-y divide-line text-[15px]">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-stone2">Reference</dt>
                <dd className="flex items-center gap-2"><span className="font-mono font-bold">{appt.reference}</span><CopyButton value={appt.reference} label="Copy" /></dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-stone2">Visit</dt><dd className="text-right font-semibold">{appt.serviceName}</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-stone2">Doctor</dt><dd className="text-right font-semibold">{appt.doctorName}</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-stone2">When</dt><dd className="text-right font-semibold">{formatLongDate(appt.date)} at {formatTimeLabel(appt.startTime)} to {formatTimeLabel(appt.endTime)}</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-stone2">Fee</dt><dd className="font-semibold">{formatPrice(appt.price)}</dd></div>
              <div className="flex justify-between gap-4 py-2.5"><dt className="text-stone2">Patient</dt><dd className="text-right font-semibold">{appt.patientName}</dd></div>
            </dl>
            {appt.status !== "cancelled" && !isPast && (
              <div className="mt-5 border-t hairline pt-5">
                <div className="flex flex-wrap gap-2">
                  {!rescheduling ? (
                    <button type="button" onClick={startReschedule} className="inline-flex items-center gap-2 rounded-full border border-pine/30 px-5 py-2.5 text-sm font-semibold text-pine hover:border-pine">
                      <CalendarClock size={15} /> Reschedule
                    </button>
                  ) : (
                    <button type="button" onClick={() => setRescheduling(false)} className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold hover:border-pine">
                      Close rescheduling
                    </button>
                  )}
                  {!confirmCancel && !rescheduling && (
                    <button type="button" onClick={() => setConfirmCancel(true)} className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">
                      <Trash2 size={15} /> Cancel this appointment
                    </button>
                  )}
                </div>
                {confirmCancel && !rescheduling && (
                  <div className="mt-3 rounded-2xl bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-900">Cancel this visit? This cannot be undone in the demo.</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setConfirmCancel(false)} className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold">Keep it</button>
                      <button type="button" onClick={cancel} disabled={cancelling} className="rounded-full bg-red-700 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">
                        {cancelling ? "Cancelling…" : "Yes, cancel"}
                      </button>
                    </div>
                  </div>
                )}
                {rescheduling && (
                  <div className="mt-4 rounded-2xl border hairline bg-mint-pale p-5 shadow-card">
                    <h2 className="font-semibold">Move your visit with {appt.doctorName}</h2>
                    <p className="mt-1 text-[13px] text-stone2">{appt.serviceName} · {appt.durationMin} min. Your current slot stays held until you confirm a new one.</p>
                    <span className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
                      {dates.map((dISO) => {
                        const [y, m, dd] = dISO.split("-").map(Number);
                        const dt = new Date(y, m - 1, dd);
                        const isSun = dt.getDay() === 0;
                        return (
                          <button
                            key={dISO}
                            type="button"
                            disabled={isSun}
                            onClick={() => { setNewDate(dISO); setNewStart(""); setReschedError(""); }}
                            aria-pressed={newDate === dISO}
                            title={isSun ? "Closed on Sundays" : formatLongDate(dISO)}
                            className={`w-[68px] shrink-0 rounded-xl border px-2 py-2.5 text-center btn-transition ${newDate === dISO ? "border-pine bg-pine text-white" : "border-line bg-white hover:border-sage"} disabled:opacity-35`}
                          >
                            <span className="block text-[10px] font-bold uppercase tracking-wider">{dt.toLocaleDateString("en-US", { weekday: "short" })}</span>
                            <span className="font-serif-display block text-lg">{dd}</span>
                          </button>
                        );
                      })}
                    </span>
                    {slotsLoading && <p className="mt-3 flex items-center gap-2 text-sm text-stone2"><Loader2 size={15} className="animate-spin" /> Checking open times…</p>}
                    {!slotsLoading && newSlots.filter((s) => s.available).length === 0 && (
                      <p className="mt-3 text-sm text-stone2">No open times that day. Try another date.</p>
                    )}
                    {!slotsLoading && newSlots.filter((s) => s.available).length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="New time slots">
                        {newSlots.map((s) => (
                          <button
                            key={s.start}
                            type="button"
                            disabled={!s.available}
                            onClick={() => setNewStart(s.start)}
                            aria-pressed={newStart === s.start}
                            className="slot-btn rounded-xl border border-line bg-white px-2 py-2.5 text-sm font-semibold btn-transition hover:border-pine disabled:opacity-35"
                          >
                            {formatTimeLabel(s.start)}
                          </button>
                        ))}
                      </div>
                    )}
                    {reschedError && <p className="mt-3 text-sm text-red-700" role="alert">{reschedError}</p>}
                    <button
                      type="button"
                      onClick={saveReschedule}
                      disabled={!newStart || saving}
                      className="btn-transition mt-4 inline-flex items-center gap-2 rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-40 hover:bg-pine-deep"
                    >
                      {saving ? <><Loader2 size={15} className="animate-spin" /> Moving…</> : "Confirm new time"}
                    </button>
                  </div>
                )}
              </div>
            )}
            {appt.status !== "cancelled" && isPast && (
              <p className="mt-5 border-t hairline pt-4 text-sm text-stone2">This visit is in the past, so it can no longer be moved or cancelled online. Call the clinic if you need help.</p>
            )}
            </div>
          </div>
        )}
        <div className="h-16" />
      </Container>
    </div>
  );
}
