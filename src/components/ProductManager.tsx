import React, { useState } from 'react';
import { Product, Material, ProductMaterial } from '../types';
import { calculateProductHPP, calculateProductProfit, formatRupiah } from '../utils/calculator';
import { PackageOpen, Plus, Edit2, Trash2, Search, Save, X, PlusCircle, MinusCircle, CheckCircle2 } from 'lucide-react';
import { saveUserProduct, deleteUserProduct, saveUserMaterial } from '../services/firestoreService';
import { MaterialSelect } from './MaterialSelect';

interface ProductManagerProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  materials: Material[];
  setMaterials?: React.Dispatch<React.SetStateAction<Material[]>>;
  userId?: string;
}

export const ProductManager: React.FC<ProductManagerProps> = ({ products, setProducts, materials, setMaterials, userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pakaian');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(100000);
  const [selectedMaterials, setSelectedMaterials] = useState<ProductMaterial[]>([]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Pakaian');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600');
    setSellingPrice(150000);
    setSelectedMaterials(materials.length > 0 ? [{ materialId: materials[0].id, quantity: 1 }] : []);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategory(prod.category);
    setDescription(prod.description || '');
    setImageUrl(prod.imageUrl || '');
    setSellingPrice(prod.sellingPrice);
    setSelectedMaterials([...prod.materials]);
    setIsModalOpen(true);
  };

  const handleAddMaterialRow = () => {
    if (materials.length === 0) return;
    // Find a material not yet added or default to first
    const available = materials.find(m => !selectedMaterials.some(sm => sm.materialId === m.id)) || materials[0];
    setSelectedMaterials([...selectedMaterials, { materialId: available.id, quantity: 1 }]);
  };

  const handleRemoveMaterialRow = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const handleUpdateMaterialRow = (index: number, field: 'materialId' | 'quantity', value: string | number) => {
    const updated = [...selectedMaterials];
    if (field === 'materialId') {
      updated[index].materialId = value as string;
    } else {
      updated[index].quantity = Number(value);
    }
    setSelectedMaterials(updated);
  };

  const handleAddNewMaterialOnTheFly = (name: string, index: number) => {
    const newMat: Material = {
      id: `mat-${Date.now()}`,
      name,
      unit: 'pcs',
      totalStock: 100,
      purchasePrice: 0,
      initialQuantity: 100,
      minStock: 5,
      unitCost: 0
    };
    if (setMaterials) {
      setMaterials(prev => [...prev, newMat]);
    }
    if (userId) {
      saveUserMaterial(userId, newMat).catch(err => console.error("Error saving on-the-fly material:", err));
    }
    handleUpdateMaterialRow(index, 'materialId', newMat.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProduct) {
      const updatedProd: Product = {
        ...editingProduct,
        name,
        category,
        description,
        imageUrl,
        sellingPrice,
        materials: selectedMaterials
      };
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProd : p));
      if (userId) {
        saveUserProduct(userId, updatedProd).catch(err => console.error("Firestore save error:", err));
      }
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name,
        category,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
        sellingPrice,
        materials: selectedMaterials
      };
      setProducts([...products, newProd]);
      if (userId) {
        saveUserProduct(userId, newProd).catch(err => console.error("Firestore save error:", err));
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
      if (userId) {
        deleteUserProduct(userId, id).catch(err => console.error("Firestore delete error:", err));
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Temporary product object for previewing HPP inside modal
  const previewProduct: Product = {
    id: 'preview',
    name: name || 'Preview',
    category,
    sellingPrice,
    materials: selectedMaterials
  };
  const { hpp: previewHPP, profit: previewProfit, margin: previewMargin } = calculateProductProfit(previewProduct, materials);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Katalog Produk & Resep Bahan Baku</h1>
          <p className="text-xs text-slate-500 mt-1">Pilih bahan baku yang digunakan untuk setiap produk, tentukan harga jual, dan hitung laba bersih secara otomatis.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Produk Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-xs border border-slate-200 max-w-md">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Cari nama produk atau kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            Tidak ada produk ditemukan.
          </div>
        ) : (
          filteredProducts.map((prod) => {
            const { hpp, profit, margin } = calculateProductProfit(prod, materials);
            return (
              <div key={prod.id} className="rounded-3xl bg-white shadow-sm border border-slate-100 overflow-hidden flex flex-col justify-between transition-all hover:shadow-md">
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'}
                      alt={prod.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-indigo-700 shadow-xs">
                      {prod.category}
                    </span>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{prod.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prod.description || 'Tidak ada deskripsi.'}</p>

                    {/* Materials used list summary */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Komposisi Bahan:</span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {prod.materials.map((pm, i) => {
                          const mat = materials.find(m => m.id === pm.materialId);
                          return (
                            <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
                              {mat ? mat.name.split(' ')[0] : 'Bahan'} ({pm.quantity} {mat?.unit || ''})
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 bg-white">
                  {/* Financial Breakdown card */}
                  <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5 text-xs mb-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Harga Modal (HPP):</span>
                      <span className="font-semibold text-slate-900">{formatRupiah(hpp)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Harga Jual:</span>
                      <span className="font-bold text-indigo-600">{formatRupiah(prod.sellingPrice)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                      <span className="text-emerald-700">Laba Bersih:</span>
                      <span className="text-emerald-600">+{formatRupiah(profit)} ({margin.toFixed(0)}%)</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Resep & Harga
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="rounded-xl p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                      title="Hapus Produk"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Product Modal with Recipe & Manual Price */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto cursor-pointer" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl my-8 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Produk & Resep Bahan' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kemeja Flanel Custom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="Pakaian">Pakaian</option>
                    <option value="Aksesoris">Aksesoris</option>
                    <option value="Kuliner">Kuliner / Makanan</option>
                    <option value="Kerajinan">Kerajinan / Craft</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">URL Gambar (Opsional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">Harga Jual (Ketik Manual)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full rounded-xl border-2 border-indigo-500 px-4 py-2.5 text-sm font-bold text-indigo-900 bg-indigo-50/30 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan produk..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                ></textarea>
              </div>

              {/* Recipe / Materials Used Section */}
              <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pilihan Bahan Baku yang Digunakan (Resep)</h4>
                    <p className="text-xs text-slate-500">Tentukan bahan dan takaran untuk menghitung modal (HPP) otomatis.</p>
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

                {selectedMaterials.length === 0 ? (
                  <p className="text-xs text-rose-500 py-3 text-center">Belum ada bahan dipilih. Klik 'Tambah Bahan' di atas.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedMaterials.map((sm, index) => {
                      const mat = materials.find(m => m.id === sm.materialId);
                      const unitCost = mat && mat.initialQuantity > 0 ? mat.purchasePrice / mat.initialQuantity : 0;
                      const subtotalMatCost = unitCost * sm.quantity;
                      return (
                        <div key={index} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <MaterialSelect
                            value={sm.materialId}
                            onChange={(newId) => handleUpdateMaterialRow(index, 'materialId', newId)}
                            materials={materials}
                            onAddNewMaterial={(name) => handleAddNewMaterialOnTheFly(name, index)}
                          />
                          <div className="flex items-center gap-1 w-32">
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              required
                              value={sm.quantity}
                              onChange={(e) => handleUpdateMaterialRow(index, 'quantity', e.target.value)}
                              className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-hidden text-center"
                            />
                            <span className="text-xs text-slate-500">{mat?.unit || ''}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-600 w-24 text-right">
                            {formatRupiah(subtotalMatCost)}
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

              {/* Real-time calculated HPP & Profit preview inside modal */}
              <div className="rounded-2xl bg-indigo-50 p-4 border border-indigo-100 grid grid-cols-3 gap-4 text-center">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Total HPP (Modal)</span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">{formatRupiah(previewHPP)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Harga Jual</span>
                  <p className="text-base font-extrabold text-indigo-600 mt-0.5">{formatRupiah(sellingPrice)}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Laba Bersih</span>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">+{formatRupiah(previewProfit)} ({previewMargin.toFixed(0)}%)</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
