import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, ScanLine, Volume2, Printer, Check, Search, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<Props> = ({ isOpen, onClose, onProductScanned }) => {
  const { products } = useShop();
  const [manualCode, setManualCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mode, setMode] = useState<'scan' | 'generate'>('scan');
  const [selectedForBarcode, setSelectedForBarcode] = useState<Product | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Audio beep
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext not allowed or muted
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access denied or unavailable on this device. You can test barcode scan below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && mode === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, mode]);

  // Handle barcode match
  const handleBarcodeEntered = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const found = products.find(
      (p) => p.barcode === trimmed || p.sku.toLowerCase() === trimmed.toLowerCase()
    );

    if (found) {
      playBeep();
      setScannedProduct(found);
      onProductScanned(found);
    } else {
      alert(`No product found with barcode/SKU: ${trimmed}`);
    }
  };

  // Render barcode canvas for printing
  useEffect(() => {
    if (selectedForBarcode && barcodeCanvasRef.current) {
      const canvas = barcodeCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Draw stylized bars
      ctx.fillStyle = '#000000';
      const code = selectedForBarcode.barcode || selectedForBarcode.sku || '890123456000';
      let x = 20;
      for (let i = 0; i < code.length; i++) {
        const charCode = code.charCodeAt(i);
        const barWidth = (charCode % 4) + 2;
        const gap = ((charCode * 3) % 4) + 2;
        ctx.fillRect(x, 15, barWidth, 60);
        x += barWidth + gap;
        if (x > w - 30) break;
      }

      // Draw text
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(code, w / 2, 90);
    }
  }, [selectedForBarcode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-modal-pop">
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('scan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === 'scan'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ScanLine className="w-4 h-4" /> Barcode Scanner
            </button>
            <button
              onClick={() => setMode('generate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === 'generate'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Printer className="w-4 h-4" /> Generate Barcode Label
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {mode === 'scan' ? (
            <>
              {/* Camera Video Feed */}
              <div className="relative w-full h-56 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border-2 border-indigo-500/40">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

                {/* Laser animation overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-48 h-32 border-2 border-emerald-400/80 rounded-lg relative">
                    <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse top-1/2" />
                  </div>
                  <p className="text-[11px] text-white/80 bg-slate-900/80 px-2 py-0.5 rounded mt-3 backdrop-blur-sm">
                    Align barcode inside the target box
                  </p>
                </div>

                {!cameraActive && cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 p-4 flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                    <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
                  </div>
                )}
              </div>

              {/* Fast Simulated Barcode Buttons (For quick testing & desktop POS) */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Quick Click Barcodes (Simulate Scan):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {products.slice(0, 6).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleBarcodeEntered(p.barcode)}
                      className="p-2 text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 rounded-lg transition active:scale-95 group"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {p.barcode} • {formatCurrency(p.sellingPrice)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual Barcode Input */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleBarcodeEntered(manualCode);
                    setManualCode('');
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Enter or scan barcode number / SKU..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                  >
                    Find Item
                  </button>
                </form>
              </div>

              {/* Last Scanned Feedback */}
              {scannedProduct && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                        Added to Bill: {scannedProduct.name}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        Price: {formatCurrency(scannedProduct.sellingPrice)} | Stock: {scannedProduct.stock}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-600 text-white rounded">
                    +1 Qty
                  </span>
                </div>
              )}
            </>
          ) : (
            /* Barcode Generator */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Product for Barcode:
                </label>
                <select
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    setSelectedForBarcode(found || null);
                  }}
                  value={selectedForBarcode?.id || ''}
                >
                  <option value="">-- Choose a product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) - {p.barcode || 'No barcode'}
                    </option>
                  ))}
                </select>
              </div>

              {selectedForBarcode && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Retail Shelf Sticker
                  </p>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm max-w-xs">
                    {selectedForBarcode.name}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    MRP: {formatCurrency(selectedForBarcode.mrp)} | Sale: {formatCurrency(selectedForBarcode.sellingPrice)}
                  </p>

                  <canvas
                    ref={barcodeCanvasRef}
                    width={280}
                    height={100}
                    className="border border-slate-300 dark:border-slate-600 rounded bg-white"
                  />

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                    >
                      <Printer className="w-4 h-4" /> Print Sticker
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
