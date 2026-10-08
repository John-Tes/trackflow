import axios from "axios";

// Backend origin: Render in production, local server when running on localhost.
const PROD_ORIGIN = "https://trackflow-nl9x.onrender.com";
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const ORIGIN = isLocal
  ? `http://${window.location.hostname}:8000`
  : PROD_ORIGIN;

// VITE_* variables (set on Vercel) override the defaults if present.
export const API_BASE = import.meta.env.VITE_API_URL || `${ORIGIN}/api/v1`;
export const WS_BASE =
  import.meta.env.VITE_WS_URL || ORIGIN.replace(/^http/, "ws"); // https -> wss

export const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((c) => {
  const t = sessionStorage.getItem("access");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const CODE_RE = /^TRK-[A-Z0-9]{8}$/;
export const NEXT = {
  CREATED: ["PICKED_UP"],
  PICKED_UP: ["PROCESSING", "IN_TRANSIT"],
  PROCESSING: ["IN_TRANSIT"],
  IN_TRANSIT: ["ARRIVED_AT_DESTINATION"],
  ARRIVED_AT_DESTINATION: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELAYED: ["IN_TRANSIT", "OUT_FOR_DELIVERY"],
  DELIVERED: [],
  CANCELLED: [],
};
export const label = (s) => s.replaceAll("_", " ");
