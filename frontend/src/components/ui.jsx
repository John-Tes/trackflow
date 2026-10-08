import { Link } from "react-router-dom";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import * as Icons from "lucide-react";

export const cx = (...a) => a.filter(Boolean).join(" ");
export const Icon = ({ name, ...p }) => { const I = Icons[name] || Icons.Package; return <I {...p} />; };

export function Button({ to, variant = "primary", className, children, ...p }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[.98] disabled:opacity-50";
  const v = { primary: "bg-indigo-600 text-white hover:bg-indigo-700", secondary: "border border-slate-300 bg-white text-slate-800 hover:border-indigo-300 hover:text-indigo-700", ghost: "text-slate-700 hover:bg-slate-100" }[variant];
  return to ? <Link to={to} className={cx(base, v, className)} {...p}>{children}</Link> : <button className={cx(base, v, className)} {...p}>{children}</button>;
}
export const Container = ({ className, children }) => <div className={cx("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
export const Section = ({ tone, className, children, ...p }) => (
  <section className={cx("py-14 sm:py-20", tone === "white" && "border-y border-slate-200 bg-white", className)} {...p}><Container>{children}</Container></section>
);
export const Card = ({ className, children }) => <div className={cx("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6", className)}>{children}</div>;
export const IconBox = ({ name }) => <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Icon name={name} size={22} /></span>;
export const Badge = ({ children }) => <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">{children}</span>;

export function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <Container className="fade-up py-12 sm:py-16">
        {eyebrow && <Badge>{eyebrow}</Badge>}
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {children && <p className="mt-3 max-w-2xl text-lg text-slate-600">{children}</p>}
      </Container>
    </header>
  );
}

const field = "mt-1 w-full rounded-xl border bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500";
function Wrap({ label, error, id, children }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
const aria = (id, error) => ({ id, name: id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-err` : undefined });
export const Input = ({ id, label, error, ...p }) => <Wrap {...{ id, label, error }}><input {...aria(id, error)} {...p} className={cx(field, error ? "border-red-400" : "border-slate-300")} /></Wrap>;
export const Select = ({ id, label, error, children, ...p }) => <Wrap {...{ id, label, error }}><select {...aria(id, error)} {...p} className={cx(field, error ? "border-red-400" : "border-slate-300")}>{children}</select></Wrap>;
export const Textarea = ({ id, label, error, ...p }) => <Wrap {...{ id, label, error }}><textarea rows={5} {...aria(id, error)} {...p} className={cx(field, error ? "border-red-400" : "border-slate-300")} /></Wrap>;

export function CTASection() {
  return (
    <Section>
      <div className="rounded-3xl bg-indigo-600 px-6 py-12 text-center text-white sm:px-12">
        <h2 className="text-2xl font-bold sm:text-3xl">Know where your parcel is, every step of the way.</h2>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/track" className="bg-white !text-indigo-700 hover:bg-indigo-50">Track Your Parcel</Button>
          <Button to="/quote" className="border border-white/60 bg-transparent hover:bg-indigo-700">Get a Quote</Button>
        </div>
      </div>
    </Section>
  );
}

export function FAQAccordion({ items }) {
  const [open, setOpen] = useState(0); // one item open at a time
  return (
    <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map(([q, a], i) => (
        <div key={q}>
          <h3>
            <button id={`faq-b${i}`} aria-expanded={open === i} aria-controls={`faq-p${i}`} onClick={() => setOpen(open === i ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500">
              {q}<ChevronDown size={18} className={cx("shrink-0 transition-transform", open === i && "rotate-180")} />
            </button>
          </h3>
          <div id={`faq-p${i}`} role="region" aria-labelledby={`faq-b${i}`} hidden={open !== i} className="px-5 pb-4 text-slate-600">{a}</div>
        </div>
      ))}
    </div>
  );
}
