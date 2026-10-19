/**
 * VYAPRIX Firebase Cloud Synchronization Service
 * Handles multi-tenant cloud sync to Firestore with zero secret leakage and error boundaries.
 */

import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Invoice, Product, Customer } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export class FirebaseSyncService {
  /**
   * Upload an invoice to cloud Firestore under the tenant path /merchants/{businessId}/invoices/{invoiceId}
   */
  public static async syncInvoice(businessId: string, invoice: Invoice): Promise<{ success: boolean; error?: string }> {
    const path = `merchants/${businessId}/invoices/${invoice.id}`;
    try {
      const invRef = doc(db, 'merchants', businessId, 'invoices', invoice.id);
      await setDoc(invRef, {
        ...invoice,
        syncedAt: new Date().toISOString(),
        cloudSyncStatus: 'synced',
      }, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.warn(`Firestore invoice sync failed for ${invoice.id}:`, err);
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch (e) {
        // logged via handleFirestoreError
      }
      return { success: false, error: err.message || 'Firestore write error' };
    }
  }

  /**
   * Sync product inventory updates to cloud
   */
  public static async syncProduct(businessId: string, product: Product): Promise<{ success: boolean; error?: string }> {
    const path = `merchants/${businessId}/products/${product.id}`;
    try {
      const prodRef = doc(db, 'merchants', businessId, 'products', product.id);
      await setDoc(prodRef, {
        ...product,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return { success: true };
    } catch (err: any) {
      console.warn(`Firestore product sync failed for ${product.id}:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Sync customer records to cloud
   */
  public static async syncCustomer(businessId: string, customer: Customer): Promise<{ success: boolean; error?: string }> {
    const path = `merchants/${businessId}/customers/${customer.id}`;
    try {
      const custRef = doc(db, 'merchants', businessId, 'customers', customer.id);
      await setDoc(custRef, customer, { merge: true });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch cloud invoices for tenant (used during first login or multi-device sync)
   */
  public static async fetchCloudInvoices(businessId: string): Promise<Invoice[]> {
    try {
      const colRef = collection(db, 'merchants', businessId, 'invoices');
      const snap = await getDocs(colRef);
      return snap.docs.map((d) => d.data() as Invoice);
    } catch (err) {
      console.warn('Could not fetch cloud invoices (offline or permissions restricted):', err);
      return [];
    }
  }
}
