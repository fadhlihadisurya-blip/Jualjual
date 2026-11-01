import React, { useState } from 'react';
import { Material } from '../types';
import { formatRupiah } from '../utils/calculator';
import { Boxes, Plus, Edit2, Trash2, AlertTriangle, Search, Save, X } from 'lucide-react';
import { saveUserMaterial, deleteUserMaterial } from '../services/firestoreService';

interface MaterialManagerProps {
  materials: Material[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  userId?: string;
}

export const MaterialManager: React.FC<MaterialManagerProps> = ({ materials, setMaterials, userId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [totalStock, setTotalStock] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(5);

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setName('');
    setUnit('pcs');
    setTotalStock(100);
    setPurchasePrice(50000);
    setMinStock(10);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mat: Material) => {
    setEditingMaterial(mat);
    setName(mat.name);
    setUnit(mat.unit);
    setTotalStock(mat.totalStock);
    setPurchasePrice(mat.purchasePrice);
    setMinStock(mat.minStock);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const unitCost = totalStock > 0 ? purchasePrice / totalStock : 0;

    if (editingMaterial) {
      const updatedMat: Material = {
        ...editingMaterial,
        name,
        unit,
        totalStock,
        purchasePrice,
        initialQuantity: totalStock > editingMaterial.initialQuantity ? totalStock : editingMaterial.initialQuantity,
        minStock,
        unitCost
      };
      setMaterials(materials.map(m => m.id === editingMaterial.id ? updatedMat : m));
      if (userId) {
        saveUserMaterial(userId, updatedMat).catch(err => console.error("Firestore save error:", err));
      }
    } else {
      const newMat: Material = {
        id: `mat-${Date.now()}`,
        name,
        unit,
        totalStock,
        purchasePrice,
        initialQuantity: totalStock,
        minStock,
        unitCost
      };
      setMaterials([...materials, newMat]);
      if (userId) {
        saveUserMaterial(userId, newMat).catch(err => console.error("Firestore save error:", err));
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus bahan baku ini?')) {
      setMaterials(materials.filter(m => m.id !== id));
      if (userId) {
        deleteUserMaterial(userId, id).catch(err => console.error("Firestore delete error:", err));
      }
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900">Database Stok & Harga Modal Bahan Baku</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola harga beli modal dan jumlah stok untuk kalkulasi HPP produk yang presisi.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Bahan Baku
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-xs border border-slate-200 max-w-md">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Cari nama bahan baku..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Materials Table / Cards */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                <th className="py-4 px-6">Nama Bahan Baku</th>
                <th className="py-4 px-4">Stok Saat Ini</th>
                <th className="py-4 px-4">Total Harga Beli Modal</th>
                <th className="py-4 px-4">Harga Modal per Satuan</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    Tidak ada bahan baku ditemukan.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const isLow = mat.totalStock <= mat.minStock;
                  const unitCost = mat.totalStock > 0 ? mat.purchasePrice / mat.initialQuantity : 0;
                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs ${isLow ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                            <Boxes className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{mat.name}</p>
                            {isLow && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                                <AlertTriangle className="h-3 w-3" /> Stok Menipis (Min: {mat.minStock})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${isLow ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                          {mat.totalStock} {mat.unit}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {formatRupiah(mat.purchasePrice)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-indigo-600">{formatRupiah(unitCost)}</span>
                        <span className="text-xs text-slate-400"> / {mat.unit}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mat.id)}
                            className="rounded-xl p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Material Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMaterial ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nama Bahan Baku</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kain Katun, Tepung Terigu..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Satuan</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden bg-white"
                  >
                    <option value="pcs">Pcs (Buah)</option>
                    <option value="meter">Meter</option>
                    <option value="kg">Kg (Kilogram)</option>
                    <option value="gram">Gram</option>
                    <option value="liter">Liter</option>
                    <option value="ml">Mililiter</option>
                    <option value="roll">Roll</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Jumlah Stok Awal</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={totalStock}
                    onChange={(e) => setTotalStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Harga Beli Modal (Rp)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Batas Minimum Stok (Alert)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Preview Unit Cost */}
              <div className="rounded-2xl bg-indigo-50/60 p-4 border border-indigo-100 flex items-center justify-between text-sm">
                <span className="font-semibold text-indigo-900">Estimasi Harga Per Satuan:</span>
                <span className="font-extrabold text-indigo-700">
                  {formatRupiah(totalStock > 0 ? purchasePrice / totalStock : 0)} / {unit}
                </span>
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
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  Simpan Bahan Baku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
