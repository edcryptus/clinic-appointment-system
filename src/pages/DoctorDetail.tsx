import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarCheck } from "lucide-react";
import { api, type Doctor, type Service } from "../lib/api";
import DoctorAvatar from "../components/DoctorAvatar";
import { Container, Eyebrow } from "../components/ui";

export default function DoctorDetail() {
  const { slug } = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (!slug) return;
    api.getDoctor(slug).then(setDoctor).catch(() => setDoctor(null));
    api.getServices().then(setServices).catch(() => setServices([]));
  }, [slug]);

  if (!doctor) return <Container className="pb-20 pt-32"><p className="text-stone2">Loading doctor profile…</p></Container>;
  const mine = services.filter((s) => doctor.serviceIds.includes(s.id));

  return (
    <div className="pt-28 sm:pt-32">
      <Container>
        <Link to="/doctors" className="btn-transition inline-flex items-center gap-1.5 rounded-full border hairline bg-white px-4 py-2 text-sm font-semibold text-pine shadow-card hover:border-pine"><ArrowLeft size={15} /> All doctors</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-hover grid place-items-center rounded-xl3 border hairline bg-mint-pale p-10 shadow-card">
            <DoctorAvatar name={doctor.name} size="lg" />
          </div>
          <div>
            <Eyebrow>{doctor.role} · {doctor.specialty}</Eyebrow>
            <h1 className="font-serif-display mt-3 text-5xl sm:text-6xl">{doctor.name}</h1>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-stone2">{doctor.bio}</p>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-medium text-pine"><CalendarCheck size={15} /> {doctor.slotsNote}</p>
            <p className="mt-4 rounded-2xl border hairline bg-white p-4 text-[13px] text-stone2">Fictional demonstration profile. Credentials, availability, and likeness are invented for this example.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/book?doctor=${doctor.slug}`} className="btn-transition inline-flex items-center gap-2 rounded-full bg-pine px-7 py-3.5 font-semibold text-white hover:bg-pine-deep">Book with {doctor.name.split(" ")[1]} <ArrowRight size={16} /></Link>
            </div>
            <h2 className="font-serif-display mt-10 text-2xl">Visit types with {doctor.name.split(" ")[1]}</h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl3 border hairline bg-white shadow-card">
              {mine.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-mint-pale/60">
                  <span><span className="block font-semibold">{s.name}</span><span className="block text-sm text-stone2">{s.durationMin} min</span></span>
                  <Link to={`/book?service=${s.slug}&doctor=${doctor.slug}`} className="text-sm font-semibold text-pine link-underline">Book this</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="h-10" />
      </Container>
    </div>
  );
}
