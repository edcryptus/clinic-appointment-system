import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import { api, type Doctor } from "../lib/api";
import { brand } from "../config/brand";
import { useReveal } from "../hooks/useReveal";
import { Container, Eyebrow } from "../components/ui";
import DoctorAvatar from "../components/DoctorAvatar";

export default function About() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  useReveal(doctors.length);
  useEffect(() => {
    api.getDoctors().then(setDoctors).catch(() => setDoctors([]));
  }, []);

  return (
    <div>
      <div className="page-hero-band border-b hairline pt-28 sm:pt-32">
        <Container className="grid items-center gap-10 pb-12 sm:pb-16 lg:grid-cols-2">
        <div className="reveal">
          <Eyebrow>About {brand.shortName}</Eyebrow>
          <h1 className="font-serif-display mt-3 text-5xl leading-[1.05] sm:text-6xl">A clinic built around unhurried conversations.</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-stone2">Wellnest Medical Clinic is a fictional neighborhood clinic imagined for this demonstration. The idea is simple: give every visit enough time, explain things in plain words, and treat patients like neighbors rather than numbers in a queue.</p>
        </div>
        <div className="reveal img-frame aspect-[4/3.4] shadow-lift">
          <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1100&q=70" alt="Bright clinic interior" loading="lazy" />
        </div>
        </Container>
      </div>

      <div className="bg-mint-pale py-14">
        <Container className="grid gap-5 md:grid-cols-3">
          {[
            { t: "Listen first", d: "Every appointment starts with your story. We ask what changed, what worries you, and what a good outcome looks like." },
            { t: "Explain plainly", d: "No rushed jargon. You leave with written notes, clear next steps, and space to ask one more question." },
            { t: "Keep it honest", d: "We suggest tests and treatments only when they would change the plan, and we talk openly about costs." },
          ].map((v) => (
            <div key={v.t} className="reveal card-hover rounded-xl3 border hairline bg-white p-7 shadow-card">
              <HeartHandshake size={22} className="text-pine" />
              <h2 className="font-serif-display mt-3 text-2xl">{v.t}</h2>
              <p className="mt-2 text-[15px] text-stone2">{v.d}</p>
            </div>
          ))}
        </Container>
      </div>

      <Container className="grid items-center gap-10 py-14 lg:grid-cols-2">
        <div className="reveal img-frame aspect-[4/3] order-2 lg:order-1">
          <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1100&q=70" alt="Doctor reviewing notes with patient" loading="lazy" />
        </div>
        <div className="reveal order-1 lg:order-2">
          <Eyebrow>What a visit feels like</Eyebrow>
          <h2 className="font-serif-display mt-3 text-4xl">Calm from check-in to checkout.</h2>
          <ol className="mt-6 space-y-4 text-[15px] text-stone2">
            <li><strong className="text-charcoal">1. A real greeting.</strong> Reception knows your name and your appointment runs close to time.</li>
            <li><strong className="text-charcoal">2. Time to talk.</strong> Your doctor listens, examines with consent, and explains options.</li>
            <li><strong className="text-charcoal">3. Notes to take home.</strong> You leave with a written summary, not a vague memory.</li>
          </ol>
        </div>
      </Container>

      <div className="border-t hairline bg-white py-14">
        <Container>
          <div className="reveal flex items-end justify-between gap-4">
            <h2 className="font-serif-display text-4xl">Meet the team</h2>
            <Link to="/doctors" className="text-sm font-semibold text-pine link-underline">All profiles</Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {doctors.map((d) => (
              <Link key={d.id} to={`/doctors/${d.slug}`} className="reveal card-hover group rounded-xl3 border hairline bg-white p-5 text-center shadow-card">
                <DoctorAvatar name={d.name} />
                <p className="mt-3 font-semibold group-hover:text-pine">{d.name}</p>
                <p className="text-sm text-stone2">{d.role}</p>
              </Link>
            ))}
          </div>
        </Container>
      </div>

      <Container className="grid gap-8 py-14 md:grid-cols-2">
        <div className="reveal card-hover rounded-xl3 bg-pine p-8 text-ivory shadow-card">
          <h2 className="font-serif-display text-3xl text-white">Visit us</h2>
          <p className="mt-3 flex gap-2 text-ivory/85"><MapPin size={17} className="mt-0.5 shrink-0" /> {brand.address.line1}, {brand.address.line2}</p>
          <p className="mt-2 flex gap-2"><Phone size={17} className="mt-0.5 shrink-0" /> <span><a href={brand.phoneHref}>{brand.phone}</a><br /><a href={brand.mobileHref}>{brand.mobile}</a></span></p>
          <p className="mt-2 flex gap-2"><Mail size={17} className="mt-0.5 shrink-0" /> <a href={`mailto:${brand.email}`}>{brand.email}</a></p>
          <div className="mt-4 border-t border-white/15 pt-4 text-sm text-ivory/80">
            {brand.hours.map((h) => <p key={h.days} className="flex justify-between py-0.5"><span>{h.days}</span><span>{h.time}</span></p>)}
          </div>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-ivory/70"><Clock size={14} /> Fictional address for demonstration.</p>
        </div>
        <div className="reveal card-hover flex flex-col justify-center rounded-xl3 border hairline bg-mint p-8 shadow-card">
          <h2 className="font-serif-display text-3xl">Come and see for yourself.</h2>
          <p className="mt-3 text-stone2">Choose a visit type and a time that suits your week. Booking takes a few minutes.</p>
          <Link to="/book" className="btn-transition mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-pine px-7 py-3.5 font-semibold text-white hover:bg-pine-deep">Book an Appointment <ArrowRight size={16} /></Link>
        </div>
      </Container>
    </div>
  );
}
