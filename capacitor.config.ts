import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.organizas.app',
  appName: 'OrganizaS',
  webDir: 'out',
  server: {
    // Uses https scheme on Android to ensure compatibility with Firebase and CORS
    androidScheme: 'https',
  },
};

export default config;
