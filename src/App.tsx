/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle,
  AlertCircle,
  Menu,
  Sparkles,
  Info
} from 'lucide-react';

import { ActiveTab, Transaction, BusinessProfile, UserProfile, Preferences } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import TransactionModal from './components/TransactionModal';
import HelpCenter from './components/HelpCenter';
import Terms from './components/Terms';
import Privacy from './components/Privacy';
import ResetPasswordView from './components/ResetPasswordView';

import {
  INITIAL_BUSINESS_PROFILE,
  INITIAL_PREFERENCES,
  INITIAL_TRANSACTIONS
} from './data/initialData';

export default function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  // 1. Core Authentication & Mode States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token') || localStorage.getItem('isDemoMode') === 'true';
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('isDemoMode') === 'true';
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    if (window.location.pathname === '/reset-password') {
      return 'reset-password';
    }
    return (localStorage.getItem('token') || localStorage.getItem('isDemoMode') === 'true') ? 'dashboard' : 'landing';
  });

  // 2. Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      return {
        fullName: parsed.full_name || parsed.fullName,
        email: parsed.email,
        role: parsed.role,
        avatarUrl: parsed.avatar_url || parsed.avatarUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBd6pRN3jnPuz6h0mwwyuNny1yRd1jz-Hxy9QWzMnyO91MDkBwrV7g6T5WzOaveaRS_dxv_RoliGhLlsbozUa87SXSq7a5nvJPwuMGYoHG-BIkK_gm-MWf7iNFGTVBixp_FDvSaQvPGbV9PMGJKe6a5EzlV7Hx4_DMVZlRzQtYMt86P2J9xJDdMO_IjRiYqqcNofjaXd1wfqsJs7AuJEEmvCVAlMbenCvJiff7iCeaBd-uZWKPib6qISk_X28ZFBxHxxImcKHtlIWcI'
      };
    }
    // Jika demo mode, tampilkan profil demo
    if (localStorage.getItem('isDemoMode') === 'true') {
      return { fullName: 'Pengguna Demo', email: 'demo@kascuan.com', role: 'Admin (Simulasi)', avatarUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' };
    }
    return { fullName: 'Tamu', email: '', role: 'Pengunjung', avatarUrl: '' };
  });

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem('equicount_profile');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_PROFILE;
  });

  const [preferences, setPreferences] = useState<Preferences>(() => {
    const saved = localStorage.getItem('equicount_preferences');
    return saved ? JSON.parse(saved) : INITIAL_PREFERENCES;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');

  interface Toast {
    id: number;
    message: string;
    status: 'success' | 'error';
  }
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dispatchToast = (message: string, status: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, status }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // --- MENGAMBIL DATA (DARI DATABASE ATAU MOCK DATA) ---
  useEffect(() => {
    const fetchData = async () => {
      if (isDemoMode) {
        setTransactions(INITIAL_TRANSACTIONS);
        setBusinessProfile({
          ...INITIAL_BUSINESS_PROFILE,
          name: 'Toko KasCuan (Mode Demo)',
          type: 'Teknologi & Agensi Digital'
        });
        return;
      }

      // JIKA BUKAN DEMO: Lakukan Fetch ke API Asli
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) return;
      const user = JSON.parse(userStr);

      try {
        const txResponse = await fetch(`${API_URL}/api/transactions/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (txResponse.ok) {
          const txData = await txResponse.json();
          const mappedData = txData.map((tx: any) => ({
            ...tx,
            date: tx.date.split('T')[0]
          }));
          setTransactions(mappedData);
        }

        const settingsResponse = await fetch(`${API_URL}/api/setting`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();

          if (settingsData.businessProfile) {
            setBusinessProfile(settingsData.businessProfile);
            localStorage.setItem('equicount_profile', JSON.stringify(settingsData.businessProfile));
          }
          if (settingsData.userProfile) {
            setUserProfile(prev => ({ ...prev, ...settingsData.userProfile }));
          }
        }
      } catch (error) {
        console.error("Gagal menarik data dari server:", error);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      setTransactions([]);
      setBusinessProfile(INITIAL_BUSINESS_PROFILE);
    }
  }, [isAuthenticated, isDemoMode, API_URL]);

  const handleSaveTransaction = async (txData: Omit<Transaction, 'id'> & { id?: string }) => {
    // INTERCEPT JIKA MODE DEMO
    if (isDemoMode) {
      if (txData.id) {
        setTransactions(prev => prev.map(t => t.id === txData.id ? { ...t, ...txData } as Transaction : t));
        dispatchToast('Koreksi log disimpan secara lokal (Mode Demo).', 'success');
      } else {
        const newTx = { ...txData, id: `demo-new-${Date.now()}` } as Transaction;
        setTransactions(prev => [newTx, ...prev]);
        dispatchToast('Catatan log ditambahkan secara lokal (Mode Demo).', 'success');
      }
      setEditingTransaction(null);
      setIsAddTxModalOpen(false);
      return;
    }

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      dispatchToast('Akses ditolak. Silakan login kembali.', 'error');
      return;
    }
    const user = JSON.parse(userStr);

    try {
      if (txData.id) {
        const response = await fetch(`${API_URL}/api/transactions/${txData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(txData)
        });

        if (response.ok) {
          setTransactions(prev => prev.map(t => t.id === txData.id ? { ...t, ...txData } as Transaction : t));
          dispatchToast('Koreksi log transaksi berhasil disimpan!', 'success');
        } else {
          dispatchToast('Gagal memperbarui transaksi di server.', 'error');
        }
      } else {
        const payload = { ...txData, user_id: user.id };

        const response = await fetch(`${API_URL}/api/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const newTx = await response.json();
          setTransactions(prev => [newTx, ...prev]);
          dispatchToast('Catatan log transaksi berhasil ditambahkan ke jurnal!', 'success');
        } else {
          dispatchToast('Gagal menyimpan transaksi ke server.', 'error');
        }
      }
      setEditingTransaction(null);
      setIsAddTxModalOpen(false);
    } catch (error) {
      dispatchToast('Terjadi kesalahan pada server.', 'error');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan log transaksi ini dari pembukuan?')) return;

    // INTERCEPT JIKA MODE DEMO
    if (isDemoMode) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      dispatchToast('Catatan log terhapus secara lokal (Mode Demo).', 'success');
      return;
    }

    // LOGIKA DATABASE
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        dispatchToast('Catatan log berhasil terhapus dari ledger.', 'success');
      } else {
        dispatchToast('Gagal menghapus data dari server.', 'error');
      }
    } catch (error) {
      dispatchToast('Terjadi kesalahan pada server.', 'error');
    }
  };

  const handleEditInit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsAddTxModalOpen(true);
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = () => {
    if (confirm('Selesaikan sesi pembukuan dan keluar ke landing page?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isDemoMode'); // Bersihkan status demo

      setIsAuthenticated(false);
      setIsDemoMode(false);
      setActiveTab('landing');
      dispatchToast('Sesi ditutup secara aman.', 'success');
    }
  };

  const handleLoginSuccess = (user: UserProfile, bizName?: string) => {
    setIsDemoMode(false); // Pastikan mode demo mati jika login asli
    localStorage.removeItem('isDemoMode');
    setUserProfile(user);
    setIsAuthenticated(true);
    if (bizName) {
      setBusinessProfile(prev => ({ ...prev, name: bizName }));
    }
    setActiveTab('dashboard');
  };

  // --- MASUK KE MODE DEMO (DIPICU DARI LANDING PAGE) ---
  const handleEnterDemo = () => {
    setIsDemoMode(true);
    localStorage.setItem('isDemoMode', 'true');
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    setUserProfile({
      fullName: 'Pengguna Demo',
      email: 'demo@kascuan.com',
      role: 'Admin (Simulasi)',
      avatarUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
    });
    dispatchToast('Berhasil masuk ke Lingkungan Simulasi (Demo)! Semua perubahan bersifat sementara.', 'success');
  };

  const handleGoToAuthRegister = () => {
    setActiveTab('auth');
  };

  // 5. Shell view rendering router switcher
  const renderTabContent = () => {
    switch (activeTab) {
      case 'landing':
        return (
          <LandingPage
            onJoinDemo={handleEnterDemo}
            onGoToAuth={handleGoToAuthRegister}
            onOpenLegal={(tab) => setActiveTab(tab)}
          />
        );

      case 'dashboard':
      case 'income':
      case 'expenses':
        return (
          <DashboardView
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditInit}
            onOpenAddTransaction={() => setIsAddTxModalOpen(true)}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            activeFilterType={activeTab === 'dashboard' ? 'all' : activeTab === 'income' ? 'income' : 'expense'}
            onToast={dispatchToast}
          />
        );

      case 'reports':
        return (
          <ReportsView
            transactions={transactions}
            onToast={dispatchToast}
          />
        );

      case 'settings':
        return (
          <SettingsView
            businessProfile={businessProfile}
            setBusinessProfile={setBusinessProfile}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            preferences={preferences}
            setPreferences={setPreferences}
            onToast={dispatchToast}
          />
        );

      case 'auth':
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4 py-8">
            <AuthView
              onLoginSuccess={handleLoginSuccess}
              onToast={dispatchToast}
              onOpenLegal={(tab) => setActiveTab(tab)}
            />
          </div>
        );
      case 'help':
        return <HelpCenter />;
      case 'terms':
        return (
          <div className="max-w-4xl mx-auto py-8">
            <Terms />
          </div>
        );
      case 'privacy':
        return (
          <div className="max-w-4xl mx-auto py-8">
            <Privacy />
          </div>
        );
      case 'reset-password':
        return (
          <div className="flex items-center justify-center min-h-[calc(100vh-160px)] px-4 py-8">
            <ResetPasswordView
              onToast={dispatchToast}
              onGoToLogin={() => {
                window.history.replaceState({}, document.title, "/");
                setActiveTab('auth');
              }}
            />
          </div>
        );
      default:
        return <div className="text-center p-12 font-bold">Laman tidak ditemukan.</div>;
    }
  };

  const isMainShellTab = activeTab !== 'landing' && activeTab !== 'auth';

  return (
    <div className="bg-[#f8f9ff] min-h-screen text-[#0b1c30] select-none font-sans antialiased">
      {/* 1. Shell Sidebar & Main Contents Container */}
      {isMainShellTab && isAuthenticated ? (
        <div className="flex h-screen overflow-hidden">
          {/* Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenAddTransaction={() => {
              setEditingTransaction(null);
              setIsAddTxModalOpen(true);
            }}
            isOpenMobile={isMobileSidebarOpen}
            setIsOpenMobile={setIsMobileSidebarOpen}
            onLogout={handleLogout}
            isAuthenticated={isAuthenticated}
          />

          {/* Core Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#f8f9ff] overflow-y-auto">
            {/* Top sticky app header */}
            <Header
              onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
              user={userProfile}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onLogout={handleLogout}
              isAuthenticated={isAuthenticated}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {/* Layout Canvas Body */}
            <main className="flex-1 px-6 py-6 w-full pb-16">
              {renderTabContent()}
            </main>
          </div>
        </div>
      ) : (
        /* Native full width without sidebar wrapper (Landing & Auth layouts) */
        <div className="min-h-screen flex flex-col">
          {/* Suppressed header with brand back link */}
          <header className="sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4 bg-white/80 backdrop-blur-md border-b border-[#c5c6cd]">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => setActiveTab('landing')}
              id="landing-logo-home-link"
            >
              <div className="w-8 h-8 bg-[#091426] flex items-center justify-center rounded-lg text-white">
                <span className="font-bold text-xs">KC</span>
              </div>
              <span className="font-sans text-sm font-extrabold text-[#0b1c30]">KasCuan</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-400 hidden sm:inline">Pencatatan Presisi untuk Keamanan Finansial</span>
              {activeTab === 'landing' ? (
                <button
                  onClick={() => setActiveTab('auth')}
                  className="px-4 py-2 bg-[#091426] hover:bg-slate-800 text-[#6cf8bb] rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Coba Sekarang
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('landing')}
                  className="px-4 py-2 border border-[#c5c6cd] hover:bg-slate-50 text-[#091426] rounded-xl transition-colors cursor-pointer"
                >
                  Kembali ke Landing
                </button>
              )}
            </div>
          </header>

          <main className="flex-grow">
            {renderTabContent()}
          </main>
        </div>
      )}

      {/* 2. Interactive Dialog Form Modal */}
      {isAddTxModalOpen && (
        <TransactionModal
          isOpen={isAddTxModalOpen}
          onClose={() => {
            setIsAddTxModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          editingTransaction={editingTransaction}
        />
      )}

      {/* 3. Global Toasts Dispatch Notifications Container */}
      <div
        className="fixed bottom-6 right-6 z-[100] max-w-sm w-full space-y-2 pointer-events-none"
        id="global-toasts-container"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 pointer-events-auto shadow-lg bg-white/95 backdrop-blur-xs ${toast.status === 'success'
                ? 'border-[#6cf8bb]/60 shadow-[#6cf8bb]/10 text-slate-800'
                : 'border-red-200 text-[#ba1a1a]'
                }`}
            >
              {toast.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-[#006c49] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight font-sans">
                  {toast.status === 'success' ? 'Informasi Berhasil' : 'Pemberitahuan Sistem'}
                </p>
                <p className="text-[11px] text-[#45474c] mt-0.5 leading-relaxed font-sans">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}