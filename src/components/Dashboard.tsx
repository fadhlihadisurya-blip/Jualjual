import React from 'react';
import { SaleTransaction, Material, Product, TabType } from '../types';
import { formatRupiah } from '../utils/calculator';
import { TrendingUp, Wallet, DollarSign, ShoppingBag, AlertTriangle, ArrowRight, ArrowUpRight, Boxes } from 'lucide-react';

interface DashboardProps {
  transactions: SaleTransaction[];
  materials: Material[];
  products: Product[];
  setTab: (tab: TabType) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ transactions, materials, products, setTab }) => {
  // Hitung total finansial real-time
  const totalRevenue = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalModal = transactions.reduce((acc, t) => acc + t.totalModal, 0);
  const totalProfit = transactions.reduce((acc, t) => acc + t.totalProfit, 0);
  const totalTransactionsCount = transactions.length;

  const profitMarginAvg = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Bahan menipis
  const lowStockMaterials = materials.filter(m => m.totalStock <= m.minStock);

  // Produk terlaris (berdasarkan kuantitas terjual)
  const productSalesCount: { [productId: string]: { name: string; qty: number; revenue: number } } = {};
  transactions.forEach(t => {
    t.items.forEach(item => {
      if (!productSalesCount[item.productId]) {
        productSalesCount[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesCount[item.productId].qty += item.quantity;
      productSalesCount[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesCount).sort((a, b) => b.qty - a.qty).slice(0, 5);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200 backdrop-blur-md mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              Dasbor Performa Real-Time
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Selamat Datang di JualJual POS</h1>
            <p className="mt-1 text-indigo-200 text-sm max-w-xl">
              Pantau penjualan, kalkulasi HPP bahan baku otomatis, dan kelola keuntungan bersih usaha Anda dengan mudah.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setTab('pos')}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-600 transition-all cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              Mulai Transaksi Kasir
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockMaterials.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 md:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="rounded-xl bg-rose-500 p-2 text-white shadow-xs">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-900">Perhatian: Stok Bahan Baku Menipis!</h2>
              <p className="text-xs text-rose-700 mt-0.5">
                Ada {lowStockMaterials.length} bahan baku yang berada di bawah batas minimum stok. Segera lakukan restock untuk kelancaran produksi.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {lowStockMaterials.map(m => (
                  <span key={m.id} className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-rose-800 border border-rose-200 shadow-2xs">
                    <Boxes className="h-3 w-3 text-rose-500" />
                    {m.name} ({m.totalStock} {m.unit})
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setTab('materials')}
            className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer shrink-0"
          >
            Kelola Stok
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Pendapatan */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendapatan</span>
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900">{formatRupiah(totalRevenue)}</h3>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              <span className="font-semibold text-indigo-600">{totalTransactionsCount}</span> Transaksi sukses
            </p>
          </div>
        </div>

        {/* Total HPP / Modal */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Modal (HPP)</span>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-slate-900">{formatRupiah(totalModal)}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Biaya bahan baku terpakai
            </p>
          </div>
        </div>

        {/* Total Laba Bersih */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Laba Bersih</span>
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-extrabold text-emerald-600">{formatRupiah(totalProfit)}</h3>
            <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
              Margin keuntungan rata-rata: <span className="font-semibold text-emerald-600">{profitMarginAvg.toFixed(1)}%</span>
            </p>
          </div>
        </div>

        {/* Jumlah Produk / Bahan */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Katalog & Stok</span>
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
              <Boxes className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Total Produk:</span>
              <span className="font-bold text-slate-900">{products.length} Item</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-slate-600">Bahan Baku:</span>
              <span className="font-bold text-slate-900">{materials.length} Jenis</span>
            </div>
          </div>
        </div>

      </div>

      {/* Two Columns: Recent Transactions & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Transaksi Terbaru</h3>
              <p className="text-xs text-slate-500">Aktivitas penjualan kasir terakhir</p>
            </div>
            <button
              onClick={() => setTab('reports')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">Belum ada transaksi tercatat.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                    <th className="py-3 px-2">Invoice & Pelanggan</th>
                    <th className="py-3 px-2">Tanggal</th>
                    <th className="py-3 px-2 text-right">Total Jual</th>
                    <th className="py-3 px-2 text-right">Laba Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 5).map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-bold text-slate-900">{trx.invoiceNumber}</p>
                        <p className="text-xs text-slate-500">{trx.customerName || 'Umum'}</p>
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-600">
                        {new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-900">
                        {formatRupiah(trx.totalAmount)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-emerald-600">
                        +{formatRupiah(trx.totalProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Produk Terlaris</h3>
              <p className="text-xs text-slate-500">Berdasarkan volume penjualan</p>
            </div>
            <button
              onClick={() => setTab('products')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Katalog
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {topProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">Belum ada data produk terjual.</div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                      <p className="text-xs text-slate-500">Terjual <span className="font-semibold text-indigo-600">{p.qty}</span> pcs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatRupiah(p.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
