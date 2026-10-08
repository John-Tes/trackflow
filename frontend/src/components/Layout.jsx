import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { Button, Container } from "./ui";
import { SITE } from "../lib/content";

const NAV = [
  ["Home", "/"],
  ["Track Parcel", "/track"],
  ["Services", "/services"],
  ["How It Works", "/how-it-works"],
  ["About Us", "/about"],
  ["Contact", "/contact"],
];
const link = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition hover:text-indigo-700 ${isActive ? "text-indigo-700" : "text-slate-700"}`;

function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link
          to="/"
          aria-label="TrackFlowUK home"
          className="rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV.map(([t, to]) => (
            <NavLink key={to} to={to} end={to === "/"} className={link}>
              {t}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button to="/quote" variant="secondary" className="!px-4 !py-2">
            Get a Quote
          </Button>
          <Button to="/track" className="!px-4 !py-2">
            Track Parcel
          </Button>
        </div>
        <button
          className="rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </Container>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 lg:hidden"
        >
          <ul className="space-y-1">
            {[...NAV.slice(0, 5), ["FAQs", "/faq"], NAV[5]].map(([t, to]) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  className={(s) => `block ${link(s)} !py-3 !text-base`}
                >
                  {t}
                </NavLink>
              </li>
            ))}
          </ul>
          <Button to="/quote" className="mt-4 w-full">
            Get a Quote
          </Button>
        </nav>
      )}
    </header>
  );
}

const COLS = [
  [
    "Company",
    [
      ["About", "/about"],
      ["Services", "/services"],
      ["How It Works", "/how-it-works"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  ],
  [
    "Customer",
    [
      ["Track Parcel", "/track"],
      ["Get a Quote", "/quote"],
      ["Help", "/help"],
    ],
  ],
  [
    "Legal",
    [
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
      ["Cookie Policy", "/cookies"],
    ],
  ],
];
function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <Container className="grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo dark />
          <p className="mt-4 text-sm">
            Reliable courier delivery with real-time tracking and complete
            visibility.
          </p>
        </div>
        {COLS.map(([h, items]) => (
          <nav key={h} aria-label={h}>
            <h2 className="text-sm font-semibold text-white">{h}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {items.map(([t, to]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="hover:text-white focus:outline-none focus:underline"
                  >
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </Container>
      <div className="border-t border-slate-800 py-5 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Navbar />
      <div id="main" className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
