import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { api, type Service } from "../lib/api";
import { serviceIcon } from "../lib/serviceIcons";
import { formatPrice } from "../lib/format";
import { useReveal } from "../hooks/useReveal";
import { Container, PageHero } from "../components/ui";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  useReveal(q + cat + services.length);

  useEffect(() => {
    api.getServices().then((s) => { setServices(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const cats = useMemo(() => ["All", ...Array.from(new Set(services.map((s) => s.category)))], [services]);
  const filtered = services.filter((s) => {
    const okCat = cat === "All" || s.category === cat;
    const okQ = (s.name + s.shortDescription + s.category).toLowerCase().includes(q.toLowerCase());
    return okCat && okQ;
  });

  return (
    <div>
      <PageHero
        eyebrow="Services"
        title="Care for the everyday and the unexpected."
        copy="Nine focused visit types, each with honest pricing and enough time to talk properly. Choose one to read what it includes, or book directly."
      />
      <Container>
        <div className="reveal mt-8 flex flex-col gap-3 rounded-xl3 border hairline bg-white p-4 shadow-card sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search services</span>
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search visits, ex. dental or checkup" className="field-input pl-11" />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c}
                className={`rounded-full border px-4 py-2 text-sm font-semibold btn-transition ${cat === c ? "border-pine bg-pine text-white" : "border-line bg-white text-charcoal hover:border-pine"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </Container>

      <Container className="pb-20 pt-10">
        {loading && <p className="text-stone2">Loading services…</p>}
        {!loading && filtered.length === 0 && (
          <div className="rounded-xl3 border hairline bg-white p-10 text-center">
            <p className="font-serif-display text-2xl">No visits match that search.</p>
            <p className="mt-2 text-stone2">Try a different word, or browse everything.</p>
            <button type="button" onClick={() => { setQ(""); setCat("All"); }} className="mt-4 rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-white">Clear filters</button>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((s) => {
            const Icon = serviceIcon(s.id);
            return (
            <article key={s.id} className="reveal card-hover rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-start gap-5">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-mint text-pine" aria-hidden="true">
                  <Icon size={30} strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sage-dark">{s.category}</p>
                  <h2 className="font-serif-display mt-1 text-3xl"><Link to={`/services/${s.slug}`} className="hover:text-pine">{s.name}</Link></h2>
                </div>
              </div>
              <p className="mt-4 text-[15px] text-stone2">{s.shortDescription}</p>
              <p className="mt-3 text-[15px] font-bold text-pine">{formatPrice(s.price)}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={`/services/${s.slug}`} className="btn-transition rounded-full border border-pine/30 px-5 py-2.5 text-sm font-semibold text-pine hover:border-pine">Read details</Link>
                <Link to={`/book?service=${s.slug}`} className="btn-transition inline-flex items-center gap-1.5 rounded-full bg-pine px-5 py-2.5 text-sm font-semibold text-white hover:bg-pine-deep">Book it <ArrowRight size={15} /></Link>
              </div>
            </article>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
