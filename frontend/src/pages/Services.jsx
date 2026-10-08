import { Link, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { Button, Card, CTASection, IconBox, PageHeader, Section } from "../components/ui";
import { SERVICES } from "../lib/content";
import { useSeo } from "../lib/useSeo";
import NotFound from "./NotFound";

export function Services() {
  useSeo("Courier Services", "Same-day, next-day, standard, business and scheduled courier delivery with tracking.");
  return (
    <>
      <PageHeader eyebrow="Services" title="Courier services built around visibility">Choose the delivery service that fits your parcel, and track it all the way.</PageHeader>
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`} className="group rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <Card className="fade-up h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md"><IconBox name={s.icon} /><h2 className="mt-4 font-semibold">{s.title}</h2><p className="mt-1 text-slate-600">{s.desc}</p><p className="mt-3 text-sm font-semibold text-indigo-600">Learn more →</p></Card>
            </Link>
          ))}
        </div>
      </Section>
      <CTASection />
    </>
  );
}

export function ServiceDetail() {
  const s = SERVICES.find((x) => x.slug === useParams().slug);
  useSeo(s ? s.title : "Not found", s ? s.desc : "Page not found.");
  if (!s) return <NotFound />;
  return (
    <>
      <PageHeader eyebrow="Service" title={s.title}>{s.desc}</PageHeader>
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><h2 className="font-semibold">Benefits</h2><ul className="mt-3 space-y-2">{s.benefits.map((b) => <li key={b} className="flex gap-2 text-slate-600"><Check size={18} className="mt-0.5 shrink-0 text-emerald-600" />{b}</li>)}</ul></Card>
          <Card><h2 className="font-semibold">Suitable for</h2><ul className="mt-3 list-inside list-disc space-y-2 text-slate-600">{s.uses.map((u) => <li key={u}>{u}</li>)}</ul></Card>
          <Card><h2 className="font-semibold">Delivery expectations</h2><p className="mt-3 text-slate-600">{s.expect}</p></Card>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button to="/quote">Get a Quote</Button><Button to="/track" variant="secondary">Track Parcel</Button></div>
      </Section>
    </>
  );
}
