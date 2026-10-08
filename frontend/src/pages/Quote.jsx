import { useState } from "react";
import { Button, Card, Input, PageHeader, Section, Select } from "../components/ui";
import { PARCEL_TYPES, QUOTE_SERVICES, getQuote, validateQuote } from "../lib/quoteService";
import { useSeo } from "../lib/useSeo";

export default function Quote() {
  useSeo("Get a Delivery Quote", "Get a quick estimate for UK courier delivery with TrackFlowUK.");
  const [f, setF] = useState({ service: "next_day" });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState("");
  const p = (id) => ({ id, value: f[id] || "", error: errors[id], onChange: (e) => setF({ ...f, [id]: e.target.value }) });
  const submit = async (e) => {
    e.preventDefault(); setFail("");
    const v = validateQuote(f); setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try { setResult(await getQuote(f)); } catch { setFail("Unable to calculate a quote. Please try again."); } finally { setBusy(false); }
  };
  return (
    <>
      <PageHeader eyebrow="Get a quote" title="Get a delivery quote">Tell us about your parcel and route to see an estimate.</PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={submit} noValidate className="space-y-4 lg:col-span-2">
            <Card className="grid gap-4 sm:grid-cols-2">
              <Input label="Collection postcode" placeholder="SW1A 1AA" {...p("collection_postcode")} />
              <Input label="Delivery postcode" placeholder="M1 1AE" {...p("delivery_postcode")} />
              <Input label="Collection address" {...p("collection_address")} />
              <Input label="Delivery address" {...p("delivery_address")} />
              <Select label="Parcel type" {...p("parcel_type")}><option value="">Select…</option>{PARCEL_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
              <Input label="Weight (kg)" type="number" min="0" step="0.1" {...p("weight")} />
              <Input label="Length (cm)" type="number" min="0" {...p("length")} />
              <Input label="Width (cm)" type="number" min="0" {...p("width")} />
              <Input label="Height (cm)" type="number" min="0" {...p("height")} />
              <Select label="Delivery service" {...p("service")}>{QUOTE_SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select>
              <Input label="Preferred collection date" type="date" {...p("date")} />
            </Card>
            <Card className="grid gap-4 sm:grid-cols-2">
              <Input label="Your name" {...p("name")} />
              <Input label="Email" type="email" {...p("email")} />
              <Input label="Phone" type="tel" {...p("phone")} />
            </Card>
            {fail && <p role="alert" className="text-red-600">{fail}</p>}
            <Button disabled={busy} className="w-full sm:w-auto">{busy ? "Calculating…" : "Get My Quote"}</Button>
          </form>
          <aside aria-live="polite">
            {result ? (
              <Card className="fade-up lg:sticky lg:top-24"><p className="text-sm text-slate-500">{result.service}</p>
                <p className="mt-1 text-4xl font-bold text-indigo-700">£{result.price.toFixed(2)}</p>
                <p className="mt-2 text-slate-600">Estimated delivery: {result.eta}</p>
                <p className="mt-4 text-sm text-slate-500">This is an estimate only. Online booking isn't available yet, so please contact us to confirm your delivery.</p>
                <Button to="/contact" className="mt-4 w-full">Contact us to book</Button></Card>
            ) : <Card><p className="text-slate-600">Your estimate will appear here.</p></Card>}
          </aside>
        </div>
      </Section>
    </>
  );
}
