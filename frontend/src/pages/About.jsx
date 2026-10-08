import { Card, CTASection, IconBox, PageHeader, Section } from "../components/ui";
import { useSeo } from "../lib/useSeo";
const BLOCKS = [["Target", "Our mission", "To make parcel delivery transparent, so you always know where your shipment is."],
  ["Route", "Our approach", "Every parcel has a complete tracking history, updated as its journey progresses."],
  ["Cpu", "Technology & tracking", "Live updates reach your tracking page automatically, with no refreshing."],
  ["Heart", "Customer-first delivery", "Clear information and accessible support at every step."]];
export default function About() {
  useSeo("About Us", "TrackFlowUK is a technology-driven courier service focused on reliability and real-time visibility.");
  return (
    <>
      <PageHeader eyebrow="About us" title="Delivery built around visibility.">TrackFlowUK is a technology-driven courier service focused on reliability, transparency and customer experience.</PageHeader>
      <Section><div className="grid gap-4 sm:grid-cols-2">{BLOCKS.map(([i, t, d]) => <Card key={t}><IconBox name={i} /><h2 className="mt-4 font-semibold">{t}</h2><p className="mt-1 text-slate-600">{d}</p></Card>)}</div></Section>
      <CTASection />
    </>
  );
}
