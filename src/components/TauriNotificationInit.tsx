'use client';

import { useEffect } from 'react';
import { isTauri } from '@/lib/tauri-bridge';
import { initTauriNotifications } from '@/lib/tauri-notifications';

/**
 * Initializes Tauri native notifications on app startup.
 * Requests permission and registers the scheduler listener.
 * Only runs when the app is inside a Tauri WebView — no-ops in browsers.
 */
export function TauriNotificationInit() {
  useEffect(() => {
    if (!isTauri()) return;

    let cleanup: (() => void) | null = null;

    async function init() {
      try {
        // Request notification permission via Tauri plugin
        const { isPermissionGranted, requestPermission } = await import(
          '@tauri-apps/plugin-notification'
        );

        let granted = await isPermissionGranted();

        if (!granted) {
          const result = await requestPermission();
          granted = result === 'granted';
        }

        if (!granted) {
          console.warn('[TauriNotificationInit] Notification permission denied');
          return;
        }

        // Register the scheduler listener
        cleanup = await initTauriNotifications();
        console.log('[TauriNotificationInit] Notification system initialized');
      } catch (error) {
        console.error('[TauriNotificationInit] Failed to initialize:', error);
      }
    }

    init();

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}
