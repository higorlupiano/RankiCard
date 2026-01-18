import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rankicard.app',
  appName: 'RankiCard',
  webDir: 'dist',
  server: {
    // Use the Vercel URL for OAuth redirects
    url: 'https://rankicard.vercel.app',
    cleartext: true
  },
  android: {
    // Handle deep links for OAuth callback
    allowMixedContent: true
  }
};

export default config;
