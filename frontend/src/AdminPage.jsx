import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api, label, NEXT, wakeServer } from "./api";

function Login({ onDone }) {
  const [f, setF] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [show, setShow] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setSlow(false); setBusy(true);
    try {
      if (!(await wakeServer(() => setSlow(true)))) { setErr("The server is taking too long to respond. Please try again."); return; }
      const r = await api.post("/auth/login/", f);
      sessionStorage.setItem("access", r.data.access);
      onDone();
    } catch (ex) {
      setErr(ex.response ? "Invalid credentials." : "Unable to reach the server. Please try again.");
    } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="mx-auto mt-24 w-full max-w-sm space-y-3 rounded-2xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">Admin sign in</h1>
      <input aria-label="Username" placeholder="Username" className="w-full rounded-lg border p-2" onChange={(e) => setF({ ...f, username: e.target.value })} />
      <div className="relative">
        <input aria-label="Password" type={show ? "text" : "password"} placeholder="Password" autoComplete="current-password" className="w-full rounded-lg border p-2 pr-10" onChange={(e) => setF({ ...f, password: e.target.value })} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </div>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 font-semibold text-white disabled:cursor-wait disabled:opacity-80">
        {busy && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}{busy ? (slow ? "Waking up server…" : "Signing in…") : "Sign in"}</button>
      <p role="status" className="min-h-5 text-sm text-slate-500">{busy && slow ? "Our server was resting. This can take up to a minute." : ""}</p>
    </form>
  );
}

// ISO string from the API -> value for <input type="datetime-local"> (local time)
const toInput = (iso) => { if (!iso) return ""; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
const toIso = (v) => (v ? new Date(v).toISOString() : null);

const EMPTY = { customer_name: "", customer_phone: "", customer_email: "", pickup_address: "", delivery_address: "",
  package_description: "", package_type: "", weight_kg: "", estimated_delivery: "", pickup_date: "" };

function CreateShipment({ onClose }) {
  const qc = useQueryClient();
  const [f, setF] = useState(EMPTY);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const m = useMutation({
    mutationFn: (b) => api.post("/shipments/", b).then((r) => r.data),
    onSuccess: (d) => { setCreated(d); qc.invalidateQueries({ queryKey: ["shipments"] }); qc.invalidateQueries({ queryKey: ["overview"] }); },
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ""));
    if (body.estimated_delivery) body.estimated_delivery = toIso(body.estimated_delivery);
    if (body.pickup_date) body.pickup_date = toIso(body.pickup_date);
    m.mutate(body);
  };
  const errs = m.error?.response?.data;

  if (created) {
    const url = `${window.location.origin}/track/${created.tracking_code}`;
    return (
      <div className="space-y-4 rounded-2xl border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">Shipment created. Tracking code:</p>
        <p className="font-mono text-3xl font-bold tracking-widest text-indigo-700">{created.tracking_code}</p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <button onClick={() => { navigator.clipboard.writeText(created.tracking_code); setCopied(true); }}
            className="rounded-lg border px-4 py-2 font-medium">{copied ? "Copied!" : "Copy tracking code"}</button>
          <a href={url} target="_blank" rel="noreferrer" className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white">Open tracking page</a>
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-slate-600">Done</button>
        </div>
      </div>
    );
  }
  const input = (k, text, type = "text", req = false) => (
    <label className="block text-sm"><span className="text-slate-600">{text}{req && " *"}</span>
      <input type={type} required={req} value={f[k]} onChange={set(k)} step={k === "weight_kg" ? "0.01" : undefined}
        className="mt-1 w-full rounded-lg border p-2" />
      {errs?.[k] && <span className="text-red-600">{errs[k]}</span>}
    </label>
  );
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">New shipment</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {input("customer_name", "Customer name", "text", true)}
        {input("customer_phone", "Customer phone", "tel", true)}
        {input("customer_email", "Customer email", "email")}
        {input("package_type", "Package type")}
        {input("pickup_address", "Pickup address", "text", true)}
        {input("delivery_address", "Delivery address", "text", true)}
        {input("package_description", "Package description")}
        {input("weight_kg", "Weight (kg)", "number")}
        {input("pickup_date", "Pickup date", "datetime-local")}
        {input("estimated_delivery", "Delivery date", "datetime-local")}
      </div>
      {errs && !Object.keys(errs).some((k) => k in f) && <p role="alert" className="text-sm text-red-600">{JSON.stringify(errs)}</p>}
      <div className="flex gap-2">
        <button disabled={m.isPending} className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50">
          {m.isPending ? "Creating…" : "Create & generate tracking code"}</button>
        <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-slate-600">Cancel</button>
      </div>
    </form>
  );
}

function EventDate({ shipmentId, ev }) {
  const qc = useQueryClient();
  const [v, setV] = useState(toInput(ev.created_at));
  const [ok, setOk] = useState(false);
  const m = useMutation({
    mutationFn: (iso) => api.patch(`/shipments/${shipmentId}/events/${ev.id}/`, { created_at: iso }),
    onSuccess: () => { setOk(true); setTimeout(() => setOk(false), 3000); qc.invalidateQueries({ queryKey: ["shipments"] }); },
  });
  return (
    <li className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span className="flex-1 text-sm"><b>{label(ev.status)}</b>{ev.description ? ` · ${ev.description}` : ""}</span>
      <input type="datetime-local" aria-label={`Date for ${label(ev.status)}`} value={v} onChange={(x) => setV(x.target.value)} className="rounded-lg border p-2" />
      <button disabled={!v || m.isPending} onClick={() => m.mutate(toIso(v))} className="rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50">
        {m.isPending ? "Saving…" : ok ? "Saved ✓" : "Save"}</button>
      {m.isError && <span role="alert" className="text-sm text-red-600">Failed</span>}
    </li>
  );
}

