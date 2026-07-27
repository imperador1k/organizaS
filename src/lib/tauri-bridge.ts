/**
 * Tauri Bridge — Utilities for detecting Tauri environment and wrapping IPC calls.
 *
 * WHY: The app needs to run both as a PWA (browser) and as a Tauri desktop app.
 * This module provides graceful degradation — Tauri-specific code only runs
 * when the app is inside the Tauri WebView.
 */

/** Returns true if the app is running inside a Tauri WebView */
export function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  return '__TAURI_INTERNALS__' in window;
}

/** Returns true if the app is running inside a Capacitor Native App (iOS/Android) */
export function isCapacitor(): boolean {
  if (typeof window === 'undefined') return false;
  return 'Capacitor' in window && (window as any).Capacitor.isNativePlatform();
}

/** Returns true if the app is running in ANY native desktop or mobile app container */
export function isNativeApp(): boolean {
  return isTauri() || isCapacitor();
}

/**
 * Invoke a Tauri command (IPC call to Rust backend).
 * No-ops gracefully when running outside Tauri.
 */
export async function tauriInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T | null> {
  if (!isTauri()) return null;

  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<T>(command, args);
  } catch (error) {
    console.error(`[TauriBridge] Failed to invoke command '${command}':`, error);
    return null;
  }
}

/**
 * Listen to a Tauri event emitted from the Rust backend.
 * Returns an unlisten function, or null if not in Tauri.
 */
export async function tauriListen<T>(
  event: string,
  callback: (payload: T) => void
): Promise<(() => void) | null> {
  if (!isTauri()) return null;

  try {
    const { listen } = await import('@tauri-apps/api/event');
    const unlisten = await listen<T>(event, (e) => callback(e.payload));
    return unlisten;
  } catch (error) {
    console.error(`[TauriBridge] Failed to listen to event '${event}':`, error);
    return null;
  }
}
