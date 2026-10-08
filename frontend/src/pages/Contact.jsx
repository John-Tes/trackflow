import { useState } from "react";
import { Mail, Phone, Clock } from "lucide-react";
import { Button, Card, Input, PageHeader, Section, Textarea } from "../components/ui";
import { SITE } from "../lib/content";
import { useSeo } from "../lib/useSeo";

export default function Contact() {
  useSeo("Contact Us", "Get in touch with the TrackFlowUK team.");
  const [f, setF] = useState({}); const [errors, setErrors] = useState({}); const [sent, setSent] = useState(false);
  const p = (id) => ({ id, value: f[id] || "", error: errors[id], onChange: (e) => setF({ ...f, [id]: e.target.value }) });
  const submit = (e) => {
    e.preventDefault();
    const v = {};
    ["name", "email", "subject", "message"].forEach((k) => !(f[k] || "").trim() && (v[k] = "This field is required."));
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) v.email = "Enter a valid email address.";
    setErrors(v);
    if (Object.keys(v).length) return;
    // No message API exists yet: hand off to the user's email client when a contact address is configured.
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(`${f.message}\n\n${f.name} ${f.phone || ""}\n${f.email}`)}`;
    setSent(true);
  };
  const info = [[Mail, "Email", SITE.email], [Phone, "Phone", SITE.phone], [Clock, "Business hours", SITE.hours]].filter((x) => x[2]);
  return (
    <>
      <PageHeader eyebrow="Contact" title="We're here to help">Questions about a delivery? Send us a message.</PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="space-y-4 lg:col-span-1">
            <h2 className="font-semibold">Contact information</h2>
            {info.length ? info.map(([I, l, v]) => <p key={l} className="flex items-start gap-3 text-slate-600"><I size={18} className="mt-1 text-indigo-600" /><span><b className="block text-slate-900">{l}</b>{v}</span></p>)
              : <p className="text-slate-600">Contact details will be published here soon.</p>}
            <div className="space-y-2 border-t pt-4"><p className="text-sm font-medium">Need to track a parcel?</p><Button to="/track" variant="secondary" className="w-full">Track Your Parcel</Button>
              <p className="pt-2 text-sm font-medium">Looking for a delivery quote?</p><Button to="/quote" variant="secondary" className="w-full">Get a Quote</Button></div>
          </Card>
          <form onSubmit={submit} noValidate className="lg:col-span-2"><Card className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" {...p("name")} /><Input label="Email" type="email" {...p("email")} />
            <Input label="Phone (optional)" type="tel" {...p("phone")} /><Input label="Subject" {...p("subject")} />
            <div className="sm:col-span-2"><Textarea label="Message" {...p("message")} /></div>
            {!SITE.email && <p className="text-sm text-amber-700 sm:col-span-2">Messaging isn't available yet. Please check back soon.</p>}
            <div className="sm:col-span-2"><Button disabled={!SITE.email}>Send Message</Button></div>
            {sent && <p role="status" className="text-emerald-700 sm:col-span-2">Your email app should now open with your message.</p>}
          </Card></form>
        </div>
      </Section>
    </>
  );
}
