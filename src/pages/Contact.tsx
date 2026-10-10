import { useState } from "react";
import { CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { api } from "../lib/api";
import { brand } from "../config/brand";
import { isValidEmail } from "../lib/format";
import { Container, Eyebrow, PageHero } from "../components/ui";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General question");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Please enter your name.";
    if (!isValidEmail(email)) errs.email = "Enter a valid email address.";
    if (message.trim().length < 10) errs.message = "Tell us a little more, at least a sentence or two.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSending(true);
    setFail("");
    try {
      await api.submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
      setSent(true);
      setName(""); setEmail(""); setMessage("");
    } catch {
      setFail("Your message could not be saved. Make sure the mock API is running with npm run server, then try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <PageHero
        eyebrow="Contact us"
        title="We reply within one working day."
        copy="Questions about visits, doctors, or directions? Send a note or call during opening hours. For anything urgent, please call rather than using the form."
      />
      <Container className="grid gap-10 py-12 sm:py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>Visit or call</Eyebrow>
          <h2 className="font-serif-display mt-3 text-3xl">Find us in the neighborhood.</h2>
          <ul className="mt-6 space-y-3 text-[15px]">
            <li className="card-hover flex gap-2.5 rounded-2xl border hairline bg-white p-4 shadow-card"><MapPin size={17} className="mt-0.5 shrink-0 text-pine" /> {brand.address.line1}, {brand.address.line2}</li>
            <li className="card-hover flex gap-2.5 rounded-2xl border hairline bg-white p-4 shadow-card"><Phone size={17} className="mt-0.5 shrink-0 text-pine" /> <span><a className="font-semibold text-pine" href={brand.phoneHref}>{brand.phone}</a><br /><a className="font-semibold text-pine" href={brand.mobileHref}>{brand.mobile}</a></span></li>
            <li className="card-hover flex gap-2.5 rounded-2xl border hairline bg-white p-4 shadow-card"><Mail size={17} className="mt-0.5 shrink-0 text-pine" /> <a className="font-semibold text-pine" href={`mailto:${brand.email}`}>{brand.email}</a></li>
          </ul>
          <div className="card-hover mt-6 rounded-xl3 border hairline bg-white p-5 text-sm shadow-card">
            {brand.hours.map((h) => <p key={h.days} className="flex justify-between py-1"><span>{h.days}</span><span className="font-semibold">{h.time}</span></p>)}
          </div>
        </div>
        <div className="rounded-xl3 border hairline bg-white p-6 shadow-card sm:p-8">
          {sent ? (
            <div className="py-10 text-center" role="status">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint text-pine"><CheckCircle2 size={26} /></span>
              <h2 className="font-serif-display mt-4 text-3xl">Message received.</h2>
              <p className="mx-auto mt-2 max-w-sm text-stone2">Thanks for writing. This demo saved your note to the local mock API. We will be in touch within one working day.</p>
              <button type="button" onClick={() => setSent(false)} className="mt-5 rounded-full bg-pine px-6 py-2.5 text-sm font-semibold text-white">Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <label>Your name<input value={name} onChange={(e) => setName(e.target.value)} className="field-input mt-1.5" autoComplete="name" aria-invalid={!!errors.name} />{errors.name && <span className="mt-1 block text-[13px] text-red-700">{errors.name}</span>}</label>
                <label>Your email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="field-input mt-1.5" autoComplete="email" aria-invalid={!!errors.email} />{errors.email && <span className="mt-1 block text-[13px] text-red-700">{errors.email}</span>}</label>
                <label className="sm:col-span-2">Subject
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="field-input mt-1.5">
                    <option>General question</option>
                    <option>Booking help</option>
                    <option>Prescriptions and follow-ups</option>
                    <option>Directions and parking</option>
                    <option>Feedback</option>
                  </select>
                </label>
                <label className="sm:col-span-2">Message<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="field-input mt-1.5" aria-invalid={!!errors.message} placeholder="How can we help?" />{errors.message && <span className="mt-1 block text-[13px] text-red-700">{errors.message}</span>}</label>
              </div>
              {fail && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{fail}</p>}
              <button type="submit" disabled={sending} className="btn-transition mt-5 inline-flex items-center gap-2 rounded-full bg-pine px-7 py-3.5 font-semibold text-white disabled:opacity-50 hover:bg-pine-deep">
                {sending ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : "Send message"}
              </button>
              <p className="mt-3 text-[13px] text-stone2">Demo note: messages are stored in the local JSON Server database only.</p>
            </form>
          )}
        </div>
      </Container>
      <div className="h-16" />
    </div>
  );
}
