import { useEffect } from "react";
function meta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
export function useSeo(title, description) {
  useEffect(() => {
    const t = `TrackFlowUK | ${title}`;
    document.title = t;
    meta("name", "description", description);
    meta("property", "og:title", t);
    meta("property", "og:description", description);
    meta("property", "og:type", "website");
  }, [title, description]);
}
