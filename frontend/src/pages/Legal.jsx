import { PageHeader, Section } from "../components/ui";
import { useSeo } from "../lib/useSeo";
const DOCS = {
  privacy: ["Privacy Policy", ["What we collect: tracking lookups, and details you submit through our forms.", "How we use it: to provide tracking and respond to your enquiries.", "Your rights: you can ask about, correct or delete your data. Contact us to do so."]],
  terms: ["Terms & Conditions", ["Services: delivery times shown are estimates and are not guaranteed.", "Tracking: information is provided as updated by our team and may change.", "Liability: to be defined in your final terms."]],
  cookies: ["Cookie Policy", ["This site uses only essential storage needed for it to work.", "If analytics or marketing cookies are added later, this policy and a consent notice must be updated."]],
};
export default function Legal({ doc }) {
  const [title, paras] = DOCS[doc];
  useSeo(title, `${title} for TrackFlowUK.`);
  return (
    <><PageHeader title={title} />
      <Section><div className="max-w-3xl space-y-4">
        <p role="note" className="rounded-xl bg-amber-50 p-4 text-amber-900">Template only. This text is a placeholder and must be reviewed by a qualified professional before real-world use.</p>
        {paras.map((t) => <p key={t} className="text-slate-700">{t}</p>)}
      </div></Section></>
  );
}
