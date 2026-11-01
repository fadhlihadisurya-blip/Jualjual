import React, { useState } from 'react';
import { SaleTransaction } from '../types';
import { formatRupiah } from '../utils/calculator';
import { FileText, Search, Printer, Calendar, DollarSign, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';

interface ReportManagerProps {
  transactions: SaleTransaction[];
  onSelectTransaction: (trx: SaleTransaction) => void;
}

export const ReportManager: React.FC<ReportManagerProps> = ({ transactions, onSelectTransaction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week'>('all');

  const now = new Date();
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedPeriod === 'today') {
      const tDate = new Date(t.date);
      return tDate.toDateString() === now.toDateString();
    }
    if (selectedPeriod === 'week') {
      const tDate = new Date(t.date);
      const diffTime = Math.abs(now.getTime() - tDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    return true;
  });

  const totalRevenue = filteredTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalModal = filteredTransactions.reduce((acc, t) => acc + t.totalModal, 0);
  const totalProfit = filteredTransactions.reduce((acc, t) => acc + t.totalProfit, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header & Metrics */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Laporan Keuangan & Riwayat Penjualan</h1>
          <p className="text-xs text-slate-500 mt-1">Pantau performa finansial, rincian modal, dan cetak ulang invoice pelanggan.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'today', 'week'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period === 'all' ? 'Semua Waktu' : period === 'today' ? 'Hari Ini' : '7 Hari Terakhir'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendapatan</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formatRupiah(totalRevenue)}</h3>
          </div>
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Modal (HPP)</span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formatRupiah(totalModal)}</h3>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Laba Bersih</span>
            <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">+{formatRupiah(totalProfit)}</h3>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-xs border border-slate-200 max-w-md">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Cari nomor invoice atau nama pelanggan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Transactions History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                <th className="py-4 px-6">No. Invoice & Pelanggan</th>
                <th className="py-4 px-4">Tanggal & Waktu</th>
                <th className="py-4 px-4">Metode</th>
                <th className="py-4 px-4 text-right">Pendapatan</th>
                <th className="py-4 px-4 text-right">Laba Bersih</th>
                <th className="py-4 px-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Tidak ada riwayat transaksi ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{trx.invoiceNumber}</p>
                      <p className="text-xs text-slate-500">{trx.customerName}</p>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {new Date(trx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-semibold text-slate-900">
                      {formatRupiah(trx.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-emerald-600">
                      +{formatRupiah(trx.totalProfit)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => onSelectTransaction(trx)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        Invoice PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
