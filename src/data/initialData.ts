import { Material, Product, SaleTransaction } from '../types';

export const initialMaterials: Material[] = [
  {
    id: 'mat-1',
    name: 'Kain Katun Jepang (Meter)',
    unit: 'meter',
    totalStock: 35,
    purchasePrice: 1400000,
    initialQuantity: 50,
    minStock: 10,
    unitCost: 28000
  },
  {
    id: 'mat-2',
    name: 'Benang Jahit Premium (Roll)',
    unit: 'roll',
    totalStock: 8,
    purchasePrice: 48000,
    initialQuantity: 20,
    minStock: 5,
    unitCost: 2400
  },
  {
    id: 'mat-3',
    name: 'Kancing Kayu Natural (Pcs)',
    unit: 'pcs',
    totalStock: 120,
    purchasePrice: 60000,
    initialQuantity: 200,
    minStock: 30,
    unitCost: 300
  },
  {
    id: 'mat-4',
    name: 'Tepung Terigu Protein Tinggi (Kg)',
    unit: 'kg',
    totalStock: 15,
    purchasePrice: 225000,
    initialQuantity: 25,
    minStock: 5,
    unitCost: 9000
  },
  {
    id: 'mat-5',
    name: 'Butter / Mentega (Gram)',
    unit: 'gram',
    totalStock: 800, // Low stock alert (min 1000)
    purchasePrice: 160000,
    initialQuantity: 2000,
    minStock: 1000,
    unitCost: 80
  },
  {
    id: 'mat-6',
    name: 'Cokelat Hitam Belcolade (Gram)',
    unit: 'gram',
    totalStock: 2500,
    purchasePrice: 375000,
    initialQuantity: 3000,
    minStock: 500,
    unitCost: 125
  },
  {
    id: 'mat-7',
    name: 'Kain Kanvas Tebal (Meter)',
    unit: 'meter',
    totalStock: 4, // Low stock alert (min 5)
    purchasePrice: 240000,
    initialQuantity: 20,
    minStock: 5,
    unitCost: 12000
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Kemeja Casual Katun Slimfit',
    category: 'Pakaian',
    description: 'Kemeja pria lengan panjang bahan katun jepang lembut & nyaman.',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600',
    sellingPrice: 185000,
    materials: [
      { materialId: 'mat-1', quantity: 1.5 }, // 1.5 meter kain
      { materialId: 'mat-2', quantity: 0.2 }, // 0.2 roll benang
      { materialId: 'mat-3', quantity: 7 }    // 7 kancing
    ]
  },
  {
    id: 'prod-2',
    name: 'Totebag Kanvas Aesthetic',
    category: 'Aksesoris',
    description: 'Tas jinjing kanvas kuat dengan sablon minimalis.',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    sellingPrice: 75000,
    materials: [
      { materialId: 'mat-7', quantity: 0.4 }, // 0.4 meter kanvas
      { materialId: 'mat-2', quantity: 0.1 }  // benang
    ]
  },
  {
    id: 'prod-3',
    name: 'Signature Brownies Fudgy (Loyang)',
    category: 'Kuliner',
    description: 'Brownies panggang dengan cokelat hitam pilihan legit dan moist.',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600',
    sellingPrice: 95000,
    materials: [
      { materialId: 'mat-4', quantity: 0.25 }, // 250 gram terigu
      { materialId: 'mat-5', quantity: 150 },  // 150 gram butter
      { materialId: 'mat-6', quantity: 200 }   // 200 gram cokelat
    ]
  }
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const initialTransactions: SaleTransaction[] = [
  {
    id: 'trx-1',
    invoiceNumber: 'INV-20261101-001',
    date: today.toISOString(),
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    paymentMethod: 'QRIS',
    items: [
      {
        productId: 'prod-1',
        productName: 'Kemeja Casual Katun Slimfit',
        quantity: 2,
        sellingPrice: 185000,
        unitCost: 44480, // (1.5*28000 + 0.2*2400 + 7*300) = 42000 + 480 + 2100 = 44580
        subtotal: 370000,
        subtotalModal: 89160,
        profit: 280840
      },
      {
        productId: 'prod-2',
        productName: 'Totebag Kanvas Aesthetic',
        quantity: 1,
        sellingPrice: 75000,
        unitCost: 5040, // (0.4*12000 + 0.1*2400) = 4800 + 240 = 5040
        subtotal: 75000,
        subtotalModal: 5040,
        profit: 69960
      }
    ],
    totalAmount: 445000,
    totalModal: 94200,
    totalProfit: 350800
  },
  {
    id: 'trx-2',
    invoiceNumber: 'INV-20261031-002',
    date: yesterday.toISOString(),
    customerName: 'Siti Rahma',
    customerPhone: '085678901234',
    paymentMethod: 'Transfer Bank',
    items: [
      {
        productId: 'prod-3',
        productName: 'Signature Brownies Fudgy (Loyang)',
        quantity: 3,
        sellingPrice: 95000,
        unitCost: 40750, // (0.25*9000 + 150*80 + 200*125) = 2250 + 12000 + 25000 = 39250
        subtotal: 285000,
        subtotalModal: 117750,
        profit: 167250
      }
    ],
    totalAmount: 285000,
    totalModal: 117750,
    totalProfit: 167250
  }
];
