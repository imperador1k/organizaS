'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        OneSignalDeferred?: Array<(OneSignal: any) => void>;
        OneSignal?: any;
    }
}

/**
 * OneSignal Web Push Initialization Component
 * Add this component to your layout to enable web push notifications
 */
export function OneSignalInit() {
    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return;

        // Check if already initialized
        if (window.OneSignal) return;

        // Initialize OneSignal
        window.OneSignalDeferred = window.OneSignalDeferred || [];

        // Load OneSignal SDK
        const script = document.createElement('script');
        script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
        script.defer = true;
        script.onload = () => {
            window.OneSignalDeferred!.push((OneSignal: any) => {
                OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '785ea77e-4c8c-483b-9e31-78d8530964dc',
                    // Safari web ID
                    safari_web_id: 'web.onesignal.auto.52db6e33-5c43-4c7e-8893-c04dfe7146e4',
                    // Prompts
                    notifyButton: {
                        enable: false, // Hide the default bell icon
                    },
                    // Welcome notification
                    welcomeNotification: {
                        title: 'OrganizaS',
                        message: 'Obrigado por ativar as notificações! 🎉',
                    },
                    // Prompt options
                    promptOptions: {
                        slidedown: {
                            prompts: [
                                {
                                    type: 'push',
                                    autoPrompt: true,
                                    text: {
                                        actionMessage: 'Quer receber lembretes das suas tarefas?',
                                        acceptButton: 'Sim, quero!',
                                        cancelButton: 'Agora não',
                                    },
                                    delay: {
                                        pageViews: 1,
                                        timeDelay: 5, // Show after 5 seconds
                                    },
                                },
                            ],
                        },
                    },
                });
            });
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    return null; // This component doesn't render anything
}

/**
 * Hook to request notification permission manually
 */
export function useRequestNotificationPermission() {
    const requestPermission = async () => {
        if (typeof window === 'undefined' || !window.OneSignal) {
            console.warn('OneSignal not initialized');
            return false;
        }

        try {
            await window.OneSignal.Slidedown.promptPush();
            return true;
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return false;
        }
    };

    return { requestPermission };
}
