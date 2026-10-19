import { Product, Customer, Supplier, Invoice, Expense } from '../types';
import { formatCurrency } from '../utils/formatters';

export interface BusinessContextSummary {
  businessName: string;
  totalSalesToday: number;
  totalSalesThisMonth: number;
  ordersCountToday: number;
  lowStockCount: number;
  lowStockProducts: { name: string; stock: number; min: number; sku: string }[];
  customerDuesTotal: number;
  customersWithDues: { name: string; phone: string; dues: number }[];
  supplierDuesTotal: number;
  suppliersWithDues: { name: string; dues: number }[];
  expensesThisMonth: number;
  estimatedProfitThisMonth: number;
  topSellingProducts: { name: string; unitsSold: number; revenue: number }[];
}

export async function askAiAssistant(
  prompt: string,
  context: BusinessContextSummary
): Promise<string> {
  try {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, businessContext: context }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.answer) {
        return data.answer;
      }
    }
  } catch (err) {
    console.warn('API assistant error, using local business analytics engine fallback', err);
  }

  // Local intelligent business data analyzer fallback
  return analyzeLocally(prompt, context);
}

export async function getProductAiSuggestions(productName: string, category?: string) {
  try {
    const res = await fetch('/api/ai/suggest-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, category }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.suggestion && data.suggestion.suggestedHsn) {
        return data.suggestion;
      }
    }
  } catch (err) {
    console.warn('AI suggest product API call error, using local heuristic', err);
  }

  // Local catalog heuristics
  const lower = productName.toLowerCase();
  if (lower.includes('shirt') || lower.includes('t-shirt') || lower.includes('top') || lower.includes('cloth')) {
    return {
      category: 'Clothing',
      subcategory: 'Apparel',
      shortDescription: `Premium comfortable 100% cotton ${productName} designed for daily wear.`,
      searchKeywords: ['clothing', 'cotton', 'fashion', 'apparel'],
      suggestedHsn: '6109',
      typicalGstRate: 5,
      suggestedUnit: 'PCS',
    };
  }
  if (lower.includes('cable') || lower.includes('charger') || lower.includes('earbud') || lower.includes('adapter')) {
    return {
      category: 'Electronics',
      subcategory: 'Accessories',
      shortDescription: `High performance ${productName} featuring fast transfer, surge safety, and durable build.`,
      searchKeywords: ['electronics', 'gadgets', 'fast charging', 'accessories'],
      suggestedHsn: '8504',
      typicalGstRate: 18,
      suggestedUnit: 'PCS',
    };
  }
  if (lower.includes('rice') || lower.includes('tea') || lower.includes('oil') || lower.includes('grain')) {
    return {
      category: 'Grocery',
      subcategory: 'Staples',
      shortDescription: `Fresh, high-quality packed ${productName} sourced directly from verified farmers.`,
      searchKeywords: ['grocery', 'staples', 'kitchen', 'daily food'],
      suggestedHsn: '1006',
      typicalGstRate: 5,
      suggestedUnit: 'BAG',
    };
  }

  return {
    category: category || 'General Store',
    subcategory: 'Standard',
    shortDescription: `High quality ${productName} with standard manufacturer warranty.`,
    searchKeywords: [productName.toLowerCase(), 'retail', 'best seller'],
    suggestedHsn: '9983',
    typicalGstRate: 18,
    suggestedUnit: 'PCS',
  };
}

function analyzeLocally(prompt: string, ctx: BusinessContextSummary): string {
  const p = prompt.toLowerCase();

  if (p.includes('sell') || p.includes('sales today') || p.includes('today sales')) {
    return `Today's total sales stand at **${formatCurrency(ctx.totalSalesToday)}** across **${
      ctx.ordersCountToday
    } orders**. Total sales for this month are **${formatCurrency(ctx.totalSalesThisMonth)}**.`;
  }

  if (p.includes('low') || p.includes('stock') || p.includes('inventory') || p.includes('reorder')) {
    if (ctx.lowStockCount === 0) {
      return `Good news! None of your products are currently below their minimum threshold. Your inventory is healthy.`;
    }
    const items = ctx.lowStockProducts
      .slice(0, 5)
      .map((item) => `• **${item.name}** (Current Stock: ${item.stock}, Min Required: ${item.min})`)
      .join('\n');
    return `You have **${ctx.lowStockCount} items** running low on stock:\n\n${items}\n\n💡 **Reorder Suggestion:** Consider raising a purchase order to avoid lost retail sales.`;
  }

  if (p.includes('owe') || p.includes('khata') || p.includes('udhaar') || p.includes('dues') || p.includes('pending')) {
    if (ctx.customerDuesTotal === 0) {
      return `All customers have cleared their bills! There are currently no pending customer dues.`;
    }
    const debtors = ctx.customersWithDues
      .slice(0, 5)
      .map((c) => `• **${c.name}** owes **${formatCurrency(c.dues)}** (${c.phone || 'No phone'})`)
      .join('\n');
    return `Total customer dues (Udhaar) amount to **${formatCurrency(ctx.customerDuesTotal)}**.\n\nTop pending accounts:\n${debtors}\n\n📲 *Tip: You can send instant polite WhatsApp reminders with 1-click in the Khata section.*`;
  }

  if (p.includes('spend') || p.includes('expense')) {
    return `Your recorded expenses this month total **${formatCurrency(
      ctx.expensesThisMonth
    )}**. Keep an eye on rent and utilities to optimize net margins.`;
  }

  if (p.includes('profit')) {
    return `Your estimated gross profit for this month is **${formatCurrency(
      ctx.estimatedProfitThisMonth
    )}** (calculated based on selling price minus purchase cost and recorded expenses).`;
  }

  if (p.includes('top product') || p.includes('sold the most') || p.includes('best seller')) {
    if (ctx.topSellingProducts.length === 0) {
      return `You have not recorded enough sales yet to determine top-selling products.`;
    }
    const top = ctx.topSellingProducts
      .slice(0, 4)
      .map((t, idx) => `${idx + 1}. **${t.name}** — ${t.unitsSold} units (${formatCurrency(t.revenue)})`)
      .join('\n');
    return `Your best-performing products by sales volume are:\n\n${top}`;
  }

  if (p.includes('supplier')) {
    return `You currently have **${formatCurrency(
      ctx.supplierDuesTotal
    )}** in pending supplier dues. Check the Suppliers module to review purchase bills.`;
  }

  return `Here is a summary for **${ctx.businessName}**:\n• Today's Sales: **${formatCurrency(
    ctx.totalSalesToday
  )}** (${ctx.ordersCountToday} bills)\n• Monthly Sales: **${formatCurrency(
    ctx.totalSalesThisMonth
  )}**\n• Customer Dues (Khata): **${formatCurrency(
    ctx.customerDuesTotal
  )}**\n• Low Stock Alert: **${ctx.lowStockCount} items**\n• Estimated Monthly Profit: **${formatCurrency(
    ctx.estimatedProfitThisMonth
  )}**.\n\nFeel free to ask specific questions about sales, inventory, or customers!`;
}
