export type SyncOperationType =
  | 'create_invoice'
  | 'cancel_invoice'
  | 'stock_adjustment'
  | 'create_customer'
  | 'update_customer'
  | 'record_khata_payment'
  | 'sales_return';

export type SyncState = 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';

export interface SyncQueueItem<T = any> {
  id: string; // Internal queue ID (uuid)
  operationId: string; // Idempotent unique operation token (e.g. op_create_invoice_...)
  operationType: SyncOperationType;
  businessId: string;
  deviceId: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
  payload: T;
  state: SyncState;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  conflictDetails?: {
    conflictingEntityId: string;
    reason: string;
    serverVersion?: any;
    localVersion?: any;
  };
}

export interface SyncBatchRequest {
  deviceId: string;
  businessId: string;
  clientTimestamp: string;
  operations: Array<{
    operationId: string;
    operationType: SyncOperationType;
    payload: any;
    createdAt: string;
  }>;
}

export interface SyncOperationResult {
  operationId: string;
  status: 'applied' | 'already_applied' | 'conflict' | 'rejected';
  entityId?: string;
  serverTimestamp: string;
  error?: string;
}

export interface SyncBatchResponse {
  success: boolean;
  serverTimestamp: string;
  results: SyncOperationResult[];
  unresolvedConflictsCount: number;
}
