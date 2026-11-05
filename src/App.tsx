import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { TabType, Material, Product, SaleTransaction } from './types';
import { initialMaterials, initialProducts, initialTransactions } from './data/initialData';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { ProductManager } from './components/ProductManager';
import { MaterialManager } from './components/MaterialManager';
import { ReportManager } from './components/ReportManager';
import { InvoiceModal } from './components/InvoiceModal';
import { AuthModal } from './components/AuthModal';
import { InstallModal } from './components/InstallModal';
import {
  subscribeToUserMaterials,
  subscribeToUserProducts,
  subscribeToUserTransactions,
  checkAndInitializeUserData
} from './services/firestoreService';
import { LogIn, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentTab, setTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // User-scoped data state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<SaleTransaction[]>([]);
  const [activeInvoiceTransaction, setActiveInvoiceTransaction] = useState<SaleTransaction | null>(null);

  // 1. Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // Immediately load this user's cached data to prevent showing previous user's data
        const userMatKey = `labacraft_materials_${user.uid}`;
        const userProdKey = `labacraft_products_${user.uid}`;
        const userTrxKey = `labacraft_transactions_${user.uid}`;

        const savedMats = localStorage.getItem(userMatKey);
        setMaterials(savedMats ? JSON.parse(savedMats) : []);

        const savedProds = localStorage.getItem(userProdKey);
        setProducts(savedProds ? JSON.parse(savedProds) : []);

        const savedTrx = localStorage.getItem(userTrxKey);
        setTransactions(savedTrx ? JSON.parse(savedTrx) : []);

        // Initialize Firestore store for this user if first time
        await checkAndInitializeUserData(user.uid, user.email || '', initialMaterials, initialProducts);
      } else {
        // Not signed in: check if guest mode is activated
        const isGuest = localStorage.getItem('labacraft_guest_mode') === 'true';
        if (isGuest) {
          const savedMats = localStorage.getItem('labacraft_materials_guest');
          setMaterials(savedMats ? JSON.parse(savedMats) : initialMaterials);
          const savedProds = localStorage.getItem('labacraft_products_guest');
          setProducts(savedProds ? JSON.parse(savedProds) : initialProducts);
          const savedTrx = localStorage.getItem('labacraft_transactions_guest');
          setTransactions(savedTrx ? JSON.parse(savedTrx) : initialTransactions);
        } else {
          // Clear all data when logged out so no other user's data is displayed
          setMaterials([]);
          setProducts([]);
          setTransactions([]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore sync strictly for currentUser
  useEffect(() => {
    if (!currentUser) return;

    const uid = currentUser.uid;

    const unsubMaterials = subscribeToUserMaterials(uid, (items) => {
      setMaterials(items);
      localStorage.setItem(`labacraft_materials_${uid}`, JSON.stringify(items));
    });

    const unsubProducts = subscribeToUserProducts(uid, (items) => {
      setProducts(items);
      localStorage.setItem(`labacraft_products_${uid}`, JSON.stringify(items));
    });

    const unsubTransactions = subscribeToUserTransactions(uid, (items) => {
      setTransactions(items);
      localStorage.setItem(`labacraft_transactions_${uid}`, JSON.stringify(items));
    });

    return () => {
      unsubMaterials();
      unsubProducts();
      unsubTransactions();
    };
  }, [currentUser]);

  // Handle activating guest mode
  const handleEnableGuestMode = () => {
    localStorage.setItem('labacraft_guest_mode', 'true');
    setMaterials(initialMaterials);
    setProducts(initialProducts);
    setTransactions(initialTransactions);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setTab={setTab}
        materials={materials}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenInstall={() => setIsInstallModalOpen(true)}
      />



      {/* If not logged in and not in guest mode, show Welcome & Login Banner */}
      {!currentUser && !authLoading && materials.length === 0 && (
        <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 text-center space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Selamat Datang di JualJual POS</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Untuk memastikan data stok bahan baku, resep produk, dan laba penjualan ditampilkan sesuai dengan akun Anda, silakan masuk ke akun toko Anda.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              Masuk atau Buat Akun
            </button>
            <button
              onClick={handleEnableGuestMode}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Jelajahi Mode Demo
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      {(currentUser || materials.length > 0) && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {currentTab === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              materials={materials}
              products={products}
              setTab={setTab}
            />
          )}

          {currentTab === 'pos' && (
            <POS
              products={products}
              materials={materials}
              setMaterials={setMaterials}
              transactions={transactions}
              setTransactions={setTransactions}
              onCompleteSale={(trx) => setActiveInvoiceTransaction(trx)}
              userId={currentUser?.uid}
            />
          )}

          {currentTab === 'products' && (
            <ProductManager
              products={products}
              setProducts={setProducts}
              materials={materials}
              setMaterials={setMaterials}
              userId={currentUser?.uid}
            />
          )}

          {currentTab === 'materials' && (
            <MaterialManager
              materials={materials}
              setMaterials={setMaterials}
              userId={currentUser?.uid}
            />
          )}

          {currentTab === 'reports' && (
            <ReportManager
              transactions={transactions}
              onSelectTransaction={(trx) => setActiveInvoiceTransaction(trx)}
            />
          )}
        </main>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        transaction={activeInvoiceTransaction}
        onClose={() => setActiveInvoiceTransaction(null)}
      />

      {/* Email/Password Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
      />

      {/* iOS & Phone Install Guide Modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
}
