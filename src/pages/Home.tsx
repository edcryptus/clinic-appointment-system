import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CalendarCheck, Clock, HeartHandshake, MapPin, Phone, Mail, Stethoscope, Users, Sparkles, Star, ShieldCheck } from "lucide-react";
import { api, type Doctor, type Service } from "../lib/api";
import { brand } from "../config/brand";
import { serviceIcon } from "../lib/serviceIcons";
import DoctorAvatar from "../components/DoctorAvatar";
import { formatPrice } from "../lib/format";
import { useReveal } from "../hooks/useReveal";
import { Container, Eyebrow, SectionHeading } from "../components/ui";
import MessengerButton from "../components/MessengerButton";

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  useReveal(services.length + doctors.length);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => setServices([]));
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="page-hero-band relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
        <div className="texture-grain absolute inset-0 opacity-40" aria-hidden="true" />
        <Container className="relative grid items-center gap-10 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pb-20">
          <div className="reveal">
            <Eyebrow>Welcome to {brand.shortName} · Makati City</Eyebrow>
            <h1 className="font-serif-display mt-4 max-w-xl text-balance text-[42px] leading-[1.05] text-charcoal sm:text-[56px] lg:text-[64px]">
              Your health deserves a little <em className="text-pine">more care.</em>
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-stone2 sm:text-[18px]">
              Thoughtful healthcare, experienced doctors, and a more personal approach to every visit.
              We are here to help you feel confident about your health.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/book" className="btn-transition inline-flex items-center justify-center gap-2 rounded-full bg-pine px-8 py-4 text-[15px] font-semibold text-white shadow-card hover:bg-pine-deep sm:px-9 sm:py-4">
                Book an Appointment <ArrowRight size={17} />
              </Link>
              <Link to="/services" className="btn-transition inline-flex items-center justify-center gap-2 rounded-full border border-pine/25 bg-white px-8 py-4 text-[15px] font-semibold text-pine hover:border-pine hover:bg-mint-pale sm:px-8 sm:py-4">
                Explore Services
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t hairline pt-6 sm:gap-x-8">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint">
                  <p className="flex items-center gap-0.5 text-pine" aria-label="4.9 out of 5 rating">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" strokeWidth={0} />)}
                  </p>
                </span>
                <div>
                  <p className="text-[15px] font-bold text-charcoal">4.9 / 5 Rating</p>
                  <p className="text-[13px] text-stone2">600+ patient visits</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[14px] text-stone2">
                <ShieldCheck size={18} className="shrink-0 text-pine" />
                <span>Honest pricing · Written notes</span>
              </div>
              <p className="flex items-center gap-2 text-[14px] text-stone2">
                <Clock size={16} className="shrink-0 text-pine" />
                Mon–Fri 8–6 · Sat 9–1
              </p>
            </div>
          </div>
          <div className="reveal relative order-first lg:order-last">
            <div className="img-frame relative aspect-[4/3.8] rounded-xl3 shadow-lift sm:aspect-[4/4]">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1100&q=70"
                alt="Doctor speaking warmly with a patient in a bright clinic room"
                loading="eager"
              />
            </div>
            <div className="absolute -left-3 bottom-10 hidden w-[210px] overflow-hidden rounded-2xl border hairline bg-white shadow-card sm:-left-10 sm:block">
              <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=500&q=60" alt="Bright clinic reception" className="h-24 w-full object-cover" loading="lazy" />
              <div className="p-4">
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-pine"><HeartHandshake size={14} /> A calmer visit</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal">Longer appointments and time for every question.</p>
              </div>
            </div>
            <div className="absolute -top-3 right-4 flex items-center gap-2 rounded-full bg-pine px-4 py-2.5 text-[12px] font-semibold text-white shadow-card">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-mint" /></span>
              Same-week slots often open
            </div>
          </div>
        </Container>
        {/* Trust strip */}
        <div className="relative border-y hairline bg-white/80 backdrop-blur">
          <Container className="grid gap-5 py-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: HeartHandshake, title: "Patient-centered care", text: "Visits shaped around you, not the clock." },
              { icon: Stethoscope, title: "Experienced professionals", text: "A small team that knows its patients." },
              { icon: CalendarCheck, title: "Simple scheduling", text: "Choose a time online in a few steps." },
              { icon: Sparkles, title: "Welcoming rooms", text: "Bright, quiet spaces designed to settle nerves." },
            ].map((t, i) => (
              <div key={t.title} className={`flex gap-3 ${i > 0 ? "lg:border-l lg:border-line lg:pl-5" : ""}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-pine"><t.icon size={18} /></span>
                <span><span className="block text-[14px] font-semibold text-charcoal">{t.title}</span><span className="block text-[13px] text-stone2">{t.text}</span></span>
              </div>
            ))}
          </Container>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-16 sm:py-20" aria-labelledby="home-services">
        <Container>
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="What we help with" title="Care that meets you where you are." copy="Nine focused visit types with honest pricing and enough time to talk properly." />
            <Link to="/services" className="link-underline inline-flex items-center gap-1 text-[15px] font-semibold text-pine">All services <ArrowUpRight size={17} /></Link>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s) => {
              const Icon = serviceIcon(s.id);
              return (
              <article key={s.id} className="reveal card-hover group flex flex-col rounded-xl3 border hairline bg-white p-6 shadow-card">
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint text-pine" aria-hidden="true">
                    <Icon size={28} strokeWidth={1.8} />
                  </span>
                  <span className="rounded-full bg-mint-pale px-3 py-1.5 text-[11px] font-bold text-pine">{s.durationMin} min</span>
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-sage-dark">{s.category}</p>
                <h3 className="font-serif-display mt-1.5 text-2xl leading-snug"><Link to={`/services/${s.slug}`} className="group-hover:text-pine">{s.name}</Link></h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-stone2">{s.shortDescription}</p>
                <div className="mt-5 space-y-3 border-t hairline pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] font-bold text-pine">{formatPrice(s.price)}</span>
                    <Link to={`/services/${s.slug}`} className="text-sm font-semibold text-pine link-underline">View details</Link>
                  </div>
                  <Link to={`/book?service=${s.slug}`} className="btn-transition inline-flex w-full items-center justify-center gap-2 rounded-full bg-pine px-5 py-3 text-[14px] font-semibold text-white hover:bg-pine-deep">
                    Book This Service <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        </Container>
      </section>

      {/* DOCTORS */}
      <section className="border-y hairline bg-mint-pale py-16 sm:py-20" aria-labelledby="home-doctors">
        <Container>
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="People you will meet" title="Good care starts with good people." copy="Each doctor brings a different focus, and every visit leaves room for questions." />
            <Link to="/doctors" className="link-underline inline-flex items-center gap-1 text-[15px] font-semibold text-pine">Meet the whole team <ArrowUpRight size={17} /></Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {doctors.slice(0, 4).map((d) => (
              <article key={d.id} className="reveal card-hover group overflow-hidden rounded-xl3 bg-white shadow-card">
                <div className="flex items-center gap-4 border-b hairline bg-ivory/60 p-5">
                  <DoctorAvatar name={d.name} />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sage-dark">{d.role}</p>
                    <h3 className="font-serif-display mt-0.5 text-xl leading-tight"><Link to={`/doctors/${d.slug}`} className="group-hover:text-pine">{d.name}</Link></h3>
                  </div>
                </div>
                <div className="p-5">
                  <p className="mb-1 text-[13px] font-semibold text-pine">{d.specialty}</p>
                  <p className="line-clamp-2 text-[14px] leading-relaxed text-stone2">{d.bio}</p>
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mint-pale px-3 py-1.5 text-[12px] font-medium text-pine"><Clock size={13} /> {d.slotsNote}</p>
                  <div className="mt-4 space-y-2 border-t hairline pt-4">
                    <Link to={`/doctors/${d.slug}`} className="text-sm font-semibold text-stone2 hover:text-pine link-underline block">View full profile</Link>
                    <Link to={`/book?doctor=${d.slug}`} className="btn-transition inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-pine px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-pine-deep">
                      Book Appointment <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      {/* HOW BOOKING WORKS */}
      <section className="py-16 sm:py-24" aria-labelledby="how">
        <Container>
          <SectionHeading align="center" eyebrow="Booking in minutes" title="Three small steps to your visit." />
          <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-12 hidden border-t-2 border-dashed border-sage-light md:block" aria-hidden="true" />
            {[
              { n: "01", t: "Choose your care", d: "Pick the visit that fits, from general consultations to dental, pediatric, and women's health." },
              { n: "02", t: "Find a convenient time", d: "See real availability for each doctor and choose a slot that suits your week." },
              { n: "03", t: "Confirm your visit", d: "Add a few details, review everything, and receive a reference you can look up anytime." },
            ].map((s) => (
              <li key={s.n} className="reveal card-hover relative rounded-xl3 border hairline bg-white p-7 text-center shadow-card">
                <span className="font-serif-display mx-auto grid h-14 w-14 place-items-center rounded-full bg-pine text-xl text-white">{s.n}</span>
                <h3 className="font-serif-display mt-4 text-2xl">{s.t}</h3>
                <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-stone2">{s.d}</p>
              </li>
            ))}
          </ol>
          <div className="reveal mt-8 text-center">
            <Link to="/book" className="btn-transition inline-flex items-center gap-2 rounded-full bg-pine px-8 py-4 font-semibold text-white shadow-card hover:bg-pine-deep">Start booking <ArrowRight size={17} /></Link>
            <p className="mt-3 text-[13px] text-stone2">No account needed · Free to reschedule online</p>
          </div>
        </Container>
      </section>

      {/* EXPERIENCE */}
      <section className="bg-pine py-16 text-ivory sm:py-24" aria-labelledby="experience">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal relative">
            <div className="img-frame aspect-[4/3.4] shadow-lift">
              <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1100&q=70" alt="Calm, bright clinic reception area" loading="lazy" />
            </div>
            <div className="absolute -bottom-5 -right-2 w-44 overflow-hidden rounded-2xl border-4 border-pine shadow-lift sm:-right-5 sm:w-56">
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=500&q=60" alt="Doctor reviewing notes with patient" className="h-32 w-full object-cover sm:h-40" loading="lazy" />
            </div>
          </div>
          <div className="reveal">
            <Eyebrow light>A calmer kind of clinic</Eyebrow>
            <h2 id="experience" className="font-serif-display mt-3 text-balance text-4xl leading-tight text-white sm:text-5xl">You will be greeted by name, not by number.</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-ivory/80">From the first hello at reception to the written notes you take home, everything is designed to feel unhurried. Expect a quiet waiting area, honest timekeeping, and doctors who explain before they prescribe.</p>
            <ul className="mt-6 grid gap-3 text-[15px] text-ivory/90 sm:grid-cols-1">
              {[
                { icon: Users, text: "Time for questions in every appointment." },
                { icon: Clock, text: "Realistic scheduling, so waiting stays short." },
                { icon: HeartHandshake, text: "Written next steps after each visit." },
              ].map((li) => (
                <li key={li.text} className="flex items-center gap-3 rounded-2xl bg-white/8 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-pine"><li.icon size={17} /></span>{li.text}</li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/about" className="btn-transition inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-pine hover:bg-mint">More about the clinic <ArrowRight size={16} /></Link>
              <Link to="/doctors" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold text-white hover:bg-white/10">Meet the doctors</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24" aria-labelledby="cta">
        <Container>
          <div className="reveal relative grid overflow-hidden rounded-xl3 bg-pine-deep text-ivory lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-12">
              <p className="eyebrow eyebrow--light">Ready when you are</p>
              <h2 id="cta" className="font-serif-display mt-3 max-w-lg text-balance text-4xl leading-tight text-white sm:text-5xl">Let us make your next visit a little easier.</h2>
              <p className="mt-4 max-w-md text-ivory/70">Find the care you need and choose a time that works for you. Booking takes about two minutes.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/book" className="btn-transition inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-pine hover:bg-mint">Schedule Your Visit <ArrowRight size={17} /></Link>
                <Link to="/find-appointment" className="inline-flex items-center rounded-full border border-white/25 px-7 py-4 font-semibold text-white hover:bg-white/10">Find my visit</Link>
              </div>
              <p className="mt-5 text-[13px] text-ivory/55">Mon–Fri 8 AM–6 PM · Sat 9 AM–1 PM · Sun closed</p>
            </div>
            <div className="relative min-h-[260px]">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=70" alt="Smiling doctor in clinic" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-r from-pine-deep via-pine-deep/30 to-transparent" aria-hidden="true" />
            </div>
          </div>
        </Container>
      </section>

      {/* INFO */}
      <section className="border-t hairline bg-white py-14" aria-labelledby="visit-info">
        <Container className="grid gap-8 md:grid-cols-[1fr_1fr_1.2fr]">
          <div className="reveal">
            <h2 id="visit-info" className="font-serif-display text-2xl">Visit the clinic</h2>
            <p className="mt-3 flex gap-2 text-[15px] text-stone2"><MapPin size={17} className="mt-0.5 shrink-0 text-pine" /> {brand.address.line1}, {brand.address.line2}</p>
            <p className="mt-2 flex gap-2 text-[15px]"><Phone size={17} className="mt-0.5 shrink-0 text-pine" /> <span><a className="font-semibold text-pine" href={brand.phoneHref}>{brand.phone}</a><br /><a className="font-semibold text-pine" href={brand.mobileHref}>{brand.mobile}</a></span></p>
            <p className="mt-2 flex gap-2 text-[15px]"><Mail size={17} className="mt-0.5 shrink-0 text-pine" /> <a className="font-semibold text-pine" href={`mailto:${brand.email}`}>{brand.email}</a></p>
            <MessengerButton className="mt-5 w-full sm:w-auto" label="Chat on Messenger" />
          </div>
          <div className="reveal">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-stone2">Opening hours</h3>
            <ul className="mt-3 overflow-hidden rounded-2xl border hairline">
              {brand.hours.map((h) => (
                <li key={h.days} className="flex justify-between gap-3 bg-white px-4 py-2.5 text-[14px] odd:bg-ivory"><span>{h.days}</span><span className="font-semibold">{h.time}</span></li>
              ))}
            </ul>
          </div>
          <div className="reveal overflow-hidden rounded-xl3 border hairline bg-mint-pale p-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-pine">Finding us</p>
            <div className="texture-grain mt-3 grid h-40 place-items-center rounded-2xl bg-mint text-center" role="img" aria-label={brand.mapPlaceholderLabel}>
              <p className="px-6 text-sm font-semibold text-pine">Salcedo Village, Makati City<br /><span className="font-normal text-stone2">{brand.address.line1}</span></p>
            </div>
            <a href={brand.directionsUrl} target="_blank" rel="noreferrer" className="link-underline mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pine">Get directions <ArrowUpRight size={15} /></a>
          </div>
        </Container>
      </section>
    </div>
  );
}
