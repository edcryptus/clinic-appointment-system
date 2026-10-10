import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Clock } from "lucide-react";
import { api, type Doctor, type Service } from "../lib/api";
import { serviceIcon } from "../lib/serviceIcons";
import DoctorAvatar from "../components/DoctorAvatar";
import { formatPrice } from "../lib/format";
import { Container, Eyebrow } from "../components/ui";

export default function ServiceDetail() {
  const { slug } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    api.getService(slug).then(setService).catch(() => setError("We could not load that service."));
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, [slug]);

  if (error) return <Container className="pb-20 pt-32"><p>{error}</p><Link to="/services" className="text-pine font-semibold">Back to services</Link></Container>;
  if (!service) return <Container className="pb-20 pt-32"><p className="text-stone2">Loading visit details…</p></Container>;

  const relevant = doctors.filter((d) => d.serviceIds.includes(service.id));
  const Icon = serviceIcon(service.id);

  return (
    <div className="pt-24 sm:pt-28">
      <div className="relative overflow-hidden bg-pine-deep">
        <div className="absolute -right-20 -top-20 grid h-72 w-72 place-items-center rounded-full bg-white/8" aria-hidden="true">
          <Icon size={120} strokeWidth={1.2} className="text-white/25" />
        </div>
        <Container className="relative flex flex-col justify-end pb-10 pt-10">
          <Link to="/services" className="btn-transition inline-flex w-fit items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-pine shadow-card hover:bg-white"><ArrowLeft size={15} /> All services</Link>
          <span className="mt-6 grid h-20 w-20 place-items-center rounded-3xl bg-mint text-pine" aria-hidden="true">
            <Icon size={40} strokeWidth={1.8} />
          </span>
          <p className="eyebrow mt-4 !text-mint">{service.category} · {service.durationMin} minutes</p>
          <h1 className="font-serif-display mt-2 max-w-2xl text-4xl text-white sm:text-6xl">{service.name}</h1>
        </Container>
      </div>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Eyebrow>What to expect</Eyebrow>
          <p className="mt-3 text-[17px] leading-relaxed text-charcoal">{service.description}</p>
          <h2 className="font-serif-display mt-8 text-2xl">What this appointment generally includes</h2>
          <ul className="mt-4 space-y-3">
            {service.includes.map((item) => (
              <li key={item} className="card-hover flex gap-3 rounded-2xl border hairline bg-white p-4 text-[15px] shadow-card">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-mint text-pine"><Check size={15} /></span> {item}
              </li>
            ))}
          </ul>
          <h2 className="font-serif-display mt-8 text-2xl">Common questions</h2>
          <div className="mt-4 space-y-3">
            {service.faqs.map((f) => (
              <details key={f.q} className="card-hover group rounded-2xl border hairline bg-white p-5 shadow-card">
                <summary className="cursor-pointer font-semibold">{f.q}</summary>
                <p className="mt-2 text-[15px] text-stone2">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-sm text-stone2">General information only. Your doctor will advise what is right for your situation. No outcomes are guaranteed.</p>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card-hover rounded-xl3 border hairline bg-white p-7 shadow-card">
            <p className="flex items-center gap-2 text-sm text-stone2"><Clock size={15} className="text-pine" /> {service.durationMin} minutes</p>
            <p className="font-serif-display mt-2 text-4xl text-pine">{formatPrice(service.price)}</p>
            <Link to={`/book?service=${service.slug}`} className="btn-transition mt-5 flex items-center justify-center gap-2 rounded-full bg-pine px-6 py-3.5 font-semibold text-white hover:bg-pine-deep">Book This Service <ArrowRight size={16} /></Link>
            <p className="mt-3 text-center text-[13px] text-stone2">You will pick a doctor and time on the next screen.</p>
          </div>
          {relevant.length > 0 && (
            <div className="card-hover mt-5 rounded-xl3 border hairline bg-mint-pale p-6 shadow-card">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.18em] text-pine">Doctors for this visit</h2>
              <ul className="mt-4 space-y-3">
                {relevant.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 transition-colors hover:bg-white">
                    <DoctorAvatar name={d.name} size="sm" />
                    <span className="flex-1"><span className="block text-sm font-semibold">{d.name}</span><span className="block text-xs text-stone2">{d.role}</span></span>
                    <Link to={`/book?service=${service.slug}&doctor=${d.slug}`} className="text-sm font-semibold text-pine link-underline">Book</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </Container>
    </div>
  );
}
