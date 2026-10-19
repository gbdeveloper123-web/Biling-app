import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Sparkles,
  Barcode,
  Edit2,
  Trash2,
  History,
  TrendingDown,
  ArrowUpDown,
  Tag,
  X,
  Check,
  Package,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, ProductStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getProductAiSuggestions } from '../services/aiService';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { celebrateTaskCompletion } from '../utils/motion';

export const InventoryView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    stockMovements,
    suppliers,
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // AI Assistant loading
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formUnit, setFormUnit] = useState('PCS');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number | ''>(100);
  const [formSellingPrice, setFormSellingPrice] = useState<number | ''>(199);
  const [formMrp, setFormMrp] = useState<number | ''>(249);
  const [formStock, setFormStock] = useState<number | ''>(10);
  const [formMinStock, setFormMinStock] = useState<number | ''>(5);
  const [formGstRate, setFormGstRate] = useState<number>(18);
  const [formHsnCode, setFormHsnCode] = useState('9983');
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  // Stock Adjustment Form State
  const [adjChange, setAdjChange] = useState<number | ''>('');
  const [adjType, setAdjType] = useState<any>('adjustment');
  const [adjReason, setAdjReason] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.hsnCode.includes(q);

      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  // Aggregate Metrics
  const totalStockUnits = products.reduce((s, p) => s + p.stock, 0);
  const totalStockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockLevel).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  // AI Product Assistant Trigger
  const handleAiSuggest = async () => {
    if (!formName.trim()) {
      alert('Please enter a product name first so AI can suggest details.');
      return;
    }
    setIsAiLoading(true);
    setAiNotice(null);

    const suggestion = await getProductAiSuggestions(formName, formCategory);
    if (suggestion) {
      if (suggestion.category) setFormCategory(suggestion.category);
      if (suggestion.subcategory) setFormSubcategory(suggestion.subcategory);
      if (suggestion.shortDescription) setFormDescription(suggestion.shortDescription);
      if (suggestion.suggestedHsn) setFormHsnCode(suggestion.suggestedHsn);
      if (suggestion.typicalGstRate !== undefined) setFormGstRate(suggestion.typicalGstRate);
      if (suggestion.suggestedUnit) setFormUnit(suggestion.suggestedUnit);

      setAiNotice(
        `Suggested HSN: ${suggestion.suggestedHsn} (Note: HSN code is an AI recommendation. Verify with your CA before official filing).`
      );
    }
    setIsAiLoading(false);
  };

  // Open Edit Product
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSku(p.sku);
    setFormBarcode(p.barcode);
    setFormCategory(p.category);
    setFormSubcategory(p.subcategory || '');
    setFormBrand(p.brand || '');
    setFormUnit(p.unit);
    setFormPurchasePrice(p.purchasePrice);
    setFormSellingPrice(p.sellingPrice);
    setFormMrp(p.mrp);
    setFormStock(p.stock);
    setFormMinStock(p.minStockLevel);
    setFormGstRate(p.gstRate);
    setFormHsnCode(p.hsnCode);
    setFormSupplierId(p.supplierId || '');
    setFormDescription(p.description || '');
    setFormImageUrl(p.images[0] || '');
    setIsAddModalOpen(true);
  };

  const handleResetForm = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormBarcode('');
    setFormCategory('General');
    setFormSubcategory('');
    setFormBrand('');
    setFormUnit('PCS');
    setFormPurchasePrice(100);
    setFormSellingPrice(199);
    setFormMrp(249);
    setFormStock(10);
    setFormMinStock(5);
    setFormGstRate(18);
    setFormHsnCode('9983');
    setFormSupplierId('');
    setFormDescription('');
    setFormImageUrl('');
    setAiNotice(null);
    setIsAddModalOpen(false);
  };

  // Save Product (Create / Update)
  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const skuGen = formSku || `SKU-${Date.now().toString().slice(-6)}`;
    const barcodeGen = formBarcode || `890${Date.now().toString().slice(-9)}`;
    const stockVal = Number(formStock) || 0;
    const minVal = Number(formMinStock) || 5;
    const statusVal: ProductStatus =
      stockVal === 0 ? 'out_of_stock' : stockVal <= minVal ? 'low_stock' : 'in_stock';

    const supObj = suppliers.find((s) => s.id === formSupplierId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName,
        sku: skuGen,
        barcode: barcodeGen,
        category: formCategory,
        subcategory: formSubcategory,
        brand: formBrand,
        unit: formUnit,
        purchasePrice: Number(formPurchasePrice) || 0,
        sellingPrice: Number(formSellingPrice) || 0,
        mrp: Number(formMrp) || 0,
        stock: stockVal,
        minStockLevel: minVal,
        gstRate: formGstRate,
        hsnCode: formHsnCode,
        supplierId: formSupplierId,
        supplierName: supObj?.businessName,
        description: formDescription,
        images: formImageUrl ? [formImageUrl] : editingProduct.images,
        status: statusVal,
      });
    } else {
      addProduct({
        name: formName,
        sku: skuGen,
        barcode: barcodeGen,
        category: formCategory,
        subcategory: formSubcategory,
        brand: formBrand,
        unit: formUnit,
        purchasePrice: Number(formPurchasePrice) || 0,
        sellingPrice: Number(formSellingPrice) || 0,
        mrp: Number(formMrp) || 0,
        stock: stockVal,
        openingStock: stockVal,
        minStockLevel: minVal,
        gstRate: formGstRate,
        hsnCode: formHsnCode,
        supplierId: formSupplierId,
        supplierName: supObj?.businessName,
        description: formDescription,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'],
        status: statusVal,
      });
    }

    celebrateTaskCompletion(editingProduct ? 'Product updated successfully!' : 'New product added!');
    handleResetForm();
  };

  // Submit Stock Adjustment
  const handleStockAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockProduct || !adjChange) return;
    const delta = Number(adjChange);
    const multiplier = adjType === 'damaged' || adjType === 'expired' ? -1 : 1;
    adjustStock(selectedStockProduct.id, delta * multiplier, adjType, adjReason || 'Inventory adjustment');
    celebrateTaskCompletion('Stock adjustment recorded!');
    setSelectedStockProduct(null);
    setAdjChange('');
    setAdjReason('');
  };

  return (
    <div className="vy-view-container space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 sm:w-6 h-5 sm:h-6 text-[#0984E3]" />
            Inventory & Catalog Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time stock tracking, HSN codes, barcode labels, and low-stock alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryDrawerOpen(true)}
            className="flex items-center gap-1.5 h-10 px-3.5 text-xs font-semibold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 hover:bg-slate-50 rounded-xl border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            <History className="w-4 h-4" /> Stock History
          </button>

          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="flex items-center gap-1.5 h-10 px-3.5 text-xs font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
          >
            <Barcode className="w-4 h-4" /> Barcodes
          </button>

          <button
            onClick={() => {
              handleResetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 h-10 px-4 text-xs sm:text-sm font-semibold text-white bg-[#0984E3] hover:bg-[#0770C2] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Products
          </span>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {products.length} Items
          </p>
          <p className="text-[11px] text-slate-400">{totalStockUnits} units in warehouse</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-[#0984E3] uppercase tracking-wider">
            Total Stock Value
          </span>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(totalStockValue)}
          </p>
          <p className="text-[11px] text-slate-400">At purchase cost</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Low Stock Alert
          </span>
          <p className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            {lowStockCount} Products
          </p>
          <p className="text-[11px] text-slate-400">Requires reordering</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
            Out of Stock
          </span>
          <p className="text-lg sm:text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
            {outOfStockCount} Products
          </p>
          <p className="text-[11px] text-slate-400">Zero inventory</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search product name, SKU, barcode, HSN code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock (Needs PO)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No Products Match Criteria
            </p>
            <p className="text-xs mt-1">Try another search or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 sm:mx-0">
            <table className="w-full text-xs text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">HSN / GST</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Sale Price</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://via.placeholder.com/60'}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {p.name}
                          </p>
                          {p.brand && <p className="text-[10px] text-slate-400">Brand: {p.brand}</p>}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{p.sku}</p>
                      <p className="text-slate-400 text-[10px]">{p.barcode}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-semibold">{p.hsnCode}</span>
                      <span className="text-[10px] text-slate-400 block">{p.gstRate}% GST</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                      {formatCurrency(p.purchasePrice)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <p className="font-black text-slate-900 dark:text-white">
                        {formatCurrency(p.sellingPrice)}
                      </p>
                      {p.mrp > p.sellingPrice && (
                        <p className="text-[10px] text-slate-400 line-through">
                          MRP: {formatCurrency(p.mrp)}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {p.stock}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{p.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          p.status === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : p.status === 'low_stock'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStockProduct(p)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg transition"
                          title="Stock Adjustment"
                        >
                          ± Stock
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete product ${p.name}?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal with AI Assistant */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-modal-pop">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in product details or let AI generate HSN code & category automatically.
                </p>
              </div>
              <button onClick={handleResetForm} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="p-6 overflow-y-auto space-y-4">
              {/* Product Name with AI Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Product Name *
                  </label>
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={isAiLoading}
                    className="flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/60 hover:bg-purple-200 px-2 py-0.5 rounded-lg transition"
                  >
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    {isAiLoading ? 'Analyzing...' : 'AI Auto-Suggest HSN & Category'}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fast Charging 65W GaN Type-C Adapter"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {aiNotice && (
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <p>{aiNotice}</p>
                </div>
              )}

              {/* SKU & Barcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SKU (Code)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PWR-65W-GAN"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Barcode (EAN/UPC)
                  </label>
                  <input
                    type="text"
                    placeholder="890123456002"
                    value={formBarcode}
                    onChange={(e) => setFormBarcode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Category, Brand, Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electronics"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VoltMax"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="KG">KG (Kilograms)</option>
                    <option value="BOX">BOX (Cartons)</option>
                    <option value="MTR">MTR (Meters)</option>
                    <option value="LTR">LTR (Liters)</option>
                    <option value="BAG">BAG (Bags/Sacks)</option>
                    <option value="SET">SET (Sets)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Stock Levels */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Stock *
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Min Stock Threshold (Alert)
                  </label>
                  <input
                    type="number"
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* GST & HSN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GST Rate %
                  </label>
                  <select
                    value={formGstRate}
                    onChange={(e) => setFormGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="3">3% (Gold/Jewellery)</option>
                    <option value="5">5% (Apparel/Food)</option>
                    <option value="12">12% (Processed items)</option>
                    <option value="18">18% (Standard/Electronics)</option>
                    <option value="28">28% (Luxury/Auto)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    value={formHsnCode}
                    onChange={(e) => setFormHsnCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Image URL & Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Image URL (External)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-modal-pop">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Stock Adjustment: {selectedStockProduct.name}
            </h3>
            <p className="text-xs text-slate-500">
              Current Stock: <span className="font-bold text-slate-900 dark:text-white">{selectedStockProduct.stock} {selectedStockProduct.unit}</span>
            </p>

            <form onSubmit={handleStockAdjSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Units Count *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 5"
                    value={adjChange}
                    onChange={(e) => setAdjChange(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Action Type
                  </label>
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="adjustment">Stock In (Add)</option>
                    <option value="damaged">Damaged / Scrap (Reduce)</option>
                    <option value="expired">Expired (Reduce)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Adjustment
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physical inventory reconciliation"
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStockProduct(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Drawer */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsHistoryDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col p-6 space-y-4 animate-drawer-right">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" /> Stock Movement Ledger
                </h3>
                <button
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {stockMovements.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No recorded movements yet. Stock events from invoices and purchases will appear here.
                  </p>
                ) : (
                  stockMovements.map((sm) => (
                    <div
                      key={sm.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {sm.productName}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            sm.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {sm.quantityChange > 0 ? `+${sm.quantityChange}` : sm.quantityChange}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{sm.reason}</p>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                        <span>
                          {sm.stockBefore} → {sm.stockAfter} units
                        </span>
                        <span>{formatDate(sm.createdAt, true)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner / Generator modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onProductScanned={(p) => {
          setSearchTerm(p.name);
          setIsBarcodeModalOpen(false);
        }}
      />
    </div>
  );
};
