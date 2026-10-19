/**
 * Platform Detection & Device Services
 * Identifies whether VYAPRIX is executing on Web, Windows Desktop (Electron), or Android (Capacitor).
 */

export type PlatformType = 'web' | 'windows' | 'android' | 'ios';

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
    };
    electronAPI?: {
      isElectron: boolean;
      platform: string;
      printReceipt: (htmlContent: string) => Promise<{ success: boolean }>;
      sqliteQuery: (collectionName: string) => Promise<any[]>;
      sqliteExecute: (action: string, payload: any) => Promise<{ success: boolean; error?: string }>;
      getDeviceHardwareId: () => Promise<string>;
      onNetworkChange: (callback: (isOnline: boolean) => void) => void;
    };
  }
}

export function detectPlatform(): PlatformType {
  if (typeof window !== 'undefined' && window.electronAPI?.isElectron) {
    return 'windows';
  }
  if (typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.()) {
    const platform = window.Capacitor.getPlatform?.();
    if (platform === 'android') return 'android';
    if (platform === 'ios') return 'ios';
  }
  return 'web';
}

export function getDeviceIdentifier(): string {
  const platform = detectPlatform();
  const storedId = localStorage.getItem('vyaprix_device_id');
  if (storedId) return storedId;

  const generated = `${platform.toUpperCase()}_DEV_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
  localStorage.setItem('vyaprix_device_id', generated);
  return generated;
}

export const currentPlatform = detectPlatform();
