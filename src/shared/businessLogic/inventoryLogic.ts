import { roundMoney } from './billingCore';

export interface ProductStockState {
  id: string;
  name: string;
  currentStock: number;
  minStockLevel: number;
  version?: number; // Optimistic concurrency version
  lastUpdated?: string;
}

export interface StockDeductionItem {
  productId: string;
  quantity: number;
}

export interface StockDeductionResult {
  updatedProducts: Array<{
    id: string;
    stockBefore: number;
    stockAfter: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    movement: {
      productId: string;
      quantityChange: number;
      type: 'sold';
      reason: string;
    };
  }>;
  lowStockAlerts: string[];
}

/**
 * Compute atomic stock deductions for invoice items.
 */
export function computeStockDeductions(
  products: ProductStockState[],
  items: StockDeductionItem[],
  invoiceNo: string
): StockDeductionResult {
  const productMap = new Map<string, ProductStockState>();
  products.forEach((p) => productMap.set(p.id, p));

  const updatedProducts: StockDeductionResult['updatedProducts'] = [];
  const lowStockAlerts: string[] = [];

  for (const item of items) {
    const prod = productMap.get(item.productId);
    if (!prod) continue;

    const stockBefore = prod.currentStock;
    const stockAfter = Math.max(0, roundMoney(stockBefore - item.quantity));
    const status: 'in_stock' | 'low_stock' | 'out_of_stock' =
      stockAfter === 0 ? 'out_of_stock' : stockAfter <= prod.minStockLevel ? 'low_stock' : 'in_stock';

    if (stockAfter <= prod.minStockLevel) {
      lowStockAlerts.push(`Product "${prod.name}" reached low stock: ${stockAfter} remaining.`);
    }

    updatedProducts.push({
      id: prod.id,
      stockBefore,
      stockAfter,
      status,
      movement: {
        productId: prod.id,
        quantityChange: -item.quantity,
        type: 'sold',
        reason: `Sold via Invoice #${invoiceNo}`,
      },
    });
  }

  return { updatedProducts, lowStockAlerts };
}

/**
 * Detect concurrent stock conflict between local offline sale and server inventory.
 */
export function detectStockConflict(
  localProduct: { id: string; stockAtSale: number; quantitySold: number },
  serverProduct: { id: string; currentStock: number; version: number },
  serverVersionAtLocalFetch: number
): {
  hasConflict: boolean;
  canAutoReconcile: boolean;
  recommendedStock: number;
  message: string;
} {
  // If server version matches local fetch time version, there is no conflict
  if (serverProduct.version === serverVersionAtLocalFetch) {
    return {
      hasConflict: false,
      canAutoReconcile: true,
      recommendedStock: Math.max(0, serverProduct.currentStock - localProduct.quantitySold),
      message: 'Clean sync without conflicts.',
    };
  }

  // Version mismatch: another transaction occurred on server
  const potentialNewStock = serverProduct.currentStock - localProduct.quantitySold;

  if (potentialNewStock >= 0) {
    // Inventory is still available to fulfill this offline sale
    return {
      hasConflict: true,
      canAutoReconcile: true,
      recommendedStock: potentialNewStock,
      message: `Concurrent update on server (v${serverProduct.version}), but sufficient stock exists. Auto-reconciled.`,
    };
  } else {
    // Insufficient stock left on server due to concurrent sales!
    return {
      hasConflict: true,
      canAutoReconcile: false,
      recommendedStock: potentialNewStock,
      message: `Oversell Conflict: Product has only ${serverProduct.currentStock} units on server, but offline invoice sold ${localProduct.quantitySold} units.`,
    };
  }
}
