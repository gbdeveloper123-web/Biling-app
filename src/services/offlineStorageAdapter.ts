/**
 * VYAPRIX Offline Storage Adapter
 * Multi-Platform local persistence for Web (IndexedDB), Android (IndexedDB/WebSQL), and Windows (Electron IPC/SQLite).
 */

import { Invoice, Product, Customer } from '../types';
import { SyncQueueItem } from '../shared/businessLogic/syncQueueTypes';
import { detectPlatform } from './platformService';

const DB_NAME = 'vyaprix_offline_db';
const DB_VERSION = 1;

interface OfflineDatabase {
  invoices: Invoice[];
  products: Product[];
  customers: Customer[];
  syncQueue: SyncQueueItem[];
}

class OfflineStorageAdapter {
  private idb: IDBDatabase | null = null;
  private isInitialized = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const platform = detectPlatform();
    if (platform === 'windows' && window.electronAPI) {
      this.isInitialized = true;
      return;
    }

    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      await new Promise<void>((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('invoices')) {
            db.createObjectStore('invoices', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('products')) {
            db.createObjectStore('products', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('customers')) {
            db.createObjectStore('customers', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id' });
          }
        };
        req.onsuccess = () => {
          this.idb = req.result;
          this.isInitialized = true;
          resolve();
        };
        req.onerror = () => {
          console.warn('IndexedDB failed to open, falling back to localStorage');
          this.isInitialized = true;
          resolve();
        };
      });
    } else {
      this.isInitialized = true;
    }
  }

  // Invoices
  public async saveInvoice(invoice: Invoice): Promise<void> {
    await this.initialize();
    const platform = detectPlatform();

    if (platform === 'windows' && window.electronAPI) {
      await window.electronAPI.sqliteExecute('save_invoice', invoice);
      return;
    }

    if (this.idb) {
      return new Promise((resolve, reject) => {
        const tx = this.idb!.transaction(['invoices'], 'readwrite');
        const store = tx.objectStore('invoices');
        store.put(invoice);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    // Fallback: LocalStorage
    const key = `vyaprix_offline_invoices`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter((i: Invoice) => i.id !== invoice.id);
    localStorage.setItem(key, JSON.stringify([invoice, ...filtered]));
  }

  public async getInvoices(): Promise<Invoice[]> {
    await this.initialize();
    const platform = detectPlatform();

    if (platform === 'windows' && window.electronAPI) {
      return (await window.electronAPI.sqliteQuery('invoices')) || [];
    }

    if (this.idb) {
      return new Promise((resolve) => {
        const tx = this.idb!.transaction(['invoices'], 'readonly');
        const store = tx.objectStore('invoices');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    }

    const key = `vyaprix_offline_invoices`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  // Sync Queue
  public async getSyncQueue(): Promise<SyncQueueItem[]> {
    await this.initialize();
    const platform = detectPlatform();

    if (platform === 'windows' && window.electronAPI) {
      return (await window.electronAPI.sqliteQuery('syncQueue')) || [];
    }

    if (this.idb) {
      return new Promise((resolve) => {
        const tx = this.idb!.transaction(['syncQueue'], 'readonly');
        const store = tx.objectStore('syncQueue');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    }

    const key = `vyaprix_sync_queue`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }

  public async saveSyncQueue(items: SyncQueueItem[]): Promise<void> {
    await this.initialize();
    const platform = detectPlatform();

    if (platform === 'windows' && window.electronAPI) {
      await window.electronAPI.sqliteExecute('save_sync_queue', items);
      return;
    }

    if (this.idb) {
      return new Promise((resolve, reject) => {
        const tx = this.idb!.transaction(['syncQueue'], 'readwrite');
        const store = tx.objectStore('syncQueue');
        store.clear();
        for (const item of items) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    localStorage.setItem(`vyaprix_sync_queue`, JSON.stringify(items));
  }
}

export const offlineStorageAdapter = new OfflineStorageAdapter();
