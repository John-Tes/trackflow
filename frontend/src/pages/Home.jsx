import { Link } from "react-router-dom";
import { ArrowRight, Eye, Headphones, ShieldCheck, Cpu, Radio, Truck } from "lucide-react";
import { Badge, Button, Card, CTASection, Icon, IconBox, Section } from "../components/ui";
import { Search } from "../TrackPage"; // the existing tracking input: navigates to /track/:code
import { SERVICES, SITE } from "../lib/content";
import { useSeo } from "../lib/useSeo";

const WHY = [
  ["Eye", "Real-time visibility", "Know where your parcel is."], ["Radio", "Transparent delivery", "Clear tracking from collection to destination."],
  ["Truck", "Reliable service", "Designed around dependable delivery."], ["Cpu", "Smart technology", "Modern systems power the experience."],
  ["Headphones", "Customer support", "Help when you need it."], ["ShieldCheck", "Secure handling", "Your shipment information is protected."],
];

function RouteVisual() {
  return (
    <div className="fade-up relative mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-lg" aria-hidden="true">
      <svg viewBox="0 0 400 240" className="w-full">
        <path d="M40 190 C120 190 120 60 200 80 S320 40 360 50" fill="none" stroke="#c7d2fe" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 190 C120 190 120 60 200 80" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" className="route-dash" />
        <circle cx="40" cy="190" r="9" fill="#4f46e5" /><circle cx="200" cy="80" r="14" fill="#4f46e5" opacity=".2" /><circle cx="200" cy="80" r="8" fill="#4f46e5" />
        <circle cx="360" cy="50" r="9" fill="#fff" stroke="#94a3b8" strokeWidth="3" />
      </svg>
      <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-indigo-700"><Radio size={16} /> Live tracking</span>
        <span className="text-slate-500">Collected → In transit → Delivered</span>
      </div>
    </div>
  );
}

export default function Home() {
  useSeo("Track Your Parcel", "Reliable UK courier delivery with real-time parcel tracking from collection to destination.");
  return (
    <>
      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div className="fade-up">
            <Badge>UK courier delivery</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Your Parcel. Your Journey. Fully Tracked.</h1>
            <p className="mt-4 text-lg text-slate-600">Reliable courier delivery with real-time tracking from collection to destination.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button to="/track">Track Your Parcel <ArrowRight size={18} /></Button>
              <Button to="/quote" variant="secondary">Get a Quote</Button>
            </div>
          </div>
          <RouteVisual />
        </div>
      </section>

      <Section aria-labelledby="track-h">
        <Card className="mx-auto max-w-2xl text-center">
          <h2 id="track-h" className="text-2xl font-bold">Track your parcel</h2>
          <p className="mb-5 mt-1 text-slate-600">Enter your tracking number for real-time delivery updates.</p>
          <Search />
        </Card>
      </Section>

      <Section tone="white" className="!py-10">
        <dl className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {SITE.highlights.map(([a, b]) => <div key={a}><dt className="text-2xl font-bold text-indigo-600">{a}</dt><dd className="text-sm text-slate-600">{b}</dd></div>)}
        </dl>
      </Section>

      <Section>
        <div className="mb-8 flex items-end justify-between"><h2 className="text-2xl font-bold sm:text-3xl">Our services</h2><Link to="/services" className="font-semibold text-indigo-600 hover:underline">All services</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.slice(0, 3).map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`} className="group rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md"><IconBox name={s.icon} /><h3 className="mt-4 font-semibold">{s.title}</h3><p className="mt-1 text-slate-600">{s.desc}</p></Card>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Why TrackFlowUK</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map(([i, t, d]) => <Card key={t}><IconBox name={i} /><h3 className="mt-4 font-semibold">{t}</h3><p className="mt-1 text-slate-600">{d}</p></Card>)}
        </div>
      </Section>
      <CTASection />
    </>
  );
}
