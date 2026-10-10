import { Link } from "react-router-dom";
import { ArrowRight, Home } from "lucide-react";
import { Container } from "../components/ui";

export default function NotFound() {
  return (
    <div className="page-hero-band border-b hairline pt-28 sm:pt-32">
      <Container className="max-w-2xl pb-20 pt-6 text-center">
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 -m-6 rounded-full bg-mint blur-2xl" aria-hidden="true" />
          <p className="font-serif-display relative text-[120px] leading-none text-pine sm:text-[160px]">404</p>
        </div>
        <p className="eyebrow mx-auto mt-2">Lost your way?</p>
        <h1 className="font-serif-display mt-2 text-4xl">This page seems to have stepped out.</h1>
        <p className="mx-auto mt-3 max-w-md text-stone2">The page you asked for is not here. You can head home, browse services, or book a visit instead.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-transition inline-flex items-center gap-2 rounded-full bg-pine px-6 py-3 text-sm font-semibold text-white hover:bg-pine-deep"><Home size={15} /> Back home</Link>
          <Link to="/book" className="btn-transition inline-flex items-center gap-2 rounded-full border border-pine/30 px-6 py-3 text-sm font-semibold text-pine hover:border-pine">Book a visit <ArrowRight size={15} /></Link>
        </div>
      </Container>
    </div>
  );
}
