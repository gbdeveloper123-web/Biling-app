interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: Record<string, unknown>;
  android?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'com.vyaprix.pos',
  appName: 'VYAPRIX',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    backgroundColor: '#1E272E',
  },
};

export default config;
