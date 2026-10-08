import { CTASection, PageHeader, Section, Icon } from "../components/ui";
import { useSeo } from "../lib/useSeo";
const STEPS = [["CalendarClock", "Book", "Request a delivery or arrange a collection."], ["PackageCheck", "Collect", "Your parcel is collected from the specified location."],
  ["MapPin", "Track", "Follow your parcel's journey in real time."], ["Home", "Deliver", "Your parcel arrives at its destination."]];
export default function HowItWorks() {
  useSeo("How It Works", "Book, collect, track and deliver: how TrackFlowUK gets your parcel from A to B.");
  return (
    <>
      <PageHeader eyebrow="How it works" title="Four simple steps from collection to door">Every step is visible, from booking to delivery.</PageHeader>
      <Section>
        <ol className="relative space-y-8 border-l-2 border-indigo-100 pl-8 md:grid md:grid-cols-4 md:gap-6 md:space-y-0 md:border-l-0 md:border-t-2 md:pl-0 md:pt-10">
          {STEPS.map(([ic, t, d], i) => (
            <li key={t} className="fade-up relative" style={{ animationDelay: `${i * 120}ms` }}>
              <span className="absolute -left-[50px] flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 font-bold text-white md:-top-[58px] md:left-0">{i + 1}</span>
              <Icon name={ic} className="text-indigo-600" size={26} />
              <h2 className="mt-3 text-lg font-semibold uppercase tracking-wide">{t}</h2>
              <p className="mt-1 text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
      </Section>
      <CTASection />
    </>
  );
}
