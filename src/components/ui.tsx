import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`eyebrow ${light ? "eyebrow--light" : ""}`}>{children}</p>;
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, copy, align = "left" }: { eyebrow: string; title: string; copy?: string; align?: "left" | "center" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow><span className={centered ? "mx-auto" : ""}>{eyebrow}</span></Eyebrow>
      <h2 className="font-serif-display mt-3 text-balance text-4xl leading-[1.08] text-charcoal sm:text-5xl">{title}</h2>
      {copy && <p className={`mt-4 text-[16px] leading-relaxed text-stone2 ${centered ? "mx-auto max-w-xl" : "max-w-xl"}`}>{copy}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, copy, meta }: { eyebrow: string; title: string; copy?: string; meta?: ReactNode }) {
  return (
    <div className="page-hero-band border-b hairline">
      <Container className="pb-10 pt-28 sm:pb-14 sm:pt-36">
        <div className="reveal max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-serif-display mt-4 text-balance text-5xl leading-[1.04] text-charcoal sm:text-6xl">{title}</h1>
          {copy && <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-stone2">{copy}</p>}
          {meta && <div className="mt-7">{meta}</div>}
        </div>
      </Container>
    </div>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="btn-transition inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-pine hover:border-pine"
      aria-live="polite"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copied" : label}
    </button>
  );
}
