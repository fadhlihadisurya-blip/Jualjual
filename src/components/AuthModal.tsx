import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { auth } from '../firebase';
import { saveUserProfile } from '../services/firestoreService';
import { Lock, Mail, LogIn, UserPlus, LogOut, X, AlertCircle, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (isRegister && password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await saveUserProfile(cred.user.uid, cred.user.email || email.trim());
        setSuccessMessage('Akun berhasil didaftarkan! Data Anda kini tersimpan aman di Firestore.');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setSuccessMessage('Berhasil masuk! Menyinkronkan data toko Anda...');
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Email/Password provider belum aktif di Firebase Console. Silakan buka Firebase Console -> Authentication -> Sign-in method -> aktifkan "Email/Password".'
        );
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('Email ini sudah terdaftar. Silakan pilih "Masuk ke Akun".');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('Format alamat email tidak valid.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('Email atau password salah. Silakan coba lagi.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('Password terlalu lemah. Gunakan minimal 6 karakter.');
      } else {
        setErrorMessage(err.message || 'Terjadi kesalahan autentikasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSuccessMessage('Berhasil keluar dari akun.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Gagal keluar: ' + err.message);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 md:p-8 shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {currentUser ? 'Akun Pengguna' : isRegister ? 'Daftar Akun Baru' : 'Masuk ke Akun'}
              </h3>
              <p className="text-xs text-slate-500">Sign-in Email & Password</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {currentUser ? (
          /* Profile & Logout View */
          <div className="space-y-5">
            <div className="rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Akun Aktif</span>
              <p className="text-base font-extrabold text-slate-900 mt-1">{currentUser.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3 text-sm font-bold text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Keluar (Sign Out)
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="rounded-2xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Alamat Email
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Ulangi Kata Sandi
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 bg-slate-50 focus-within:border-indigo-500 focus-within:bg-white transition-all">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Ketik ulang password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : isRegister ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Daftar Akun Baru
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Masuk Sekarang
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                {isRegister
                  ? 'Sudah punya akun? Masuk di sini'
                  : 'Belum punya akun? Daftar gratis di sini'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
