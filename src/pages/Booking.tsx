import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, CalendarCheck, UserRound, Stethoscope, Clock, ClipboardCheck } from "lucide-react";
import { api, type Doctor, type Service } from "../lib/api";
import { buildSlotsForDoctor, next14Days, recheckConflict, type Slot } from "../lib/availability";
import { addDaysISO, formatLongDate, formatPrice, formatTimeLabel, isValidEmail, todayISO } from "../lib/format";
import { Container, Eyebrow } from "../components/ui";
import DoctorAvatar from "../components/DoctorAvatar";

const steps = [
  { label: "Care", icon: Stethoscope },
  { label: "Doctor", icon: UserRound },
  { label: "Time", icon: Clock },
  { label: "Details", icon: ClipboardCheck },
  { label: "Review", icon: CalendarCheck },
];

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [serviceId, setServiceId] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string>("any");
  const [date, setDate] = useState<string>(todayISO());
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [reason, setReason] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    Promise.all([api.getServices(), api.getDoctors()])
      .then(([s, d]) => {
        setServices(s);
        setDoctors(d);
        const svcParam = params.get("service");
        const docParam = params.get("doctor");
        if (svcParam) {
          const found = s.find((x) => x.slug === svcParam || x.id === svcParam);
          if (found) setServiceId(found.id);
        }
        if (docParam) {
          const found = d.find((x) => x.slug === docParam || x.id === docParam);
          if (found) setDoctorId(found.id);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoadError("We could not reach the booking service. Start JSON Server with npm run server, then refresh.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId]);
  const eligibleDoctors = useMemo(() => {
    if (!service) return doctors;
    return doctors.filter((d) => d.serviceIds.includes(service.id));
  }, [doctors, service]);

  useEffect(() => {
    if (service && doctorId !== "any" && !eligibleDoctors.some((d) => d.id === doctorId)) {
      setDoctorId("any");
    }
  }, [service, eligibleDoctors, doctorId]);

  const dates = useMemo(() => next14Days(), []);

  // Load slots when doctor/date/service change and we are at/after time step.
  useEffect(() => {
    if (!service) return;
    if (step < 2) return;
    const svc = service;
    let cancelled = false;
    async function run() {
      setSlotsLoading(true);
      setSlots([]);
      try {
        if (doctorId === "any") {
          // Aggregate: for each eligible doctor, first available; show per-doctor groups in UI instead.
          // Here we compute a combined marker list by checking each doctor.
          const all: Slot[] = [];
          const seen = new Set<string>();
          for (const d of eligibleDoctors) {
            const ds = await buildSlotsForDoctor(d, date, svc.durationMin);
            ds.filter((s) => s.available).forEach((s) => {
              const key = `${s.start}-${s.end}`;
              if (!seen.has(key)) {
                seen.add(key);
                all.push(s);
              }
            });
            if (cancelled) return;
          }
          all.sort((a, b) => a.start.localeCompare(b.start));
          if (!cancelled) setSlots(all);
        } else {
          const doc = doctors.find((d) => d.id === doctorId);
          if (!doc) return;
          const ds = await buildSlotsForDoctor(doc, date, svc.durationMin);
          if (!cancelled) setSlots(ds);
        }
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [step, date, doctorId, service, eligibleDoctors, doctors]);

  function validateDetails(): boolean {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Please enter your full name.";
    if (!isValidEmail(email)) e.email = "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length < 7) e.phone = "Enter a contact number we can reach you on.";
    if (!agree) e.agree = "Please agree to the Booking and Cancellation Policies to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function confirm() {
    if (!service) return;
    if (!validateDetails()) { setStep(3); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      // Resolve doctor: if "any", pick first eligible doctor free at that slot.
      let chosenId = doctorId;
      let chosenName = doctors.find((d) => d.id === doctorId)?.name ?? "First available doctor";
      const [sh, sm] = startTime.split(":").map(Number);
      const endMins = sh * 60 + sm + service.durationMin;
      const endTime = `${String(Math.floor(endMins / 60)).padStart(2, "0")}:${String(endMins % 60).padStart(2, "0")}`;

      if (doctorId === "any") {
        let picked: Doctor | null = null;
        for (const d of eligibleDoctors) {
          const conflict = await recheckConflict(d.id, date, startTime, endTime);
          if (!conflict) {
            // also verify inside working hours by rebuilding slots
            const ds = await buildSlotsForDoctor(d, date, service.durationMin);
            if (ds.some((s) => s.start === startTime && s.available)) { picked = d; break; }
          }
        }
        if (!picked) throw new Error("That time was just taken. Please choose another slot.");
        chosenId = picked.id;
        chosenName = picked.name;
      } else {
        const conflict = await recheckConflict(chosenId, date, startTime, endTime);
        if (conflict) throw new Error("That time was just taken. Please choose another slot.");
      }

      const created = await api.createAppointment({
        serviceId: service.id,
        serviceName: service.name,
        doctorId: chosenId,
        doctorName: chosenName,
        date,
        startTime,
        endTime,
        durationMin: service.durationMin,
        price: service.price,
        patientName: name.trim(),
        patientEmail: email.trim(),
        patientPhone: phone.trim(),
        dateOfBirth: dob || undefined,
        reason: reason.trim() || undefined,
      });
      navigate(`/book/confirmation/${created.reference}?email=${encodeURIComponent(created.patientEmail)}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Container className="pb-20 pt-32"><p className="text-stone2">Loading booking options…</p></Container>;
  if (loadError) return (
    <Container className="pb-20 pt-32">
      <div className="rounded-xl3 border border-red-200 bg-red-50 p-8">
        <h1 className="font-serif-display text-3xl">Booking is unavailable</h1>
        <p className="mt-2 text-[15px]">{loadError}</p>
        <p className="mt-2 text-sm text-stone2">The site expects the mock API at {api.baseUrl}. Run <code>npm run server</code> in a second terminal, then <code>npm run dev</code>.</p>
      </div>
    </Container>
  );

  return (
    <div>
      <div className="page-hero-band border-b hairline pt-28 sm:pt-32">
        <Container className="max-w-4xl pb-8">
          <Eyebrow>Book an appointment</Eyebrow>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <h1 className="font-serif-display text-balance text-4xl sm:text-5xl">A few steps, then you are set.</h1>
            <p className="text-sm text-stone2">Step {step + 1} of {steps.length}</p>
          </div>
          <ol className="mt-7 flex items-center" aria-label="Booking progress">
            {steps.map((s, i) => (
              <li key={s.label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`step-dot grid h-10 w-10 place-items-center rounded-full border text-sm font-bold ${i === step ? "border-pine bg-pine text-white shadow-card" : i < step ? "border-pine bg-mint text-pine" : "border-line bg-white text-stone2"}`}>
                    {i < step ? <Check size={16} /> : <s.icon size={16} />}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider sm:text-xs ${i === step ? "text-pine" : i < step ? "text-pine/80" : "text-stone2"}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <span className={`mx-2 mb-6 h-px flex-1 sm:mx-3 ${i < step ? "bg-pine" : "bg-line"}`} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
          {service && step > 0 && (
            <p className="mt-4 w-fit rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-stone2 ring-1 ring-line">
              <strong className="text-charcoal">{service.name}</strong> · {service.durationMin} min · {formatPrice(service.price)}
            </p>
          )}
        </Container>
      </div>

      <Container className="max-w-4xl pb-20 pt-8">
        {/* STEP 1: service */}
        {step === 0 && (
          <section aria-label="Choose a service" className="rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-serif-display text-2xl sm:text-3xl">Which visit do you need?</h2>
            <p className="mt-1 text-sm text-stone2">Select one — you can change it later before confirming.</p>
            <div className="mt-5 grid gap-3">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServiceId(s.id)}
                  aria-pressed={serviceId === s.id}
                  className={`card-hover rounded-2xl border p-5 text-left btn-transition ${serviceId === s.id ? "border-pine bg-mint-pale shadow-card ring-1 ring-pine" : "border-line bg-white hover:border-sage"}`}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-sage-dark">{s.category}</span>
                      <span className="font-serif-display mt-1 block text-xl">{s.name}</span>
                      <span className="mt-1 block text-sm text-stone2">{s.shortDescription}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-bold text-pine">{formatPrice(s.price)}</span>
                      <span className={`mt-2 grid h-6 w-6 place-items-center rounded-full border ${serviceId === s.id ? "border-pine bg-pine text-white" : "border-line text-transparent"}`} aria-hidden="true"><Check size={14} /></span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
            {!serviceId && <p className="mt-3 text-sm text-stone2">Select one visit type to continue.</p>}
            <div className="mt-6 flex justify-end">
              <button type="button" disabled={!serviceId} onClick={() => setStep(1)} className="btn-transition inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-7 py-4 font-semibold text-white disabled:opacity-40 hover:bg-pine-deep sm:w-auto sm:py-3.5">Continue <ArrowRight size={16} /></button>
            </div>
          </section>
        )}

        {/* STEP 2: doctor */}
        {step === 1 && service && (
          <section aria-label="Choose a doctor" className="rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-serif-display text-2xl sm:text-3xl">Who would you like to see?</h2>
            <p className="mt-1 text-sm text-stone2">Showing doctors who offer {service.name}.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setDoctorId("any")} aria-pressed={doctorId === "any"}
                className={`card-hover rounded-2xl border p-5 text-left btn-transition ${doctorId === "any" ? "border-pine bg-pine text-white shadow-card" : "border-dashed border-sage bg-mint-pale hover:border-pine"}`}>
                <span className="font-serif-display text-xl">First available doctor</span>
                <span className={`mt-1 block text-sm ${doctorId === "any" ? "text-white/80" : "text-stone2"}`}>Fastest way to get a convenient time.</span>
              </button>
              {eligibleDoctors.map((d) => (
                <button key={d.id} type="button" onClick={() => setDoctorId(d.id)} aria-pressed={doctorId === d.id}
                  className={`card-hover flex gap-4 rounded-2xl border p-4 text-left btn-transition ${doctorId === d.id ? "border-pine bg-mint-pale ring-1 ring-pine" : "border-line bg-white hover:border-sage"}`}>
                  <DoctorAvatar name={d.name} />
                  <span>
                    <span className="block font-semibold">{d.name}</span>
                    <span className="block text-[13px] text-stone2">{d.role}</span>
                    <span className="block text-[13px] text-stone2">{d.slotsNote}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(0)} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-6 py-4 text-sm font-semibold hover:border-pine sm:py-3"><ArrowLeft size={15} /> Back</button>
              <button type="button" onClick={() => { setStartTime(""); setStep(2); }} className="btn-transition inline-flex items-center justify-center gap-2 rounded-full bg-pine px-7 py-4 font-semibold text-white hover:bg-pine-deep sm:py-3">Continue <ArrowRight size={16} /></button>
            </div>
          </section>
        )}

        {/* STEP 3: date/time */}
        {step === 2 && service && (
          <section aria-label="Choose date and time" className="rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-serif-display text-2xl sm:text-3xl">Pick a day and time</h2>
            <p className="mt-1 inline-flex flex-wrap items-center gap-2 text-sm text-stone2"><span className="rounded-full bg-mint-pale px-3 py-1 font-semibold text-pine">{service.name} · {service.durationMin} min</span> {doctorId === "any" ? "First available doctor" : doctors.find((d) => d.id === doctorId)?.name}</p>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Day</span>
              <span className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1 sm:gap-3">
                {dates.map((dISO) => {
                  const [y, m, dd] = dISO.split("-").map(Number);
                  const dt = new Date(y, m - 1, dd);
                  const isSun = dt.getDay() === 0;
                  return (
                    <button
                      key={dISO}
                      type="button"
                      disabled={isSun}
                      onClick={() => { setDate(dISO); setStartTime(""); }}
                      aria-pressed={date === dISO}
                      title={isSun ? "Closed on Sundays" : formatLongDate(dISO)}
                      className={`min-w-[82px] shrink-0 rounded-2xl border px-3 py-4 text-center btn-transition sm:min-w-[88px] ${date === dISO ? "border-pine bg-pine text-white shadow-card" : "border-line bg-white hover:border-sage"} disabled:opacity-35`}
                    >
                      <span className="block text-[11px] font-bold uppercase tracking-wider">{dt.toLocaleDateString("en-US", { weekday: "short" })}</span>
                      <span className="font-serif-display block text-2xl sm:text-xl">{dd}</span>
                      <span className="block text-[11px]">{dt.toLocaleDateString("en-US", { month: "short" })}</span>
                    </button>
                  );
                })}
              </span>
            </label>
            <p className="mt-2 text-[13px] text-stone2">Closed Sundays. Saturday hours are 9 AM to 1 PM. Need a later week? Call us and we will help.</p>

            <h3 className="mt-6 font-semibold">Available times for {formatLongDate(date)}</h3>
            {slotsLoading && <p className="mt-3 flex items-center gap-2 text-stone2"><Loader2 size={16} className="animate-spin" /> Checking real availability…</p>}
            {!slotsLoading && slots.filter((s) => s.available).length === 0 && (
              <div className="mt-3 rounded-2xl border hairline bg-white p-6 text-center">
                <p className="font-semibold">No open times that day.</p>
                <p className="mt-1 text-sm text-stone2">Try the next day, or pick a different doctor for more options.</p>
                <button type="button" onClick={() => { setDate(addDaysISO(date, 1)); setStartTime(""); }} className="mt-3 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-pine">Try the next day</button>
              </div>
            )}
            {!slotsLoading && slots.filter((s) => s.available).length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" role="group" aria-label="Time slots">
                {slots.map((s) => (
                  <button
                    key={s.start}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setStartTime(s.start)}
                    aria-pressed={startTime === s.start}
                    className={`rounded-xl border px-4 py-4 text-center text-[14px] font-semibold btn-transition disabled:cursor-not-allowed sm:py-3 ${startTime === s.start ? "border-pine bg-pine text-white shadow-card" : "border-line bg-white hover:border-sage disabled:opacity-30"}`}
                  >
                    {formatTimeLabel(s.start)}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-6 py-4 text-sm font-semibold hover:border-pine sm:py-3"><ArrowLeft size={15} /> Back</button>
              <button type="button" disabled={!startTime} onClick={() => setStep(3)} className="btn-transition inline-flex items-center justify-center gap-2 rounded-full bg-pine px-7 py-4 font-semibold text-white disabled:opacity-40 hover:bg-pine-deep sm:py-3">Continue <ArrowRight size={16} /></button>
            </div>
          </section>
        )}

        {/* STEP 4: details */}
        {step === 3 && (
          <section aria-label="Your details" className="rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-serif-display text-2xl sm:text-3xl">A few details about you</h2>
            <p className="mt-1 text-sm text-stone2">Only what we need to hold your visit. Demo only, never use real patient data.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="input-label sm:col-span-2">Full name<input value={name} onChange={(e) => setName(e.target.value)} className="field-input mt-1.5 font-normal" autoComplete="name" aria-invalid={!!errors.name} placeholder="Jordan Ellis" />{errors.name && <span className="mt-1 block text-[13px] font-normal text-red-700">{errors.name}</span>}</label>
              <label className="input-label">Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="field-input mt-1.5 font-normal" autoComplete="email" aria-invalid={!!errors.email} placeholder="you@example.com" />{errors.email && <span className="mt-1 block text-[13px] font-normal text-red-700">{errors.email}</span>}</label>
              <label className="input-label">Contact number<input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="field-input mt-1.5 font-normal" autoComplete="tel" aria-invalid={!!errors.phone} placeholder="+1 (555) 000-0000" />{errors.phone && <span className="mt-1 block text-[13px] font-normal text-red-700">{errors.phone}</span>}</label>
              <label className="input-label">Date of birth (optional)<input value={dob} onChange={(e) => setDob(e.target.value)} type="date" className="field-input mt-1.5 font-normal" /> </label>
              <label className="input-label sm:col-span-2">Reason for visit (optional)<textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="field-input mt-1.5 font-normal" placeholder="A sentence or two helps your doctor prepare." /></label>
              <label className="flex items-start gap-3 rounded-2xl border border-pine/20 bg-mint-pale p-4 text-sm font-normal sm:col-span-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[#174C49]" aria-invalid={!!errors.agree} />
                <span>I agree to the Booking and Cancellation Policies and understand that late changes may incur fees.</span>
              </label>
              {errors.agree && <p className="text-[13px] text-red-700 sm:col-span-2">{errors.agree}</p>}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-6 py-4 text-sm font-semibold hover:border-pine sm:py-3"><ArrowLeft size={15} /> Back</button>
              <button type="button" onClick={() => { if (validateDetails()) setStep(4); }} className="btn-transition inline-flex items-center justify-center gap-2 rounded-full bg-pine px-7 py-4 font-semibold text-white hover:bg-pine-deep sm:py-3">Review booking <ArrowRight size={16} /></button>
            </div>
          </section>
        )}

        {/* STEP 5: review */}
        {step === 4 && service && (
          <section aria-label="Review booking" className="rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
            <h2 className="font-serif-display text-2xl sm:text-3xl">Does everything look right?</h2>
            <p className="mt-1 text-sm text-stone2">Check once — your slot is held while you review.</p>
            <div className="mt-5 overflow-hidden rounded-2xl border hairline bg-ivory/50">
              <dl className="divide-y divide-line px-5 text-[15px]">
                <div className="flex justify-between gap-4 py-3.5"><dt className="text-stone2">Visit</dt><dd className="text-right font-semibold">{service.name} · {service.durationMin} min · {formatPrice(service.price)}</dd></div>
                <div className="flex justify-between gap-4 py-3.5"><dt className="text-stone2">Doctor</dt><dd className="text-right font-semibold">{doctorId === "any" ? "First available" : doctors.find((d) => d.id === doctorId)?.name}</dd></div>
                <div className="flex justify-between gap-4 py-3.5"><dt className="text-stone2">When</dt><dd className="text-right font-semibold">{formatLongDate(date)} at {formatTimeLabel(startTime)}</dd></div>
                <div className="flex justify-between gap-4 py-3.5"><dt className="text-stone2">Patient</dt><dd className="text-right font-semibold">{name} · {email} · {phone}</dd></div>
              </dl>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
              <button type="button" onClick={() => setStep(0)} className="rounded-full bg-mint px-4 py-2 font-semibold text-pine hover:bg-pine hover:text-white btn-transition">Change care</button>
              <button type="button" onClick={() => setStep(1)} className="rounded-full bg-mint px-4 py-2 font-semibold text-pine hover:bg-pine hover:text-white btn-transition">Change doctor</button>
              <button type="button" onClick={() => setStep(2)} className="rounded-full bg-mint px-4 py-2 font-semibold text-pine hover:bg-pine hover:text-white btn-transition">Change time</button>
              <button type="button" onClick={() => setStep(3)} className="rounded-full bg-mint px-4 py-2 font-semibold text-pine hover:bg-pine hover:text-white btn-transition">Change details</button>
            </div>
            {submitError && <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">{submitError}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(3)} className="inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-6 py-4 text-sm font-semibold hover:border-pine sm:py-3"><ArrowLeft size={15} /> Back</button>
              <button type="button" onClick={confirm} disabled={submitting} className="btn-transition inline-flex items-center justify-center gap-2 rounded-full bg-pine px-8 py-4 font-semibold text-white disabled:opacity-50 hover:bg-pine-deep sm:py-3.5">
                {submitting ? <><Loader2 size={17} className="animate-spin" /> Confirming…</> : "Confirm Appointment"}
              </button>
            </div>
          </section>
        )}
      </Container>
    </div>
  );
}
