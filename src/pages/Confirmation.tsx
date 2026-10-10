import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Home } from "lucide-react";
import { api, type Appointment } from "../lib/api";
import { formatLongDate, formatPrice, formatTimeLabel } from "../lib/format";
import { brand } from "../config/brand";
import { Container, Eyebrow, CopyButton } from "../components/ui";

export default function Confirmation() {
  const { reference } = useParams();
  const [params] = useSearchParams();
  const [appt, setAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    if (!reference) return;
    api.lookupAppointment(reference, params.get("email") ?? "").then(setAppt).catch(() => setAppt(null));
  }, [reference, params]);

  return (
    <div className="pt-28 sm:pt-32">
      <Container className="max-w-3xl pb-20">
        <div className="overflow-hidden rounded-xl3 border hairline bg-white text-center shadow-card">
          <div className="border-b hairline bg-mint-pale px-8 pb-8 pt-10 sm:px-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pine text-white shadow-card"><CheckCircle2 size={30} /></span>
          <Eyebrow><span className="mt-4 block">Booking confirmed</span></Eyebrow>
          <h1 className="font-serif-display mt-2 text-4xl sm:text-5xl">We have saved your visit.</h1>
          {reference && (
            <div className="mt-5 flex flex-col items-center gap-2.5">
              <p className="w-fit rounded-full bg-pine px-7 py-3 font-mono text-base font-bold tracking-wider text-white shadow-card">Reference: {reference.toUpperCase()}</p>
              <CopyButton value={reference.toUpperCase()} label="Copy reference" />
            </div>
          )}
          </div>
          <div className="px-8 pb-10 pt-2 sm:px-12">
          {appt ? (
            <dl className="mx-auto mt-8 max-w-md divide-y divide-line text-left text-[15px]">
              <div className="flex justify-between gap-4 py-3"><dt className="text-stone2">Visit</dt><dd className="text-right font-semibold">{appt.serviceName}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-stone2">Doctor</dt><dd className="text-right font-semibold">{appt.doctorName}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-stone2">When</dt><dd className="text-right font-semibold">{formatLongDate(appt.date)} at {formatTimeLabel(appt.startTime)}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-stone2">Length and fee</dt><dd className="text-right font-semibold">{appt.durationMin} min · {formatPrice(appt.price)}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-stone2">Patient</dt><dd className="text-right font-semibold">{appt.patientName}</dd></div>
            </dl>
          ) : (
            <p className="mt-6 text-stone2">Loading your booking summary…</p>
          )}
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-stone2">
            Please arrive about 10 minutes early with a list of current medications.
            This is a demonstration booking, so no real email or SMS confirmation is sent.
            Need us? Call <a className="font-semibold text-pine" href={brand.phoneHref}>{brand.phone}</a>.
          </p>
          <ol className="mx-auto mt-8 max-w-md space-y-0 border-l-2 border-mint pl-0 text-left">
            {[
              { t: "Save your reference", d: "You will need it plus your email to look up, move, or cancel this visit." },
              { t: "Arrive 10 minutes early", d: "Bring a list of current medications and any recent test results." },
              { t: "Need to change plans?", d: "Use “Look up this booking” below to reschedule online." },
            ].map((s, i) => (
              <li key={s.t} className="relative pb-5 pl-8 last:pb-0">
                <span className="absolute -left-[13px] top-0 grid h-6 w-6 place-items-center rounded-full bg-pine text-[11px] font-bold text-white">{i + 1}</span>
                <p className="text-sm font-bold text-charcoal">{s.t}</p>
                <p className="mt-0.5 text-sm text-stone2">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-transition inline-flex items-center gap-2 rounded-full border border-pine/30 px-6 py-3 text-sm font-semibold text-pine hover:border-pine"><Home size={15} /> Back home</Link>
            <Link to="/find-appointment" className="btn-transition inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white hover:bg-pine-deep">Look up this booking <ArrowRight size={15} /></Link>
          </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
