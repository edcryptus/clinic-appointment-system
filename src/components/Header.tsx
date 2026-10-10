import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X, ChevronDown } from "lucide-react";
import { api, type Service } from "../lib/api";
import { brand } from "../config/brand";

const links = [
  { to: "/doctors", label: "Our Doctors" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [dropOpen, setDropOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setDropOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => setServices([]));
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-ivory/95 shadow-[0_12px_40px_-20px_rgba(23,76,73,0.35)] backdrop-blur-md" : "bg-ivory/60 backdrop-blur-sm"
      }`}
    >
      <div className="border-b hairline/0">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="Wellnest Medical Clinic home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine text-ivory" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="12" r="6" fill="#DCEFE7" />
              <path d="M7 27c1.4-5.2 4.9-7.9 9-7.9s7.6 2.7 9 7.9" stroke="#FAF9F6" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="font-serif-display block text-[21px] text-pine">{brand.shortName}</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-stone2">{brand.subName}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          <NavLink to="/" className={({ isActive }) => `link-underline text-[15px] font-medium ${isActive ? "text-pine font-semibold" : "text-charcoal hover:text-pine"}`}>
            Home
          </NavLink>
          <div
            className="relative"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 text-[15px] font-medium text-charcoal hover:text-pine"
              aria-expanded={dropOpen}
              aria-haspopup="true"
              onClick={() => setDropOpen((v) => !v)}
            >
              Services <ChevronDown size={15} className={`transition-transform ${dropOpen ? "rotate-180" : ""}`} />
            </button>
            {dropOpen && (
              <div className="absolute left-1/2 top-full w-[360px] -translate-x-1/2 pt-4">
                <div className="max-h-[60vh] overflow-y-auto rounded-2xl border hairline bg-white p-2 shadow-lift">
                  <Link
                    to="/services"
                    className="block rounded-xl px-4 py-3.5 text-sm font-semibold text-pine hover:bg-mint-pale"
                  >
                    View all services →
                  </Link>
                  <div className="my-1 border-t hairline" />
                  {services.map((s) => (
                    <Link
                      key={s.id}
                      to={`/services/${s.slug}`}
                      className="block rounded-xl px-4 py-2.5 text-sm text-charcoal hover:bg-mint-pale"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `link-underline text-[15px] font-medium ${isActive ? "text-pine" : "text-charcoal hover:text-pine"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/find-appointment"
            className="text-[14px] font-semibold text-pine/80 hover:text-pine"
          >
            Find my visit
          </Link>
          <Link
            to="/book"
            className="btn-transition inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-[14px] font-semibold text-white shadow-card hover:bg-pine-deep"
          >
            Book an Appointment <ArrowRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border hairline bg-white lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[76px] bottom-0 z-50 overflow-y-auto bg-ivory px-5 pb-10 pt-2 lg:hidden" role="dialog" aria-label="Site menu">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {[{ to: "/", label: "Home" }, { to: "/services", label: "Services" }, ...links, { to: "/find-appointment", label: "Find My Appointment" }].map((l, i) => (
              <Link
                key={l.to + l.label}
                to={l.to}
                className="group flex items-baseline gap-3 rounded-xl px-4 py-3.5 hover:bg-mint"
              >
                <span className="font-mono text-xs text-sage-dark">0{i + 1}</span>
                <span className="font-serif-display text-2xl text-charcoal group-hover:text-pine">{l.label}</span>
              </Link>
            ))}
            <Link
              to="/book"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-pine px-6 py-4 text-base font-semibold text-white"
            >
              Book an Appointment <ArrowRight size={18} />
            </Link>
            <p className="mt-4 px-4 text-sm text-stone2">Mon to Fri, 8 AM to 6 PM. Sat 9 AM to 1 PM.</p>
          </nav>
        </div>
      )}
    </header>
  );
}
