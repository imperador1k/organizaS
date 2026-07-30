import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.organizas.app',
  appName: 'OrganizaS',
  webDir: 'out',
  server: {
    url: 'https://organiza-s.vercel.app/',
    androidScheme: 'https',
  },
};

export default config;
