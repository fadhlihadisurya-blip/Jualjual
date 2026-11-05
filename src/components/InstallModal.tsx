import React, { useState } from 'react';
import { Smartphone, Share, PlusSquare, CheckCircle2, X, Globe, Download, Laptop, Apple } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android' | 'desktop'>('ios');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl cursor-default overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Jadikan Aplikasi di iOS & HP</h3>
              <p className="text-xs text-slate-500">Pasang tanpa install dari App Store (PWA Standalone)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Device Switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Apple className="h-4 w-4" />
            <span>iPhone / iPad (iOS)</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'desktop' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Laptop / PC</span>
          </button>
        </div>

        {/* Content for iOS */}
        {activeTab === 'ios' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-amber-50/70 p-4 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
              <strong>Penting:</strong> Pastikan Anda membuka link web ini menggunakan browser bawaan <strong>Safari</strong> di iPhone atau iPad Anda.
            </div>

            <ol className="space-y-3.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  1
                </span>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-900">Buka di Browser Safari</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Akses link web ini dari browser Safari iPhone/iPad Anda.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  2
                </span>
                <div className="pt-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>Tekan Tombol Share</span>
                    <Share className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Ikon kotak dengan tanda panah ke atas di bilah menu bagian bawah layar Safari.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  3
                </span>
                <div className="pt-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>Pilih &ldquo;Add to Home Screen&rdquo;</span>
                    <PlusSquare className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Geser menu pilihan ke bawah lalu tap opsi <em>Tambah ke Layar Utama</em> (Add to Home Screen).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  4
                </span>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-900">Tekan &ldquo;Add&rdquo; (Tambah)</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Ikon aplikasi <strong>JualJual</strong> dengan logo Paradise akan muncul di Home Screen iPhone Anda dan terbuka layar penuh tanpa bar browser!
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Content for Android */}
        {activeTab === 'android' && (
          <div className="space-y-4">
            <ol className="space-y-3.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  1
                </span>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-900">Buka di Google Chrome</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Akses web ini melalui Chrome di HP Android.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  2
                </span>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-900">Tekan Menu Titik Tiga (⋮)</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Pilih tombol menu di sudut kanan atas Chrome.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  3
                </span>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-900">Pilih &ldquo;Install App&rdquo; / &ldquo;Tambahkan ke Layar Utama&rdquo;</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Aplikasi akan terpasang di laci aplikasi HP Anda seperti aplikasi APK asli.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Content for Desktop */}
        {activeTab === 'desktop' && (
          <div className="space-y-4">
            <ol className="space-y-3.5 text-xs text-slate-700 font-medium">
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  1
                </span>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-900">Buka di Chrome atau Microsoft Edge</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Gunakan browser desktop modern.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  2
                </span>
                <div className="pt-0.5">
                  <p className="font-bold text-slate-900">Klik Ikon &ldquo;Install JualJual&rdquo; di Address Bar</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Ikon monitor kecil dengan tanda panah bawah di sebelah kanan bilah URL.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-all cursor-pointer"
          >
            Mengerti, Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
