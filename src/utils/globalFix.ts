
// Fix for window global in Web Workers
if (typeof window !== 'undefined') {
    (window as any).global ||= window;
}

export {};