import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, MapPin, Package, Radio, WifiOff } from "lucide-react";
import { CODE_RE, label, wakeServer } from "./api";
import { useTracking } from "./useTracking";

const fmt = (d) => (d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—");

export function Search({ initial = "" }) {
  const nav = useNavigate();
  const [v, setV] = useState(initial);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const c = v.trim().toUpperCase();
    if (!CODE_RE.test(c)) return setErr("Enter a valid tracking number, e.g. TRK-X7K92M4Q.");
    setErr(""); setSlow(false); setBusy(true);
    const ok = await wakeServer(() => setSlow(true));
    setBusy(false);
    if (!ok) return setErr("The server is taking too long to respond. Please try again.");
    nav(`/track/${c}`);
  };
  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-md space-y-3" aria-busy={busy}>
      <label htmlFor="code" className="sr-only">Tracking number</label>
      <input id="code" value={v} onChange={(e) => setV(e.target.value)} placeholder="TRK-X7K92M4Q" autoComplete="off" disabled={busy}
        aria-invalid={!!err} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-4 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60" />
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-80">
        {busy && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {busy ? (slow ? "Waking up server…" : "Tracking…") : "Track Package"}
      </button>
      <p role="status" className="min-h-5 text-sm text-slate-500">{busy && slow ? "Our server was resting. This can take up to a minute on the first request." : ""}</p>
    </form>
  );
}

const STEPS = ["CREATED", "PICKED_UP", "PROCESSING", "IN_TRANSIT", "ARRIVED_AT_DESTINATION", "OUT_FOR_DELIVERY", "DELIVERED"];
function Progress({ status }) {
  const i = STEPS.indexOf(status);
  if (i < 0) return null;
  const pct = Math.round(((i + 1) / STEPS.length) * 100);
  return (
    <div role="progressbar" aria-label="Delivery progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function TrackPage() {
  const { code } = useParams();
  const { data, isLoading, isError, error, live } = useTracking(code?.toUpperCase());
  const notFound = isError && error?.response?.status === 404;
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <header className="mb-8 text-center">
        <Package className="mx-auto mb-3 text-indigo-600" size={36} />
        <h1 className="text-3xl font-bold">Track your package</h1>
        <p className="mt-2 text-slate-600">Enter your tracking number to see the latest delivery updates in real time.</p>
      </header>
      <Search initial={code || ""} />
      {code && (
        <section className="mt-8" aria-live="polite">
          {isLoading && <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />}
          {notFound && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Tracking number not found.</p>}
          {isError && !notFound && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">Unable to load tracking information. Please try again.</p>}
          {data && (
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono text-slate-500">{data.tracking_code}</span>
                {live ? <span className="flex items-center gap-1 text-emerald-600"><Radio size={14} /> Live</span>
                      : <span className="flex items-center gap-1 text-amber-600"><WifiOff size={14} /> Live tracking temporarily disconnected.</span>}
              </div>
              <h2 className="text-2xl font-bold text-indigo-700">{label(data.status)}</h2>
              <Progress status={data.status} />
              <div>
                <p className="text-sm text-slate-500">Current location</p>
                <p className="flex items-center gap-1 font-medium"><MapPin size={16} />{data.current_location || "—"}</p>
              </div>
              <dl className="grid gap-3 sm:grid-cols-3">
                {[["Created", data.created_at], ["Pickup date", data.pickup_date], ["Delivery date", data.estimated_delivery]].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-slate-50 p-4"><dt className="text-sm text-slate-500">{k}</dt><dd className="font-medium">{fmt(v)}</dd></div>
                ))}
              </dl>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
