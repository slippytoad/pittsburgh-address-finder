import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.72f422bad056495bbe0edffed3e7e0a4',
  appName: 'jfw-oakland-property-violations-tracker',
  webDir: 'dist',
  server: {
    url: 'https://72f422ba-d056-495b-be0e-dffed3e7e0a4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    App: {
      launchUrl: 'jfw-violations://dashboard'
    }
  }
};

export default config;