import { Compass } from "lucide-react";
import { Button, Container } from "../components/ui";
import { useSeo } from "../lib/useSeo";
export default function NotFound() {
  useSeo("Page not found", "This page could not be found.");
  return (
    <Container className="fade-up py-24 text-center">
      <Compass className="mx-auto text-indigo-600" size={48} />
      <p className="mt-4 text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-bold">Looks like this parcel took a wrong turn.</h1>
      <p className="mt-2 text-slate-600">We couldn't find the page you're looking for.</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Button to="/">Back Home</Button><Button to="/track" variant="secondary">Track a Parcel</Button></div>
    </Container>
  );
}
