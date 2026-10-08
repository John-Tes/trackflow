export function LogoMark({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#4f46e5" />
      <path d="M7 21c4 0 5-10 9-10s4 8 9 8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="25" cy="19" r="2.6" fill="#fff" />
    </svg>
  );
}
export default function Logo({ compact = false, dark = false }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label="TrackFlowUK">
      <LogoMark />
      {!compact && (
        <span className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
          TrackFlow<span className={dark ? "text-indigo-300" : "text-indigo-600"}>UK</span>
        </span>
      )}
    </span>
  );
}
