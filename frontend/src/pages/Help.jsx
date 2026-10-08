import { Link } from "react-router-dom";
import { Card, IconBox, PageHeader, Section } from "../components/ui";
import { useSeo } from "../lib/useSeo";
const OPTS = [["Search", "Track a parcel", "/track"], ["Calculator", "Get a quote", "/quote"], ["HelpCircle", "Delivery question", "/faq"],
  ["Clock", "Delayed parcel", "/faq"], ["MapPinned", "Change delivery details", "/contact"], ["Headphones", "Contact support", "/contact"]];
export default function Help() {
  useSeo("Help", "Quick support options for tracking, quotes and delivery questions.");
  return (
    <><PageHeader eyebrow="Help" title="How can we help?" />
      <Section><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{OPTS.map(([i, t, to]) => (
        <Link key={t} to={to} className="group rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"><Card className="flex items-center gap-4 transition group-hover:shadow-md"><IconBox name={i} /><span className="font-semibold">{t}</span></Card></Link>))}</div></Section></>
  );
}
