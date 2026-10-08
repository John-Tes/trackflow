import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { api, label, NEXT, wakeServer } from "./api";

function Login({ onDone }) {
  const [f, setF] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSlow(false);
    setBusy(true);
    try {
      if (!(await wakeServer(() => setSlow(true)))) {
        setErr("The server is taking too long to respond. Please try again.");
        return;
      }
      const r = await api.post("/auth/login/", f);
      sessionStorage.setItem("access", r.data.access);
      onDone();
    } catch (ex) {
      setErr(
        ex.response
          ? "Invalid credentials."
          : "Unable to reach the server. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      className="mx-auto mt-24 w-full max-w-sm space-y-3 rounded-2xl border bg-white p-6 shadow-sm"
    >
      <h1 className="text-xl font-bold">Admin sign in</h1>
      <input
        aria-label="Username"
        placeholder="Username"
        className="w-full rounded-lg border p-2"
        onChange={(e) => setF({ ...f, username: e.target.value })}
      />
      <div className="relative">
        <input
          aria-label="Password"
          type={show ? "text" : "password"}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full rounded-lg border p-2 pr-10"
          onChange={(e) => setF({ ...f, password: e.target.value })}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {err && (
        <p role="alert" className="text-sm text-red-600">
          {err}
        </p>
      )}
      <button
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 font-semibold text-white disabled:cursor-wait disabled:opacity-80"
      >
        {busy && (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        )}
        {busy ? (slow ? "Waking up server…" : "Signing in…") : "Sign in"}
      </button>
      <p role="status" className="min-h-5 text-sm text-slate-500">
        {busy && slow
          ? "Our server was resting. This can take up to a minute."
          : ""}
      </p>
    </form>
  );
}

const EMPTY = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  pickup_address: "",
  delivery_address: "",
  package_description: "",
  package_type: "",
  weight_kg: "",
  estimated_delivery: "",
};

function CreateShipment({ onClose }) {
  const qc = useQueryClient();
  const [f, setF] = useState(EMPTY);
  const [created, setCreated] = useState(null);
  const [copied, setCopied] = useState(false);
  const m = useMutation({
    mutationFn: (b) => api.post("/shipments/", b).then((r) => r.data),
    onSuccess: (d) => {
      setCreated(d);
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const body = Object.fromEntries(
      Object.entries(f).filter(([, v]) => v !== ""),
    );
    if (body.estimated_delivery)
      body.estimated_delivery = new Date(body.estimated_delivery).toISOString();
    m.mutate(body);
  };
  const errs = m.error?.response?.data;

  if (created) {
    const url = `${window.location.origin}/track/${created.tracking_code}`;
    return (
      <div className="space-y-4 rounded-2xl border bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Shipment created. Tracking code:
        </p>
        <p className="font-mono text-3xl font-bold tracking-widest text-indigo-700">
          {created.tracking_code}
        </p>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <button
            onClick={() => {
              navigator.clipboard.writeText(created.tracking_code);
              setCopied(true);
            }}
            className="rounded-lg border px-4 py-2 font-medium"
          >
            {copied ? "Copied!" : "Copy tracking code"}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white"
          >
            Open tracking page
          </a>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-slate-600"
          >
            Done
          </button>
        </div>
      </div>
    );
  }
  const input = (k, text, type = "text", req = false) => (
    <label className="block text-sm">
      <span className="text-slate-600">
        {text}
        {req && " *"}
      </span>
      <input
        type={type}
        required={req}
        value={f[k]}
        onChange={set(k)}
        step={k === "weight_kg" ? "0.01" : undefined}
        className="mt-1 w-full rounded-lg border p-2"
      />
      {errs?.[k] && <span className="text-red-600">{errs[k]}</span>}
    </label>
  );
  return (
    <form
      onSubmit={submit}
      className="space-y-3 rounded-2xl border bg-white p-5 shadow-sm"
    >
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
        {input("estimated_delivery", "Estimated delivery", "datetime-local")}
      </div>
      {errs && !Object.keys(errs).some((k) => k in f) && (
        <p role="alert" className="text-sm text-red-600">
          {JSON.stringify(errs)}
        </p>
      )}
      <div className="flex gap-2">
        <button
          disabled={m.isPending}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {m.isPending ? "Creating…" : "Create & generate tracking code"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Row({ s }) {
  const qc = useQueryClient();
  const [next, setNext] = useState("");
  const [loc, setLoc] = useState("");
  const [saved, setSaved] = useState(false);
  const m = useMutation({
    mutationFn: (b) => api.post(`/shipments/${s.id}/events/`, b),
    onSuccess: () => {
      setNext("");
      setLoc("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      qc.invalidateQueries({ queryKey: ["shipments"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
    },
  });
  const msg = m.error?.response?.data;
  return (
    <li className="space-y-2 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono font-semibold">{s.tracking_code}</span>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
          {label(s.status)}
        </span>
      </div>
      <p className="text-sm text-slate-600">
        {s.customer_name} → {s.delivery_address}
      </p>
      <p className="text-sm text-slate-500">
        Current location: <b>{s.current_location || "not set"}</b>
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Current location"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          placeholder="New location, e.g. Lekki, Lagos"
          className="flex-1 rounded-lg border p-2"
        />
        <select
          aria-label="New status"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="rounded-lg border p-2"
        >
          <option value="">Keep status</option>
          {NEXT[s.status].map((x) => (
            <option key={x} value={x}>
              {label(x)}
            </option>
          ))}
        </select>
        <button
          disabled={m.isPending || (!next && !loc)}
          onClick={() =>
            m.mutate({
              ...(next && { status: next }),
              ...(loc && { location: loc }),
              description: next ? label(next) : "Location updated",
            })
          }
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          Update
        </button>
      </div>
      {saved && (
        <p className="text-sm text-emerald-600">
          Updated and sent to live viewers.
        </p>
      )}
      {msg && (
        <p role="alert" className="text-sm text-red-600">
          {JSON.stringify(msg.status || msg.detail || msg)}
        </p>
      )}
    </li>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(!!sessionStorage.getItem("access"));
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const list = useQuery({
    queryKey: ["shipments", search],
    enabled: authed,
    retry: false,
    queryFn: () =>
      api.get("/shipments/", { params: { search } }).then((r) => r.data),
  });
  const overview = useQuery({
    queryKey: ["overview"],
    enabled: authed,
    retry: false,
    queryFn: () => api.get("/dashboard/overview/").then((r) => r.data),
  });
  if (!authed || list.error?.response?.status === 401)
    return (
      <Login
        onDone={() => {
          setAuthed(true);
          list.refetch();
          overview.refetch();
        }}
      />
    );
  const c = overview.data?.counts;
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Shipments</h1>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white"
          >
            + New shipment
          </button>
        )}
      </div>
      {creating && <CreateShipment onClose={() => setCreating(false)} />}
      {c && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Total", c.total],
            ["Active", c.active],
            ["Out for delivery", c.out_for_delivery],
            ["Delivered", c.delivered],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border bg-white p-4">
              <p className="text-sm text-slate-500">{k}</p>
              <p className="text-2xl font-bold">{v}</p>
            </div>
          ))}
        </div>
      )}
      <input
        aria-label="Search shipments"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search code or customer"
        className="w-full rounded-lg border p-2"
      />
      {list.isLoading && (
        <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
      )}
      {list.data?.results.length === 0 && (
        <p className="text-slate-500">No shipments found.</p>
      )}
      <ul className="space-y-3">
        {list.data?.results.map((s) => (
          <Row key={s.id} s={s} />
        ))}
      </ul>
    </main>
  );
}
