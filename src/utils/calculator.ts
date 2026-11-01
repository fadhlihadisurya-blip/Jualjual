import { Product, Material } from '../types';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Hitung HPP (Modal) satu produk berdasarkan resep dan harga satuan bahan baku
export const calculateProductHPP = (product: Product, materials: Material[]): number => {
  if (!product.materials || product.materials.length === 0) return 0;

  let totalHPP = 0;
  for (const pm of product.materials) {
    const mat = materials.find(m => m.id === pm.materialId);
    if (mat) {
      // unitCost = purchasePrice / initialQuantity (or stored unitCost)
      const unitCost = mat.initialQuantity > 0 ? mat.purchasePrice / mat.initialQuantity : mat.unitCost || 0;
      totalHPP += unitCost * pm.quantity;
    }
  }
  return Math.round(totalHPP);
};

export const calculateProductProfit = (product: Product, materials: Material[]): { hpp: number; profit: number; margin: number } => {
  const hpp = calculateProductHPP(product, materials);
  const profit = product.sellingPrice - hpp;
  const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;
  return { hpp, profit, margin };
};
