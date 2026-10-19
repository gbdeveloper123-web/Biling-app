/**
 * VYAPRIX Offline Sync Manager
 * Handles durable queueing, idempotent server submission, conflict resolution, and retry loops.
 */

import { SyncQueueItem, SyncOperationType, SyncState } from '../shared/businessLogic/syncQueueTypes';
import { generateOperationId } from '../shared/businessLogic/offlineIdGenerator';
import { offlineStorageAdapter } from './offlineStorageAdapter';
import { FirebaseSyncService } from './firebaseSyncService';
import { getDeviceIdentifier } from './platformService';
import { Invoice } from '../types';

export type SyncStatusListener = (status: {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}) => void;

class OfflineSyncManager {
  private queue: SyncQueueItem[] = [];
  private isSyncing = false;
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private lastSyncedAt: string | null = null;
  private lastError: string | null = null;
  private listeners: Set<SyncStatusListener> = new Set();
  private autoSyncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
        this.processQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
      this.init();
    }
  }

  private async init() {
    await offlineStorageAdapter.initialize();
    this.queue = await offlineStorageAdapter.getSyncQueue();
    this.notifyListeners();
    if (this.isOnline && this.queue.length > 0) {
      this.processQueue();
    }
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener({
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.getPendingCount(),
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
    });
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const status = {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.getPendingCount(),
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
    };
    this.listeners.forEach((l) => l(status));
  }

  public getPendingCount(): number {
    return this.queue.filter((q) => q.state === 'pending' || q.state === 'failed').length;
  }

  /**
   * Enqueue an offline invoice generation operation
   */
  public async enqueueInvoice(businessId: string, invoice: Invoice): Promise<SyncQueueItem> {
    const deviceId = getDeviceIdentifier();
    const operationId = generateOperationId('create_invoice');

    const queueItem: SyncQueueItem<Invoice> = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      operationId,
      operationType: 'create_invoice',
      businessId,
      deviceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      payload: invoice,
      state: 'pending',
      retryCount: 0,
      maxRetries: 5,
    };

    // Save locally
    await offlineStorageAdapter.saveInvoice(invoice);

    this.queue.push(queueItem);
    await offlineStorageAdapter.saveSyncQueue(this.queue);
    this.notifyListeners();

    // Trigger sync immediately if online
    if (this.isOnline) {
      this.processQueue();
    }

    return queueItem;
  }

  /**
   * Process all pending queue items
   */
  public async processQueue(): Promise<{ processed: number; failed: number }> {
    if (this.isSyncing || !this.isOnline) {
      return { processed: 0, failed: 0 };
    }

    const pendingItems = this.queue.filter((q) => q.state === 'pending' || q.state === 'failed');
    if (pendingItems.length === 0) {
      return { processed: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.lastError = null;
    this.notifyListeners();

    let processed = 0;
    let failed = 0;

    for (const item of pendingItems) {
      item.state = 'syncing';
      item.updatedAt = new Date().toISOString();

      try {
        if (item.operationType === 'create_invoice') {
          const res = await FirebaseSyncService.syncInvoice(item.businessId, item.payload);
          if (res.success) {
            item.state = 'synced';
            processed++;
          } else {
            throw new Error(res.error || 'Failed to sync with cloud');
          }
        }
      } catch (err: any) {
        failed++;
        item.retryCount += 1;
        item.lastError = err.message || 'Unknown network error';
        item.state = item.retryCount >= item.maxRetries ? 'conflict' : 'failed';
        this.lastError = item.lastError || null;
      }
    }

    // Keep synced items for audit or purge old ones (older than 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    this.queue = this.queue.filter((q) => {
      if (q.state === 'synced') {
        return new Date(q.updatedAt).getTime() > sevenDaysAgo;
      }
      return true;
    });

    await offlineStorageAdapter.saveSyncQueue(this.queue);

    this.isSyncing = false;
    this.lastSyncedAt = new Date().toISOString();
    this.notifyListeners();

    return { processed, failed };
  }
}

export const offlineSyncManager = new OfflineSyncManager();
