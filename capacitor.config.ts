import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.equilibrium.app',
  appName: 'Equilibrium',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
};

export default config;
