import { Message } from "../types";

const STORAGE_KEY = 'neonflow_messages';
const CHANNEL_NAME = 'neonflow_channel';

// Broadcast a message to other tabs
export const broadcastMessage = (message: Message) => {
  // We use the storage event to trigger updates in the Display tab
  // The storage event only fires on *other* tabs, which is perfect here.
  
  // 1. Get existing (optional, mostly for persistence if we refreshed)
  const existing = getStoredMessages();
  const updated = [...existing.slice(-50), message]; // Keep last 50
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // 2. Trigger an event manually if we are in the same window (edge case), 
  // but primarily we rely on the 'storage' event listener in the other tab.
  // We also set a specific "trigger" key to ensure the event fires even if the list is identical (rare).
  localStorage.setItem(CHANNEL_NAME, JSON.stringify({ timestamp: Date.now(), message }));
};

export const getStoredMessages = (): Message[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const subscribeToMessages = (callback: (msg: Message) => void) => {
  const handler = (event: StorageEvent) => {
    if (event.key === CHANNEL_NAME && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue);
        if (payload && payload.message) {
          callback(payload.message);
        }
      } catch (e) {
        console.error("Failed to parse message event", e);
      }
    }
  };

  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
};
