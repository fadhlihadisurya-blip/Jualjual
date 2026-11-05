import React from 'react';
import { SaleTransaction } from '../types';
import { formatRupiah } from '../utils/calculator';
import { Printer, X, CheckCircle2, ShoppingBag } from 'lucide-react';

interface InvoiceModalProps {
  transaction: SaleTransaction | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(transaction.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto cursor-pointer" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:p-0 cursor-default" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-800">Nota / Invoice Penjualan</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Cetak / PDF
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 print:p-6 text-slate-800 bg-white">
          {/* Company / Brand Header with Centered Logo & Invoice Number on Bottom Right */}
          <div className="border-b border-slate-200 pb-3 mb-4 flex flex-col items-center text-center">
            <img
              src="/assets/aistudio/photo_2026-11-01_17-27-01_f9a4aa07.jpg"
              alt="Paradise Buket & Gift Logo"
              className="h-56 md:h-64 w-auto object-contain mx-auto mb-2"
            />
            <div className="w-full flex justify-between items-end px-1">
              <div className="text-left text-xs text-slate-500">
                <span className="font-medium">Tanggal: {formattedDate}</span>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 mb-0.5">
                  Lunas ({transaction.paymentMethod})
                </span>
                <p className="text-sm font-extrabold text-slate-900 tracking-tight">{transaction.invoiceNumber}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Kepada Pelanggan:</span>
              <p className="font-bold text-slate-800 text-base">{transaction.customerName || 'Pelanggan Umum'}</p>
              {transaction.customerPhone && (
                <p className="text-xs text-slate-600">Telp: {transaction.customerPhone}</p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Metode Pembayaran:</span>
              <p className="font-semibold text-slate-800">{transaction.paymentMethod}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left mb-6 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-3 px-2">Item Produk</th>
                <th className="py-3 px-2 text-center">Jml</th>
                <th className="py-3 px-2 text-right">Harga Satuan</th>
                <th className="py-3 px-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transaction.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-2 font-medium text-slate-800">{item.productName}</td>
                  <td className="py-3 px-2 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-3 px-2 text-right text-slate-600">{formatRupiah(item.sellingPrice)}</td>
                  <td className="py-3 px-2 text-right font-semibold text-slate-900">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="border-t border-slate-200 pt-4 flex flex-col items-end space-y-2">
            <div className="flex justify-between w-64 text-sm text-slate-600">
              <span>Total Item:</span>
              <span className="font-medium">{transaction.items.reduce((acc, i) => acc + i.quantity, 0)} Pcs</span>
            </div>
            {transaction.paymentMethod === 'Tunai' && transaction.cashTendered !== undefined && (
              <>
                <div className="flex justify-between w-64 text-sm text-slate-600">
                  <span>Tunai Diterima:</span>
                  <span className="font-medium">{formatRupiah(transaction.cashTendered)}</span>
                </div>
                <div className="flex justify-between w-64 text-sm text-emerald-700 font-semibold">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(transaction.changeAmount || 0)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between w-64 text-base font-bold text-slate-900 border-t border-slate-200 pt-2">
              <span>Total Tagihan:</span>
              <span className="text-indigo-600">{formatRupiah(transaction.totalAmount)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-10 border-t border-dashed border-slate-200 pt-6 text-center text-xs text-slate-400">
            <p>Terima kasih atas kepercayaan Anda berbelanja di JualJual.</p>
            <p className="mt-1">Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
          </div>
        </div>

        {/* Modal Footer (Hidden on print) */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
