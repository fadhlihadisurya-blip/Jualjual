import React, { useState } from 'react';
import { Product, Material, CartItem, SaleTransaction, ProductMaterial } from '../types';
import { calculateProductHPP, calculateProductProfit, formatRupiah } from '../utils/calculator';
import { ShoppingCart, Plus, Minus, Trash2, Search, CheckCircle, AlertTriangle, Printer, User, X, PlusCircle, MinusCircle, Edit3, Banknote } from 'lucide-react';
import { saveUserSaleTransaction } from '../services/firestoreService';

interface POSProps {
  products: Product[];
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  transactions: SaleTransaction[];
  setTransactions: React.Dispatch<React.SetStateAction<SaleTransaction[]>>;
  onCompleteSale: (transaction: SaleTransaction) => void;
  userId?: string;
}

export const POS: React.FC<POSProps> = ({ products, materials, setMaterials, transactions, setTransactions, onCompleteSale, userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Tunai' | 'Transfer Bank' | 'QRIS' | 'E-Wallet'>('QRIS');
  const [cashTendered, setCashTendered] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState('');

  // POS Product Click Modal State for Customizing Materials & Manual Selling Price
  const [clickedProduct, setClickedProduct] = useState<Product | null>(null);
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(0);
  const [customMaterials, setCustomMaterials] = useState<ProductMaterial[]>([]);

  const categories = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product: Product) => {
    setClickedProduct(product);
    setCustomSellingPrice(product.sellingPrice);
    setCustomMaterials(product.materials ? product.materials.map(m => ({ ...m })) : []);
  };

  const handleAddMaterialRow = () => {
    if (materials.length === 0) return;
    const available = materials.find(m => !customMaterials.some(cm => cm.materialId === m.id)) || materials[0];
    setCustomMaterials([...customMaterials, { materialId: available.id, quantity: 1 }]);
  };

  const handleRemoveMaterialRow = (index: number) => {
    setCustomMaterials(customMaterials.filter((_, i) => i !== index));
  };

  const handleUpdateMaterialRow = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
    const updated = [...customMaterials];
    if (field === 'materialId') {
      updated[index].materialId = value as string;
    } else {
      updated[index].quantity = Number(value);
    }
    setCustomMaterials(updated);
  };

  const handleAddToCartWithCustomizations = () => {
    if (!clickedProduct) return;

    const newItem: CartItem = {
      product: clickedProduct,
      quantity: 1,
      customMaterials: customMaterials,
      customSellingPrice: customSellingPrice
    };

    const existingIndex = cart.findIndex(item => item.product.id === clickedProduct.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].customMaterials = customMaterials;
      updated[existingIndex].customSellingPrice = customSellingPrice;
      setCart(updated);
    } else {
      setCart([...cart, newItem]);
    }

    setClickedProduct(null);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    const newQty = updated[index].quantity + delta;
    if (newQty > 0) {
      updated[index].quantity = newQty;
      setCart(updated);
    } else {
      setCart(cart.filter((_, i) => i !== index));
    }
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const getItemHPP = (item: CartItem): number => {
    const mats = item.customMaterials || item.product.materials;
    if (!mats) return 0;
    let hpp = 0;
    for (const pm of mats) {
      const mat = materials.find(m => m.id === pm.materialId);
      if (mat) {
        const unitCost = mat.initialQuantity > 0 ? mat.purchasePrice / mat.initialQuantity : mat.unitCost || 0;
        hpp += unitCost * pm.quantity;
      }
    }
    return Math.round(hpp);
  };

  const totalCartAmount = cart.reduce((acc, item) => {
    const price = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.sellingPrice;
    return acc + (price * item.quantity);
  }, 0);

  const totalCartModal = cart.reduce((acc, item) => {
    const hpp = getItemHPP(item);
    return acc + (hpp * item.quantity);
  }, 0);

  const totalCartProfit = totalCartAmount - totalCartModal;
  const changeAmount = cashTendered > totalCartAmount ? cashTendered - totalCartAmount : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setErrorMessage('');

    if (paymentMethod === 'Tunai') {
      if (cashTendered < totalCartAmount) {
        setErrorMessage(`Uang tunai yang diserahkan (${formatRupiah(cashTendered)}) kurang dari total tagihan (${formatRupiah(totalCartAmount)}).`);
        return;
      }
    }

    // Check if raw materials are sufficient
    const requiredMaterialsMap: { [materialId: string]: number } = {};
    for (const item of cart) {
      const mats = item.customMaterials || item.product.materials;
      for (const pm of mats) {
        requiredMaterialsMap[pm.materialId] = (requiredMaterialsMap[pm.materialId] || 0) + (pm.quantity * item.quantity);
      }
    }

    for (const [matId, reqQty] of Object.entries(requiredMaterialsMap)) {
      const mat = materials.find(m => m.id === matId);
      if (mat && mat.totalStock < reqQty) {
        setErrorMessage(`Stok bahan baku "${mat.name}" tidak mencukupi! Tersedia: ${mat.totalStock} ${mat.unit}, dibutuhkan: ${reqQty} ${mat.unit}.`);
        return;
      }
    }

    // Deduct materials stock
    const updatedMaterials = materials.map(mat => {
      const needed = requiredMaterialsMap[mat.id];
      if (needed) {
        return { ...mat, totalStock: Math.max(0, mat.totalStock - needed) };
      }
      return mat;
    });
    setMaterials(updatedMaterials);

    // Create transaction record
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSeq = String(transactions.length + 1).padStart(3, '0');
    const invoiceNumber = `INV-${dateStr}-${randomSeq}`;

    const transactionItems = cart.map(item => {
      const unitCost = getItemHPP(item);
      const sellingPrice = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.sellingPrice;
      const subtotal = sellingPrice * item.quantity;
      const subtotalModal = unitCost * item.quantity;
      return {
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        sellingPrice,
        unitCost,
        subtotal,
        subtotalModal,
        profit: subtotal - subtotalModal
      };
    });

    const newTransaction: SaleTransaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber,
      date: new Date().toISOString(),
      customerName: customerName.trim() || 'Pelanggan Umum',
      customerPhone: customerPhone.trim(),
      items: transactionItems,
      totalAmount: totalCartAmount,
      totalModal: totalCartModal,
      totalProfit: totalCartProfit,
      paymentMethod,
      cashTendered: paymentMethod === 'Tunai' ? cashTendered : undefined,
      changeAmount: paymentMethod === 'Tunai' ? changeAmount : undefined
    };

    setTransactions([newTransaction, ...transactions]);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCashTendered(0);

    // Save transaction and updated material stocks to Firestore in a batch write for this user
    if (userId) {
      saveUserSaleTransaction(userId, newTransaction, updatedMaterials).catch(err => {
        console.error("Firestore transaction save error:", err);
      });
    }
    
    onCompleteSale(newTransaction);
  };

  let previewHPP = 0;
  for (const cm of customMaterials) {
    const mat = materials.find(m => m.id === cm.materialId);
    if (mat) {
      const uc = mat.initialQuantity > 0 ? mat.purchasePrice / mat.initialQuantity : mat.unitCost || 0;
      previewHPP += uc * cm.quantity;
    }
  }
  previewHPP = Math.round(previewHPP);
  const previewProfit = customSellingPrice - previewHPP;
  const previewMargin = customSellingPrice > 0 ? (previewProfit / customSellingPrice) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-24 md:pb-8">
      
      {/* Left Column: Product Selection Catalog (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <Search className="h-5 w-5 text-slate-400 ml-1" />
            <input
              type="text"
              placeholder="Cari produk yang dijual..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-3xl border border-slate-100">
              Tidak ada produk ditemukan.
            </div>
          ) : (
            filteredProducts.map((prod) => {
              const { hpp } = calculateProductProfit(prod, materials);
              return (
                <div
                  key={prod.id}
                  onClick={() => handleProductClick(prod)}
                  className="group rounded-3xl bg-white p-4 shadow-sm border border-slate-100 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-36 w-full rounded-2xl bg-slate-100 overflow-hidden mb-3">
                      <img src={prod.imageUrl} alt={prod.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-2 left-2 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 shadow-2xs">
                        {prod.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{prod.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{prod.description || 'Klik untuk atur bahan & harga'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase">Modal: {formatRupiah(hpp)}</span>
                      <p className="text-sm font-extrabold text-slate-900">{formatRupiah(prod.sellingPrice)}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Edit3 className="h-3 w-3" />
                      Pilih Bahan & Harga
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Right Column: Cart & Checkout (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-fit sticky top-24">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Keranjang Belanja</h2>
            </div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {cart.reduce((a, b) => a + b.quantity, 0)} Item
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-2xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">Keranjang masih kosong.</p>
              <p className="text-xs text-slate-400 mt-0.5">Klik produk di sebelah kiri untuk memilih bahan & harga.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, index) => {
                const itemPrice = item.customSellingPrice !== undefined ? item.customSellingPrice : item.product.sellingPrice;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex-1 pr-2">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-slate-500">{formatRupiah(itemPrice)} × {item.quantity}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(index)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer & Payment Form */}
        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Pelanggan</label>
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 border border-slate-200">
              <User className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Nama Pelanggan / Umum"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-transparent py-2 text-xs font-medium text-slate-800 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              {(['QRIS', 'Transfer Bank', 'Tunai', 'E-Wallet'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Tendered Input when Payment Method is Tunai */}
          {paymentMethod === 'Tunai' && (
            <div className="rounded-2xl bg-amber-50/80 p-3 border border-amber-200 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Banknote className="h-4 w-4 text-amber-600" />
                Jumlah Uang Tunai Diterima (Rp)
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                placeholder="Contoh: 100000"
                value={cashTendered || ''}
                onChange={(e) => setCashTendered(Number(e.target.value))}
                className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-extrabold text-slate-900 focus:border-amber-500 focus:outline-hidden"
              />
              {cashTendered > 0 && (
                <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-amber-200 text-amber-900">
                  <span>Jumlah Kembalian:</span>
                  <span className={cashTendered >= totalCartAmount ? 'text-emerald-700 text-sm' : 'text-rose-600'}>
                    {cashTendered >= totalCartAmount ? formatRupiah(changeAmount) : 'Uang Tunai Kurang!'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Subtotals & Profit calculation */}
          <div className="rounded-2xl bg-slate-50 p-3.5 space-y-1.5 text-xs border border-slate-100">
            <div className="flex justify-between text-slate-600">
              <span>Total Modal (HPP):</span>
              <span className="font-semibold text-slate-900">{formatRupiah(totalCartModal)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Estimasi Laba Bersih:</span>
              <span>+{formatRupiah(totalCartProfit)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-extrabold text-slate-900">
              <span>Total Tagihan:</span>
              <span className="text-indigo-600">{formatRupiah(totalCartAmount)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700'
            }`}
          >
            <CheckCircle className="h-5 w-5" />
            Proses Pembayaran & Cetak Invoice
          </button>
        </div>

      </div>

      {/* CLICKED PRODUCT MODAL: Pilih Bahan & Ketik Harga Jual Manual */}
      {clickedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto cursor-pointer" onClick={() => setClickedProduct(null)}>
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl my-8 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{clickedProduct.category}</span>
                <h3 className="text-xl font-extrabold text-slate-900">{clickedProduct.name}</h3>
              </div>
              <button
                onClick={() => setClickedProduct(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Materials Selection */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pilihan Bahan Baku (Menentukan Harga Modal / HPP)</h4>
                    <p className="text-xs text-slate-500">Sesuaikan bahan yang digunakan untuk produk ini pada transaksi ini.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMaterialRow}
                    className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Tambah Bahan
                  </button>
                </div>

                {customMaterials.length === 0 ? (
                  <p className="text-xs text-rose-500 py-3 text-center">Belum ada bahan dipilih.</p>
                ) : (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                    {customMaterials.map((cm, index) => {
                      const mat = materials.find(m => m.id === cm.materialId);
                      const unitCost = mat && mat.initialQuantity > 0 ? mat.purchasePrice / mat.initialQuantity : 0;
                      const sub = unitCost * cm.quantity;
                      const cleanName = mat ? mat.name.replace(/\s*\([^)]*\)/g, '').trim() : 'Bahan';
                      return (
                        <div key={index} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <select
                            value={cm.materialId}
                            onChange={(e) => handleUpdateMaterialRow(index, 'materialId', e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 bg-white focus:outline-hidden"
                          >
                            {materials.map(m => {
                              const cn = m.name.replace(/\s*\([^)]*\)/g, '').trim();
                              const uc = m.initialQuantity > 0 ? m.purchasePrice / m.initialQuantity : m.unitCost || 0;
                              return (
                                <option key={m.id} value={m.id}>
                                  {cn} ({formatRupiah(uc)} / {m.unit})
                                </option>
                              );
                            })}
                          </select>
                          <div className="flex items-center gap-1 w-28">
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              required
                              value={cm.quantity}
                              onChange={(e) => handleUpdateMaterialRow(index, 'quantity', e.target.value)}
                              className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden text-center"
                            />
                            <span className="text-xs text-slate-500">{mat?.unit || ''}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-24 text-right">
                            {formatRupiah(sub)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterialRow(index)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Manual Selling Price Input right below */}
              <div className="rounded-2xl border-2 border-indigo-500 p-4 bg-indigo-50/40">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 mb-1">
                  Harga Jual (Ketik Manual di Bawah)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-indigo-700">Rp</span>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    value={customSellingPrice}
                    onChange={(e) => setCustomSellingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-indigo-300 bg-white px-4 py-3 text-lg font-extrabold text-indigo-900 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Anda dapat menyesuaikan harga jual khusus untuk transaksi ini.</p>
              </div>

              {/* Calculated preview */}
              <div className="rounded-2xl bg-slate-900 text-white p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total HPP (Modal)</span>
                  <p className="text-base font-extrabold text-slate-200 mt-0.5">{formatRupiah(previewHPP)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Harga Jual</span>
                  <p className="text-base font-extrabold text-indigo-400 mt-0.5">{formatRupiah(customSellingPrice)}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Laba Bersih</span>
                  <p className="text-base font-extrabold text-emerald-400 mt-0.5">+{formatRupiah(previewProfit)} ({previewMargin.toFixed(0)}%)</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setClickedProduct(null)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleAddToCartWithCustomizations}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Masukkan ke Keranjang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
