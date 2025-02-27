import type { StorageAdapter } from './storage';

export default defineNuxtPlugin(() => {
  const clientStorage: StorageAdapter = {
    setItem: (k: string, v: string) => localStorage.setItem(k, v),
    getItem: (k: string) => localStorage.getItem(k),
    removeItem: (k: string) => localStorage.removeItem(k)
  };

  return { provide: { storage: clientStorage } };
}); 