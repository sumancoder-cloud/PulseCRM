import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// Empty string = use same origin → goes through Vite /socket.io proxy → backend:5000
const WS_URL = import.meta.env.VITE_WS_URL || '';

export function useRealtime({ onCommunicationUpdate, onCampaignStats, onCampaignLaunch, onCampaignCompleted, onActivity }) {
  const [connected, setConnected] = useState(false);
  const [activities, setActivities] = useState([]);
  const socketRef = useRef(null);

  // Store callbacks in refs so the socket useEffect never re-runs
  const callbacksRef = useRef({});
  callbacksRef.current = { onCommunicationUpdate, onCampaignStats, onCampaignLaunch, onCampaignCompleted, onActivity };

  const addActivity = useCallback((item) => {
    setActivities((prev) => [item, ...prev].slice(0, 50));
  }, []);

  useEffect(() => {
    // Only create one socket for the entire app lifecycle
    const socket = io(WS_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 8000,
      path: '/socket.io',
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket.id);
      setConnected(true);
    });
    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('system:connected', (data) => {
      addActivity({ type: 'system', message: data.message, time: data.time });
    });

    socket.on('activity', (data) => {
      addActivity(data);
      callbacksRef.current.onActivity?.(data);
    });

    socket.on('communication:update', (data) => {
      addActivity({
        type: 'event',
        message: `${data.customerName}: ${data.status}`,
        ...data,
      });
      callbacksRef.current.onCommunicationUpdate?.(data);
    });

    socket.on('campaign:stats', (data) => callbacksRef.current.onCampaignStats?.(data));

    socket.on('campaign:launch', (data) => {
      addActivity({ type: 'launch', message: `Campaign launched: ${data.name}`, ...data });
      callbacksRef.current.onCampaignLaunch?.(data);
    });

    socket.on('campaign:completed', (data) => {
      addActivity({ type: 'complete', message: `Campaign completed: ${data.name}`, ...data });
      callbacksRef.current.onCampaignCompleted?.(data);
    });

    // Cleanup only on unmount
    return () => {
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- empty deps = socket created ONCE, never torn down

  return { connected, activities };
}
