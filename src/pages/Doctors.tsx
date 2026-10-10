import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api, type Doctor } from "../lib/api";
import DoctorAvatar from "../components/DoctorAvatar";
import { useReveal } from "../hooks/useReveal";
import { Container, PageHero } from "../components/ui";

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");
  useReveal(doctors.length + q + spec);

  useEffect(() => {
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  const specs = useMemo(() => ["All", ...Array.from(new Set(doctors.map((d) => d.specialty)))], [doctors]);
  const filtered = doctors.filter((d) => {
    const okS = spec === "All" || d.specialty === spec;
    const okQ = (d.name + d.role + d.specialty).toLowerCase().includes(q.toLowerCase());
    return okS && okQ;
  });

  return (
    <div>
      <PageHero
        eyebrow="Our doctors"
        title="The people behind the care."
        copy="Get a sense of each doctor, then book directly with the person you prefer."
      />
      <Container>
        <div className="reveal mt-8 flex flex-col gap-3 rounded-xl3 border hairline bg-white p-4 shadow-card sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search doctors</span>
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or focus" className="field-input pl-11" />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by focus">
            {specs.map((s) => (
              <button key={s} type="button" onClick={() => setSpec(s)} aria-pressed={spec === s}
                className={`rounded-full border px-4 py-2 text-sm font-semibold btn-transition ${spec === s ? "border-pine bg-pine text-white" : "border-line bg-white hover:border-pine"}`}>{s}</button>
            ))}
          </div>
        </div>
      </Container>
      <Container className="grid gap-6 pb-20 pt-10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <article key={d.id} className="reveal card-hover overflow-hidden rounded-xl3 bg-white shadow-card">
            <div className="flex items-center gap-4 border-b hairline bg-ivory/60 p-5">
              <DoctorAvatar name={d.name} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sage-dark">{d.role} · {d.specialty}</p>
                <h2 className="font-serif-display mt-0.5 text-2xl leading-tight"><Link to={`/doctors/${d.slug}`} className="hover:text-pine">{d.name}</Link></h2>
              </div>
            </div>
            <div className="p-5">
              <p className="line-clamp-3 text-[15px] leading-relaxed text-stone2">{d.bio}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mint-pale px-3 py-1 text-[12px] font-medium text-pine">{d.slotsNote}</p>
              <div className="mt-4 flex gap-3">
                <Link to={`/doctors/${d.slug}`} className="rounded-full border border-pine/30 px-5 py-2.5 text-sm font-semibold text-pine btn-transition hover:border-pine">Full profile</Link>
                <Link to={`/book?doctor=${d.slug}`} className="rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white btn-transition hover:bg-pine-deep">Book</Link>
              </div>
            </div>
          </article>
        ))}
      </Container>
    </div>
  );
}
