// MOCK pricing. Replace the body of getQuote with a call to a real pricing API; the UI only depends on this contract.
export const QUOTE_SERVICES = [
  { value: "same_day", label: "Same-Day Delivery", base: 12, perKg: 1.2, eta: "Same day" },
  { value: "next_day", label: "Next-Day Delivery", base: 6, perKg: 0.8, eta: "Next working day" },
  { value: "standard", label: "Standard Delivery", base: 4, perKg: 0.5, eta: "2-4 working days" },
  { value: "scheduled", label: "Scheduled Delivery", base: 7, perKg: 0.8, eta: "Your chosen window" },
];
export const PARCEL_TYPES = ["Document", "Small parcel", "Medium parcel", "Large parcel", "Fragile item"];
const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

export function validateQuote(f) {
  const e = {};
  const req = ["collection_postcode", "delivery_postcode", "collection_address", "delivery_address", "parcel_type", "service", "name", "email", "phone"];
  req.forEach((k) => !String(f[k] || "").trim() && (e[k] = "This field is required."));
  ["collection_postcode", "delivery_postcode"].forEach((k) => f[k] && !POSTCODE.test(f[k].trim()) && (e[k] = "Enter a valid UK postcode."));
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
  if (!(Number(f.weight) > 0)) e.weight = "Enter the parcel weight in kg.";
  return e;
}

export async function getQuote(f) {
  const s = QUOTE_SERVICES.find((x) => x.value === f.service);
  const vol = (Number(f.length) || 0) * (Number(f.width) || 0) * (Number(f.height) || 0) / 5000;
  const kg = Math.max(Number(f.weight), vol);
  return { price: Math.round((s.base + s.perKg * kg) * 100) / 100, currency: "GBP", eta: s.eta, service: s.label, estimate: true };
}
