// Server-side only, mocks browser APIs

if (typeof globalThis !== 'undefined' && typeof window === 'undefined') {
  // Mock indexedDB for server
  globalThis.indexedDB = {
    open: () => ({
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
    }),
    deleteDatabase: () => ({}),
  }
}

export default {}
