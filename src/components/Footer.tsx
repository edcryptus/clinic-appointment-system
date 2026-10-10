import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { api, type Service } from "../lib/api";
import { brand } from "../config/brand";

export default function Footer() {
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    api.getServices().then(setServices).catch(() => setServices([]));
  }, []);

  return (
    <footer className="bg-pine-deep text-ivory/90">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-10 pt-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1.1fr]">
        <div>
          <p className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="12" r="6" fill="#DCEFE7" />
                <path d="M7 27c1.4-5.2 4.9-7.9 9-7.9s7.6 2.7 9 7.9" stroke="#FAF9F6" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="font-serif-display text-2xl text-white">{brand.name}</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ivory/70">
            Thoughtful healthcare, experienced doctors, and a calmer way to visit the clinic.
            A fictional demonstration practice.
          </p>
          <p className="mt-4 rounded-xl bg-white/8 p-3 text-xs leading-relaxed text-ivory/65">
            Demonstration content only. Contact details, doctors, and availability are invented
            for this example and do not belong to a real clinic.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Visit</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" to="/">Home</Link></li>
            <li><Link className="hover:text-white" to="/services">Services</Link></li>
            <li><Link className="hover:text-white" to="/doctors">Our Doctors</Link></li>
            <li><Link className="hover:text-white" to="/about">About Us</Link></li>
            <li><Link className="hover:text-white" to="/contact">Contact</Link></li>
            <li><Link className="hover:text-white" to="/book">Book an Appointment</Link></li>
            <li><Link className="hover:text-white" to="/find-appointment">Find My Appointment</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Care</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.map((s) => (
              <li key={s.id}>
                <Link className="hover:text-white" to={`/services/${s.slug}`}>{s.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Visit us</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5"><MapPin size={16} className="mt-0.5 shrink-0" /> <span>{brand.address.line1}<br />{brand.address.line2}</span></li>
            <li className="flex gap-2.5"><Phone size={16} className="mt-0.5 shrink-0" /> <span><a className="hover:text-white" href={brand.phoneHref}>{brand.phone}</a><br /><a className="hover:text-white" href={brand.mobileHref}>{brand.mobile}</a></span></li>
            <li className="flex gap-2.5"><Mail size={16} className="mt-0.5 shrink-0" /> <a className="hover:text-white" href={`mailto:${brand.email}`}>{brand.email}</a></li>
          </ul>
          <div className="mt-4 border-t border-white/15 pt-4 text-sm text-ivory/75">
            {brand.hours.map((h) => (
              <p key={h.days} className="flex justify-between gap-3 py-0.5"><span>{h.days}</span><span>{h.time}</span></p>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-ivory/60 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>Copyright {new Date().getFullYear()} {brand.name}. Demonstration website.</p>
          <p>Privacy notice: demo bookings stay in a local mock API and are never shared.</p>
        </div>
      </div>
    </footer>
  );
}
