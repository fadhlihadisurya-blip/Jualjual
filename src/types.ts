export interface Material {
  id: string;
  name: string;
  unit: string; // e.g. gram, ml, pcs, meter
  totalStock: number; // Current available quantity
  purchasePrice: number; // Total purchase cost for this batch
  initialQuantity: number; // Initial quantity purchased
  minStock: number; // Threshold for low stock warning
  unitCost: number; // Calculated price per unit (purchasePrice / initialQuantity or totalStock)
}

export interface ProductMaterial {
  materialId: string;
  quantity: number; // Quantity of material used for 1 unit of product
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;
  sellingPrice: number; // Harga jual manual
  materials: ProductMaterial[]; // Daftar bahan yang digunakan
}

export interface CartItem {
  product: Product;
  quantity: number;
  customMaterials?: ProductMaterial[];
  customSellingPrice?: number;
}

export interface TransactionItem {
  productId: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  unitCost: number; // HPP per unit at time of sale
  subtotal: number;
  subtotalModal: number;
  profit: number;
}

export interface SaleTransaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  customerName: string;
  customerPhone?: string;
  items: TransactionItem[];
  totalAmount: number;
  totalModal: number;
  totalProfit: number;
  paymentMethod: 'Tunai' | 'Transfer Bank' | 'QRIS' | 'E-Wallet';
  cashTendered?: number;
  changeAmount?: number;
}

export type TabType = 'dashboard' | 'pos' | 'products' | 'materials' | 'reports';
