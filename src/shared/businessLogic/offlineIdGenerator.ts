/**
 * Multi-Platform Offline ID Generator & Idempotent Operation Tracker
 * Provides deterministic and safe collision-resistant IDs for multi-device offline operations.
 */

/**
 * Returns or assigns a stable client device identifier.
 * Stored locally in localStorage (Web) or secure platform store (Tauri/Capacitor).
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'node_srv';
  try {
    let deviceId = localStorage.getItem('vyaprix_device_id');
    if (!deviceId) {
      const randPart = Math.random().toString(36).substring(2, 9);
      const timePart = Date.now().toString(36);
      deviceId = `DEV_${timePart}_${randPart}`.toUpperCase();
      localStorage.setItem('vyaprix_device_id', deviceId);
    }
    return deviceId;
  } catch {
    return 'DEV_ANON_LOCAL';
  }
}

/**
 * Generate a cryptographically random, collision-resistant UUID v4 or random hex.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate an idempotent operation ID for a server write action.
 * Any retry with the same operation ID will return the previously cached outcome.
 */
export function generateOperationId(actionType: string): string {
  const timestamp = Date.now();
  const uuid = generateUUID().replace(/-/g, '').slice(0, 12);
  return `op_${actionType}_${timestamp}_${uuid}`;
}

/**
 * Generate a safe offline invoice number.
 * Format: [PREFIX]-[DEVICE_CODE]-[YYYYMMDD]-[SEQUENCE]
 * Example: VYA-D01-20261016-0042
 */
export function generateOfflineInvoiceNumber(
  prefix: string = 'VYA',
  sequenceNumber: number,
  customDeviceId?: string
): string {
  const rawId = customDeviceId || getOrCreateDeviceId();
  const cleanId = rawId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const devId = cleanId.length > 4 ? cleanId.slice(-4) : cleanId.padStart(3, '0') || 'D01';
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const seqStr = String(sequenceNumber).padStart(4, '0');

  return `${prefix}-${devId}-${dateStr}-${seqStr}`;
}

/**
 * Generate a unique internal primary key for offline invoices.
 */
export function generateOfflineInvoiceId(businessId: string): string {
  const deviceId = getOrCreateDeviceId().slice(0, 8);
  const timestamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `inv_${businessId}_${deviceId}_${timestamp}_${rand}`;
}
