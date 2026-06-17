/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Mail,
  Building2,
  ArrowRight,
  LogIn,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile, businessName?: string) => void;
  onToast: (msg: string, status?: 'success' | 'error') => void;
  onOpenLegal: (tab: 'terms' | 'privacy') => void;
}

export default function AuthView({ onLoginSuccess, onToast, onOpenLegal }: AuthViewProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regBusiness, setRegBusiness] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isLoadingReset, setIsLoadingReset] = useState(false);

  // --- FUNGSI LOGIN ---
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      onToast('Email dan Password wajib dilengkapi!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        onToast(data.error || 'Gagal masuk akun', 'error');
        setIsLoading(false);
        return;
      }

      // Simpan token ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onToast('Sesi Berhasil! Memuat Keuangan UMKM...', 'success');

      // Kirim data user ke App.tsx
      onLoginSuccess({
        fullName: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        avatarUrl: data.user.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd6pRN3jnPuz6h0mwwyuNny1yRd1jz-Hxy9QWzMnyO91MDkBwrV7g6T5WzOaveaRS_dxv_RoliGhLlsbozUa87SXSq7a5nvJPwuMGYoHG-BIkK_gm-MWf7iNFGTVBixp_FDvSaQvPGbV9PMGJKe6a5EzlV7Hx4_DMVZlRzQtYMt86P2J9xJDdMO_IjRiYqqcNofjaXd1wfqsJs7AuJEEmvCVAlMbenCvJiff7iCeaBd-uZWKPib6qISk_X28ZFBxHxxImcKHtlIWcI'
      }, data.businessProfile?.name);

    } catch (error) {
      onToast('Gagal terhubung ke server database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNGSI REGISTER ---
  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!regFirstName.trim() || !regBusiness.trim() || !regEmail.trim() || !regPassword.trim()) {
      onToast('Lengkapi parameter yang wajib diisi!', 'error');
      return;
    }
    if (!agreeTerms) {
      onToast('Setujui Kebijakan Syarat & Ketentuan hukum kami.', 'error');
      return;
    }

    setIsLoading(true);
    const fullName = `${regFirstName} ${regLastName}`.trim();

    try {
      const response = await fetch(`${API_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email: regEmail,
          password: regPassword,
          role: 'Admin Bisnis',
          business_name: regBusiness
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        onToast(data.error || 'Gagal mendaftar akun', 'error');
        setIsLoading(false);
        return;
      }
      onToast('Pendaftaran Berhasil! Silakan periksa email Anda untuk memverifikasi akun.', 'success');
      setTab('login');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.businessProfile) {
        localStorage.setItem('businessProfile', JSON.stringify(data.businessProfile));
      }

      onToast('Pendaftaran Berhasil! Membuka Dashboard Baru...', 'success');

      onLoginSuccess({
        fullName: data.user.full_name,
        email: data.user.email,
        role: data.user.role,
        avatarUrl: data.user.avatar_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd6pRN3jnPuz6h0mwwyuNny1yRd1jz-Hxy9QWzMnyO91MDkBwrV7g6T5WzOaveaRS_dxv_RoliGhLlsbozUa87SXSq7a5nvJPwuMGYoHG-BIkK_gm-MWf7iNFGTVBixp_FDvSaQvPGbV9PMGJKe6a5EzlV7Hx4_DMVZlRzQtYMt86P2J9xJDdMO_IjRiYqqcNofjaXd1wfqsJs7AuJEEmvCVAlMbenCvJiff7iCeaBd-uZWKPib6qISk_X28ZFBxHxxImcKHtlIWcI'
      }, data.businessProfile?.name);
    } catch (error) {
      onToast('Gagal terhubung ke server database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      onToast('Harap masukkan alamat email Anda.', 'error');
      return;
    }

    setIsLoadingReset(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/users/request-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      if (response.ok) {
        onToast('Tautan verifikasi sandi telah dikirim ke email Anda!', 'success');
        setIsForgotPasswordMode(false);
        setResetEmail('');
      } else {
        const data = await response.json();
        onToast(data.message || 'Email tidak terdaftar atau gagal mengirim tautan.', 'error');
      }
    } catch (error) {
      onToast('Gagal terhubung ke server.', 'error');
    } finally {
      setIsLoadingReset(false);
    }
  };

  const handleSocialAuth = (provider: string) => {
    onToast(`Fitur login dengan ${provider} sedang dalam tahap pengembangan.`, 'error');
  };

  return (
    <div className="max-w-[460px] w-full mx-auto space-y-6 select-none animate-in fade-in zoom-in-95 duration-200">

      <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[#c5c6cd] shadow-xl space-y-6">
        {isForgotPasswordMode ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-extrabold text-[#091426]">Pulihkan Sandi</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Masukkan email terdaftar Anda untuk menerima tautan pemulihan sandi.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">EMAIL ANDA</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] focus:border-[#091426] rounded-xl focus:outline-none"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoadingReset}
              className="w-full text-xs font-bold py-3 bg-[#091426] hover:bg-slate-800 text-[#6cf8bb] rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md cursor-pointer pt-3.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoadingReset ? 'MENGIRIM TAUTAN...' : 'KIRIM TAUTAN VERIFIKASI'}
            </button>

            <button
              type="button"
              onClick={() => setIsForgotPasswordMode(false)}
              className="w-full py-2 text-slate-500 hover:text-[#091426] text-[11px] font-bold transition-all cursor-pointer"
            >
              KEMBALI KE LOGIN
            </button>
          </form>

        ) : (
          <div className="flex border-b border-[#c5c6cd]">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer text-center ${tab === 'login'
                ? 'text-[#091426] border-[#091426]'
                : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
            >
              Masuk Akun
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 cursor-pointer text-center ${tab === 'register'
                ? 'text-[#091426] border-[#091426]'
                : 'text-slate-400 border-transparent hover:text-slate-600'
                }`}
            >
              Mulai Daftar Baru
            </button>
          </div>
        )
        }
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">EMAIL BISNIS</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="nama@perusahaan.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] focus:border-[#091426] rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">KATA SANDI</label>
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  setIsForgotPasswordMode(true);
                }}
                  className="text-[10px] text-[#00714d] hover:underline font-semibold font-sans"
                >
                  Lupa Sandi?
                </a>

              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] focus:border-[#091426] rounded-xl focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#091426] transition-colors cursor-pointer focus:outline-none"
                  tabIndex={-1}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-xs font-bold py-3 bg-[#091426] hover:bg-slate-800 text-[#6cf8bb] rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md cursor-pointer pt-3.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard Ledger'}</span>
            </button>

          </form>
        ) : (
          /* Register block form */
          <form onSubmit={handleRegister} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">NAMA DEPAN</label>
                <input
                  type="text"
                  placeholder="John"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">NAMA BELAKANG</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">NAMA BADAN BISNIS / UMKM</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="PT Maju Bersama Jaya"
                  value={regBusiness}
                  onChange={(e) => setRegBusiness(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">EMAIL AKTIF</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@perusahaan.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">BUAT SANDI KEAMANAN</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Minimal 8 Karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#091426] transition-colors cursor-pointer focus:outline-none"
                  tabIndex={-1}
                >
                  {showRegPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-4">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 rounded text-[#091426] focus:ring-[#091426] cursor-pointer"
              />
              <label htmlFor="agree-checkbox" className="text-[10px] sm:text-xs text-slate-500 leading-relaxed cursor-pointer select-none">
                Saya menyetujui{' '}
                <span onClick={() => onOpenLegal('terms')} className="text-[#00714d] font-semibold hover:underline">Syarat & Ketentuan</span>
                {' '}serta{' '}
                <span onClick={() => onOpenLegal('privacy')} className="text-[#00714d] font-semibold hover:underline">Kebijakan Privasi</span>
                {' '}data KasCuan.
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-xs font-bold py-3 bg-[#006c49] hover:bg-emerald-800 text-white rounded-xl flex items-center justify-center gap-2 active:scale-98 transition-all shadow-md cursor-pointer pt-3.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? 'Mendaftarkan Akun...' : 'Mulai Simulator'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </form>
        )}

        {/* Third Party Social Auth Section */}
        <div className="space-y-4 pt-1 border-t border-slate-100">
          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-[#c5c6cd]"></div>
            <span className="relative bg-white px-3 text-[10px] text-slate-400 font-bold font-mono uppercase tracking-widest">
              ATAU LANJUTKAN DENGAN
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialAuth('Google')}
              className="flex items-center justify-center gap-2 py-2 px-4 border border-[#c5c6cd] hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <img
                alt="Google"
                className="w-4 h-4 shrink-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCk0ce0-zhDkfKmmqRljYQuBP94JKIZr9rXJnUzYgQ7quRh0ldU_RPULesS1HdPYJoJuwaNtD6kiT28H8rVhn3ymSSNLZkks8sTUJU7ZxvI6KhUUrjPJA9e2TX4R_8DRBDRohQ4VsUKYnx2gdDvX-etxTlhjc4FxX8-H0l5a6zFncSXoVcxIN9hoqE4AC7hi7dOnirV4lkN4ZtlENzKryg_RCTRH07lRgjW15rI7ah0VJ_iIuiCUGwj0C3j6AOIAtc4Xo9sCRhdaGdw"
              />
              <span className="font-sans text-[11px] font-bold">GOOGLE</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialAuth('Microsoft Office')}
              className="flex items-center justify-center gap-2 py-2 px-4 border border-[#c5c6cd] hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <div className="w-4 h-4 bg-[#091426] flex items-center justify-center text-white text-[9px] font-black rounded-xs">
                M
              </div>
              <span className="font-sans text-[11px] font-bold">MICROSOFT</span>
            </button>
          </div>
        </div>

      </div>

      {/* Trust shield indicators badge */}
      <div className="flex items-center justify-center gap-2 text-slate-500">
        <ShieldCheck className="w-4.5 h-4.5 text-[#006c49]" />
        <span className="text-xs font-semibold">Enkripsi Kredensial & Data Standar Keamanan</span>
      </div>

    </div>
  );
}