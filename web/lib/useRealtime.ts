"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface RealtimeEvent {
  id?: number | string;
  eventType: string;
  targetUserId: string;
  payload: any;
  createdAt: string;
}

export function useRealtime(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [eventHistory, setEventHistory] = useState<RealtimeEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      try {
        es = new EventSource("/api/realtime");
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
        };

        es.onmessage = (e) => {
          try {
            const data: RealtimeEvent = JSON.parse(e.data);
            if (!userId || data.targetUserId === "ALL" || data.targetUserId === userId) {
              setLastEvent(data);
              setEventHistory((prev) => [data, ...prev.slice(0, 49)]);
            }
          } catch (err) {
            // ignore non-json keepalive
          }
        };

        es.onerror = () => {
          setIsConnected(false);
          es?.close();
          // Auto-reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (err) {
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      es?.close();
    };
  }, [userId]);

  return { isConnected, lastEvent, eventHistory };
}
