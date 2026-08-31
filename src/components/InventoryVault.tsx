import React, { useState } from 'react';
import { 
  Boxes, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trash2, 
  RotateCcw, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  ShieldAlert, 
  CheckCircle2, 
  History,
  Tag,
  Scale
} from 'lucide-react';
import { InventoryLog, JewelryProduct, LiveRates } from '../types';
import { formatINR } from '../utils/pricing';

interface InventoryVaultProps {
  products: JewelryProduct[];
  rates: LiveRates;
  inventoryLogs: InventoryLog[];
  onCheckIn: (payload: any) => Promise<void>;
  onCheckOut: (payload: any) => Promise<void>;
  onSoftDelete: (productId: string) => Promise<void>;
  onRestore: (productId: string) => Promise<void>;
  triggerToast: (msg: string) => void;
}

export const InventoryVault: React.FC<InventoryVaultProps> = ({
  products,
  rates,
  inventoryLogs,
  onCheckIn,
  onCheckOut,
  onSoftDelete,
  onRestore,
  triggerToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'LEDGER' | 'CHECK_IN' | 'CHECK_OUT' | 'TRASH_ARCHIVE'>('LEDGER');
  const [searchQuery, setSearchQuery] = useState('');

  // Check-In Form State
  const [checkInProductId, setCheckInProductId] = useState(products[0]?.id || '');
  const [checkInQuantity, setCheckInQuantity] = useState(1);
  const [checkInBatch, setCheckInBatch] = useState(`BATCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [checkInSupplier, setCheckInSupplier] = useState('Haldwani Master Karigar Guild');
  const [checkInReason, setCheckInReason] = useState('New bridal showcase intake from master atelier');
  const [checkInHuid, setCheckInHuid] = useState('DLX916BR' + Math.floor(1000 + Math.random() * 9000));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check-Out Form State
  const [checkOutProductId, setCheckOutProductId] = useState(products[0]?.id || '');
  const [checkOutQuantity, setCheckOutQuantity] = useState(1);
  const [checkOutReason, setCheckOutReason] = useState('VIP Showroom Walk-in Purchase & Delivery');
  const [checkOutRecipient, setCheckOutRecipient] = useState('Walk-in Client Collection');

  const activeProducts = products.filter(p => !p.isDeleted);
  const softDeletedProducts = products.filter(p => p.isDeleted);

  // Handle Check-In
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedProd = products.find(p => p.id === checkInProductId);
      if (!selectedProd) return;

      await onCheckIn({
        productId: checkInProductId,
        quantity: checkInQuantity,
        batchNumber: checkInBatch,
        supplier: checkInSupplier,
        reason: checkInReason,
        huidList: [checkInHuid],
        grossWeightChange: selectedProd.grossWeight * checkInQuantity,
        pureGoldWeightChange: (selectedProd.netGoldWeight || selectedProd.grossWeight) * checkInQuantity,
        goldRateApplied: rates.gold22k / 10
      });

      triggerToast(`Successfully checked in +${checkInQuantity} unit(s) of ${selectedProd.name}`);
      setActiveSubTab('LEDGER');
    } catch (err: any) {
      triggerToast(err.message || 'Check-in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Check-Out
  const handleCheckOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const selectedProd = products.find(p => p.id === checkOutProductId);
      if (!selectedProd) return;

      await onCheckOut({
        productId: checkOutProductId,
        quantity: checkOutQuantity,
        reason: checkOutReason,
        recipientOrCustomer: checkOutRecipient
      });

      triggerToast(`Successfully checked out -${checkOutQuantity} unit(s) of ${selectedProd.name}`);
      setActiveSubTab('LEDGER');
    } catch (err: any) {
      triggerToast(err.message || 'Check-out failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Metrics */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8D5B5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#C59B27]" />
            <h3 className="font-serif-luxury text-base font-bold text-stone-900">
              Showroom Inventory & Bullion Vault
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Tamper-proof physical stock check-in/check-out, HUID batch reconciliation, and audit soft-delete management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('CHECK_IN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              activeSubTab === 'CHECK_IN' 
                ? 'bg-emerald-700 text-white shadow-xs' 
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Stock Check-In</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CHECK_OUT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition ${
              activeSubTab === 'CHECK_OUT' 
                ? 'bg-rose-700 text-white shadow-xs' 
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Stock Check-Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('LEDGER')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'LEDGER'
              ? 'bg-[#081816] text-[#DFB76C]'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Inventory Transaction Ledger ({inventoryLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('TRASH_ARCHIVE')}
          className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
            activeSubTab === 'TRASH_ARCHIVE'
              ? 'bg-[#081816] text-[#DFB76C]'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Soft-Deleted Trash Archive ({softDeletedProducts.length})</span>
        </button>
      </div>

      {/* ================= VIEW 1: TRANSACTION LEDGER ================= */}
      {activeSubTab === 'LEDGER' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transaction, SKU, or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#C59B27]"
              />
            </div>
            <span className="text-xs text-stone-500 font-mono">
              Total Log Entries: {inventoryLogs.length}
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Type</th>
                    <th className="p-3">Product / SKU</th>
                    <th className="p-3">Quantity Delta</th>
                    <th className="p-3">Stock Balance</th>
                    <th className="p-3">Batch & Karigar Details</th>
                    <th className="p-3">Time & Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {inventoryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No inventory transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    inventoryLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-stone-50/80 transition">
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] inline-flex items-center gap-1 ${
                            log.actionType === 'CHECK_IN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.actionType === 'CHECK_IN' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {log.actionType}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-stone-900">{log.productName}</div>
                          <div className="text-[10px] font-mono text-stone-400">SKU: {log.productSku}</div>
                        </td>
                        <td className="p-3 font-mono font-bold">
                          <span className={log.quantityChange > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                            {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange} pcs
                          </span>
                          {log.grossWeightChange && (
                            <div className="text-[10px] text-stone-400 font-normal">
                              {log.grossWeightChange > 0 ? `+${log.grossWeightChange.toFixed(1)}g` : `${log.grossWeightChange.toFixed(1)}g`}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-stone-700">
                          {log.previousStock} → <strong className="text-stone-900">{log.newStock} pcs</strong>
                        </td>
                        <td className="p-3 text-stone-600">
                          <div className="font-mono text-[11px] text-[#996515] font-bold">{log.batchNumber || 'N/A'}</div>
                          <div className="text-[11px] text-stone-500">{log.reason}</div>
                          {log.supplierOrCustomer && (
                            <div className="text-[10px] text-stone-400">Party: {log.supplierOrCustomer}</div>
                          )}
                        </td>
                        <td className="p-3 text-[11px] text-stone-500 font-mono">
                          <div>{new Date(log.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[10px] text-stone-400">{log.performedBy}</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: CHECK-IN FORM ================= */}
      {activeSubTab === 'CHECK_IN' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs max-w-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
            <h4 className="font-serif-luxury text-base font-bold text-stone-900">
              Record New Inventory Check-In
            </h4>
          </div>

          <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Select Jewelry Item</label>
              <select
                value={checkInProductId}
                onChange={(e) => setCheckInProductId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium cursor-pointer"
              >
                {activeProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku} • {p.purity} • {p.grossWeight}g) - Current Stock: {p.stockCount}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Intake Quantity (pcs)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={checkInQuantity}
                  onChange={(e) => setCheckInQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Karigar Batch Reference</label>
                <input
                  type="text"
                  required
                  value={checkInBatch}
                  onChange={(e) => setCheckInBatch(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Supplier / Master Karigar Guild</label>
                <input
                  type="text"
                  value={checkInSupplier}
                  onChange={(e) => setCheckInSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Laser HUID Code</label>
                <input
                  type="text"
                  value={checkInHuid}
                  onChange={(e) => setCheckInHuid(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Check-In Notes / Reason</label>
              <input
                type="text"
                value={checkInReason}
                onChange={(e) => setCheckInReason(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit Check-In & Update Stock Ledger</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= VIEW 3: CHECK-OUT FORM ================= */}
      {activeSubTab === 'CHECK_OUT' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs max-w-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ArrowUpRight className="w-5 h-5 text-rose-600" />
            <h4 className="font-serif-luxury text-base font-bold text-stone-900">
              Record Inventory Check-Out / Sale Dispatch
            </h4>
          </div>

          <form onSubmit={handleCheckOutSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Select Item to Check-Out</label>
              <select
                value={checkOutProductId}
                onChange={(e) => setCheckOutProductId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium cursor-pointer"
              >
                {activeProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku} • Stock: {p.stockCount} pcs)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Quantity to Deduct</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={checkOutQuantity}
                  onChange={(e) => setCheckOutQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Recipient / Customer</label>
                <input
                  type="text"
                  required
                  value={checkOutRecipient}
                  onChange={(e) => setCheckOutRecipient(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Reason for Check-Out</label>
              <select
                value={checkOutReason}
                onChange={(e) => setCheckOutReason(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
              >
                <option value="VIP Showroom Walk-in Purchase & Delivery">VIP Showroom Walk-in Purchase & Delivery</option>
                <option value="Showroom Display Allocation (Nanda Vihar)">Showroom Display Allocation (Nanda Vihar)</option>
                <option value="Transfer to Karigar for Resize / Customization">Transfer to Karigar for Resize / Customization</option>
                <option value="Damaged / Sent for Melting & Recycling">Damaged / Sent for Melting & Recycling</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Authorize & Execute Stock Deduction</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= VIEW 4: SOFT DELETED TRASH ARCHIVE ================= */}
      {activeSubTab === 'TRASH_ARCHIVE' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Soft Delete Compliance & Complete Audit Retention</p>
              <p className="text-amber-800 mt-0.5">
                In accordance with forensic accounting and Gemini AI Sentinel auditing requirements, deleted items are archived rather than permanently purged from the database. This retains full historical gold weight valuations and allows instant restoration.
              </p>
            </div>
          </div>

          {softDeletedProducts.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center space-y-2">
              <Trash2 className="w-8 h-8 text-stone-300 mx-auto" />
              <h4 className="font-bold text-stone-700">Trash Archive is Empty</h4>
              <p className="text-xs text-stone-500">No soft-deleted products currently in the archive.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {softDeletedProducts.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    {p.images[0] && (
                      <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-stone-200 opacity-60" />
                    )}
                    <div>
                      <div className="font-bold text-stone-800">{p.name}</div>
                      <div className="text-[11px] text-stone-400 font-mono">SKU: {p.sku} • {p.purity} • {p.grossWeight}g</div>
                      <div className="text-[10px] text-rose-600 mt-1">
                        Archived on {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString() : 'N/A'} by {p.deletedBy || 'Admin'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRestore(p.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#081816] text-[#DFB76C] hover:bg-[#122e2a] hover:text-white transition font-bold text-xs flex items-center gap-1.5 border border-[#C59B27]/40 cursor-pointer shadow-xs"
                    title="Restore product to active catalog"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
