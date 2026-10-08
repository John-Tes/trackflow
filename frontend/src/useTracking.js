import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, WS_BASE } from "./api";

export function useTracking(code) {
  const qc = useQueryClient();
  const [live, setLive] = useState(false);
  const q = useQuery({
    enabled: !!code,
    queryKey: ["track", code],
    retry: false,
    queryFn: () => api.get(`/track/${code}/`).then((r) => r.data.data),
    refetchInterval: live ? false : 15000, // REST polling fallback while the socket is down
  });
  const ok = !!q.data;
  useEffect(() => {
    if (!ok) return;
    let ws,
      timer,
      tries = 0,
      dead = false;
    const open = () => {
      ws = new WebSocket(`${WS_BASE}/ws/tracking/${code}/`);
      ws.onopen = () => {
        tries = 0;
        setLive(true);
      };
      ws.onmessage = (e) =>
        qc.setQueryData(["track", code], JSON.parse(e.data).data);
      ws.onclose = () => {
        setLive(false);
        if (!dead)
          timer = setTimeout(open, Math.min(30000, 1000 * 2 ** tries++));
      };
    };
    open();
    return () => {
      dead = true;
      clearTimeout(timer);
      ws && ws.close();
    };
  }, [ok, code, qc]);
  return { ...q, live };
}
