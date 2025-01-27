// Fix for window global in Web Workers
if (typeof window !== 'undefined') {
  window.global = window as any as typeof globalThis;
}

export {};