function Row({ s }) {
  const qc = useQueryClient();
  const [next, setNext] = useState("");
  const [loc, setLoc] = useState("");
  const [saved, setSaved] = useState(false);
  const [pd, setPd] = useState(toInput(s.pickup_date));
  const [dd, setDd] = useState(toInput(s.estimated_delivery));
  const [dSaved, setDSaved] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const del = useMutation({
    mutationFn: () => api.delete(`/shipments/${s.id}/`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shipments"] }); qc.invalidateQueries({ queryKey: ["overview"] }); },
  });
  const dm = useMutation({
    mutationFn: (b) => api.patch(`/shipments/${s.id}/`, b),
    onSuccess: () => { setDSaved(true); setTimeout(() => setDSaved(false), 3000); qc.invalidateQueries({ queryKey: ["shipments"] }); },
  });
  const m = useMutation({
    mutationFn: (b) => api.post(`/shipments/${s.id}/events/`, b),
    onSuccess: () => { setNext(""); setLoc(""); setSaved(true); setTimeout(() => setSaved(false), 3000); qc.invalidateQueries({ queryKey: ["shipments"] }); qc.invalidateQueries({ queryKey: ["overview"] }); },
  });
  const msg = m.error?.response?.data;
  return (
    <li className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono font-semibold">{s.tracking_code}</span>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{label(s.status)}</span>
      </div>
      <p className="text-sm text-slate-600">{s.customer_name} → {s.delivery_address}</p>
      <p className="text-sm text-slate-500">Current location: <b>{s.current_location || "not set"}</b></p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input aria-label="Current location" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="New location, e.g. Lekki, Lagos" className="flex-1 rounded-lg border p-2" />
        <select aria-label="New status" value={next} onChange={(e) => setNext(e.target.value)} className="rounded-lg border p-2">
          <option value="">Keep status</option>
          {NEXT[s.status].map((x) => <option key={x} value={x}>{label(x)}</option>)}
        </select>
        <button disabled={m.isPending || (!next && !loc)} onClick={() => m.mutate({ ...(next && { status: next }), ...(loc && { location: loc }), description: next ? label(next) : "Location updated" })}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50">Update</button>
      </div>
      <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm text-slate-600">Pickup date
          <input type="datetime-local" value={pd} onChange={(e) => setPd(e.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label>
        <label className="flex-1 text-sm text-slate-600">Delivery date
          <input type="datetime-local" value={dd} onChange={(e) => setDd(e.target.value)} className="mt-1 w-full rounded-lg border p-2" /></label>
        <button disabled={dm.isPending} onClick={() => dm.mutate({ pickup_date: toIso(pd), estimated_delivery: toIso(dd) })}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50">{dm.isPending ? "Saving…" : "Save dates"}</button>
      </div>
      {dSaved && <p className="text-sm text-emerald-600">Dates saved and sent to live viewers.</p>}
      {dm.isError && <p role="alert" className="text-sm text-red-600">Unable to save dates. Please check the values and try again.</p>}
      <details className="border-t pt-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">Edit timeline dates ({(s.events || []).length})</summary>
        <ul className="mt-3 space-y-3">{(s.events || []).map((ev) => <EventDate key={ev.id} shipmentId={s.id} ev={ev} />)}</ul>
      </details>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
        {confirmDel ? (
          <>
            <span className="text-sm text-red-700">Delete this shipment permanently?</span>
            <button onClick={() => del.mutate()} disabled={del.isPending} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">{del.isPending ? "Deleting…" : "Yes, delete"}</button>
            <button onClick={() => setConfirmDel(false)} className="rounded-lg px-3 py-2 text-sm">Cancel</button>
          </>
        ) : <button onClick={() => setConfirmDel(true)} className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Delete shipment</button>}
      </div>
      {del.isError && <p role="alert" className="text-sm text-red-600">{del.error?.response?.status === 403 ? "You do not have permission to delete shipments." : "Unable to delete. Please try again."}</p>}
      {saved && <p className="text-sm text-emerald-600">Updated and sent to live viewers.</p>}
      {msg && <p role="alert" className="text-sm text-red-600">{JSON.stringify(msg.status || msg.detail || msg)}</p>}
    </li>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(!!sessionStorage.getItem("access"));
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const list = useQuery({ queryKey: ["shipments", search], enabled: authed, retry: false,
    queryFn: () => api.get("/shipments/", { params: { search } }).then((r) => r.data) });
  const overview = useQuery({ queryKey: ["overview"], enabled: authed, retry: false, queryFn: () => api.get("/dashboard/overview/").then((r) => r.data) });
  if (!authed || list.error?.response?.status === 401)
    return <Login onDone={() => { setAuthed(true); list.refetch(); overview.refetch(); }} />;
  const c = overview.data?.counts;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipments</h1>
        {!creating && <button onClick={() => setCreating(true)} className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white">+ New shipment</button>}
      </div>
      {creating && <CreateShipment onClose={() => setCreating(false)} />}
      {c && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["Total", c.total], ["Active", c.active], ["Out for delivery", c.out_for_delivery], ["Delivered", c.delivered]].map(([k, v]) => (
          <div key={k} className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">{k}</p><p className="text-2xl font-bold">{v}</p></div>))}
      </div>}
      <input aria-label="Search shipments" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search code or customer" className="w-full rounded-lg border p-2" />
      {list.isLoading && <div className="h-24 animate-pulse rounded-xl bg-slate-200" />}
      {list.data?.results.length === 0 && <p className="text-slate-500">No shipments found.</p>}
      <ul className="space-y-3">{list.data?.results.map((s) => <Row key={s.id} s={s} />)}</ul>
    </main>
  );
}
