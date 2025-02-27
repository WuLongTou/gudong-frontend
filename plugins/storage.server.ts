import type { StorageAdapter } from './storage';

export default defineNuxtPlugin(() => {
  const serverStorage: StorageAdapter = {
    setItem: () => {},
    getItem: () => null,
    removeItem: () => {}
  };

  return { provide: { storage: serverStorage } };
}); 