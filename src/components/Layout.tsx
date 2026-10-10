import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useLenis } from "../hooks/useLenis";

export default function Layout() {
  useLenis();
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-pine focus:px-5 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Outlet />
        <ScrollRestoration />
      </main>
      <Footer />
    </div>
  );
}
