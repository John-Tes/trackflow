import axios from "axios";
const host = window.location.hostname;
export const API_BASE = import.meta.env.VITE_API_URL || `http://${host}:8000/api/v1`;
export const WS_BASE = import.meta.env.VITE_WS_URL || `${window.location.protocol === "https:" ? "wss" : "ws"}://${host}:8000`;
export const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((c) => {
  const t = sessionStorage.getItem("access");
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const CODE_RE = /^TRK-[A-Z0-9]{8}$/;
export const NEXT = {
  CREATED: ["PICKED_UP"], PICKED_UP: ["PROCESSING", "IN_TRANSIT"], PROCESSING: ["IN_TRANSIT"],
  IN_TRANSIT: ["ARRIVED_AT_DESTINATION"], ARRIVED_AT_DESTINATION: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED"], DELAYED: ["IN_TRANSIT", "OUT_FOR_DELIVERY"], DELIVERED: [], CANCELLED: [],
};
export const label = (s) => s.replaceAll("_", " ");
