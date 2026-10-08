import { CTASection, FAQAccordion, PageHeader, Section } from "../components/ui";
import { FAQS } from "../lib/content";
import { useSeo } from "../lib/useSeo";
export default function Faq() {
  useSeo("FAQs", "Answers to common questions about tracking, delivery and quotes.");
  return (<><PageHeader eyebrow="FAQ" title="Frequently asked questions" /><Section><div className="mx-auto max-w-3xl"><FAQAccordion items={FAQS} /></div></Section><CTASection /></>);
}
