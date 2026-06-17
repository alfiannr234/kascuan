/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import {
  Building2,
  User,
  Bell,
  MapPin,
  Phone,
  RefreshCw,
  CheckCircle,
  Fingerprint,
  Briefcase
} from 'lucide-react';
import { BusinessProfile, UserProfile, Preferences } from '../types';

interface SettingsViewProps {
  businessProfile: BusinessProfile;
  setBusinessProfile: (profile: BusinessProfile) => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  onToast: (msg: string, status?: 'success' | 'error') => void;
}

export default function SettingsView({
  businessProfile,
  setBusinessProfile,
  userProfile,
  setUserProfile,
  preferences,
  setPreferences,
  onToast
}: SettingsViewProps) {
  // Gunakan variabel dinamis Vite, bukan hardcoded localhost
  const API_URL = import.meta.env.VITE_API_URL;

  const [bizName, setBizName] = useState(businessProfile.name);
  const [bizType, setBizType] = useState(businessProfile.type);
  const [bizAddress, setBizAddress] = useState(businessProfile.address);
  const [bizPhone, setBizPhone] = useState(businessProfile.phone);
  const [bizLogo, setBizLogo] = useState(businessProfile.logoUrl);

  const [userName, setUserName] = useState(userProfile.fullName);
  const [userEmail, setUserEmail] = useState(userProfile.email);

  const [hasEmailNotif, setHasEmailNotif] = useState(preferences.emailNotification);
  const [hasWeeklyReport, setHasWeeklyReport] = useState(preferences.weeklyReport);
  const [hasTwoFactor, setHasTwoFactor] = useState(preferences.twoFactorAuth);

  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveAll = async () => {
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');

      const payload = {
        businessProfile: {
          name: bizName,
          type: bizType,
          address: bizAddress,
          phone: bizPhone,
          logoUrl: bizLogo
        },
        userProfile: {
          fullName: userName,
          email: userEmail
        },
        preferences: {
          emailNotification: hasEmailNotif,
          weeklyReport: hasWeeklyReport,
          twoFactorAuth: hasTwoFactor
        }
      };

      // Perbaikan 1: Menggunakan API_URL
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data ke server');
      }

      setBusinessProfile(payload.businessProfile);
      setUserProfile({ ...userProfile, ...payload.userProfile });
      setPreferences(payload.preferences);

      onToast('Pengaturan Profil & Bisnis berhasil diperbarui ke Database!', 'success');

    } catch (error: any) {
      console.error('Error saving settings:', error);
      onToast(error.message || 'Terjadi kesalahan jaringan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setBizName(businessProfile.name);
    setBizType(businessProfile.type);
    setBizAddress(businessProfile.address);
    setBizPhone(businessProfile.phone);
    setBizLogo(businessProfile.logoUrl);
    setUserName(userProfile.fullName);
    setUserEmail(userProfile.email);
    setHasEmailNotif(preferences.emailNotification);
    setHasWeeklyReport(preferences.weeklyReport);
    setHasTwoFactor(preferences.twoFactorAuth);
    onToast('Perubahan dibatalkan.', 'error');
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onToast('Ukuran file maksimal 2MB', 'error');
      return;
    }

    onToast('Sedang mengunggah logo...', 'success');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', file);

      // Perbaikan 2: Menggunakan API_URL
      const response = await fetch(`${API_URL}/api/upload-logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Gagal mengunggah logo ke server.');
      }

      const data = await response.json();

      if (data.logoUrl) {
        setBizLogo(data.logoUrl);
        onToast('Logo berhasil diunggah! Jangan lupa klik Simpan Perubahan.', 'success');
      } else {
        throw new Error('Format balasan server tidak sesuai.');
      }

    } catch (error: any) {
      console.error('Error uploading logo:', error);
      onToast(error.message || 'Terjadi kesalahan saat mengunggah.', 'error');
    }
  };

  const handleLogoRemove = () => {
    setBizLogo('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
    onToast('Logo bisnis dihapus.', 'success');
  };

  const handleRequestPasswordReset = async () => {
    onToast('Memproses pengiriman email aman...', 'success');
    try {
      // Perbaikan 3: Sintaks URL diperbaiki dari "http:/api..." menjadi dinamis
      const response = await fetch(`${API_URL}/api/users/request-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      const data = await response.json();

      if (response.ok) {
        onToast('Tautan pengubah sandi aman dikirim ke email Anda!', 'success');
      } else {
        onToast(data.error, 'error');
      }
    } catch (err) {
      onToast('Gagal terhubung ke server', 'error');
    }
  };

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-200">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <section className="bg-white border border-[#c5c6cd] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 bg-[#e5eeff] text-[#091426] rounded-xl">
                <Building2 className="w-5 h-5 shrink-0" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#0b1c30]">Profil Perusahaan</h3>
                <p className="text-[10px] text-slate-500 font-mono tracking-wide uppercase mt-0.5">BUSINESS DATA SHEET</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-[#c5c6cd]">
              <img
                src={bizLogo}
                alt="Business Logo"
                className="w-20 h-20 rounded-xl bg-white border border-slate-200 object-contain p-2 shrink-0 shadow-xs"
              />
              <div className="text-center sm:text-left space-y-2">
                <p className="font-bold text-xs text-[#0b1c30]">Logo Perusahaan</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#006c49] hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-sm"
                  >
                    Ganti Logo
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/png, image/jpeg"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleLogoRemove}
                    className="px-4 py-2 border border-[#c5c6cd] text-[#45474c] hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Batas ukuran 2MB (JPG, PNG). Resolusi disarankan 512×512 px.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">NAMA BISNIS / TOKO</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:border-[#091426] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">JENIS SEKTOR USAHA</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:border-[#091426] focus:outline-none cursor-pointer"
                  >
                    <option value="Ritel & Perdagangan">Ritel &amp; Perdagangan mandiri</option>
                    <option value="Jasa Profesional">Jasa Profesional / Konsultan</option>
                    <option value="Manufaktur">Manufaktur &amp; Kerajinan</option>
                    <option value="Teknologi">Teknologi &amp; Agensi Digital</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">ALAMAT LEGAL BISNIS</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  rows={3}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:border-[#091426] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">NOMOR TELEPON AKTIF</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:border-[#091426] focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-white border border-[#c5c6cd] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-[#e5eeff] text-[#091426] rounded-xl">
                <User className="w-4 h-4 shrink-0" />
              </div>
              <h4 className="font-bold text-xs text-[#0b1c30]">Profil Admin Utama</h4>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">NAMA LENGKAP</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:outline-none focus:border-[#091426]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase font-mono">EMAIL AKTIF PERUSAHAAN</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-[#c5c6cd] rounded-xl focus:outline-none focus:border-[#091426]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRequestPasswordReset}
                  className="w-full py-2.5 border border-[#c5c6cd] hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer">
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>Ubah Sandi Keamanan</span>
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-[#c5c6cd] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-[#e5eeff] text-[#091426] rounded-xl">
                <Bell className="w-4 h-4 shrink-0" />
              </div>
              <h4 className="font-bold text-xs text-[#0b1c30]">Preferensi Laporan</h4>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-[#0b1c30]">Notifikasi Email</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Info transaksi masuk / keluar</p>
                </div>
                <label className="relative inline-block w-10 h-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasEmailNotif}
                    onChange={(e) => setHasEmailNotif(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-[#c5c6cd] rounded-full peer-checked:bg-[#006c49] transition-colors duration-200"></div>
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform duration-200 peer-checked:translate-x-5" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-[#0b1c30]">Laporan Mingguan</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Arsip PDF otomatis tiap Senin</p>
                </div>
                <label className="relative inline-block w-10 h-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasWeeklyReport}
                    onChange={(e) => setHasWeeklyReport(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-[#c5c6cd] rounded-full peer-checked:bg-[#006c49] transition-colors duration-200"></div>
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform duration-200 peer-checked:translate-x-5" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-xs text-[#0b1c30]">Verifikasi 2FA</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Gunakan enkripsi autentikasi</p>
                </div>
                <label className="relative inline-block w-10 h-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasTwoFactor}
                    onChange={(e) => setHasTwoFactor(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-[#c5c6cd] rounded-full peer-checked:bg-[#006c49] transition-colors duration-200"></div>
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute left-0.5 top-0.5 transition-transform duration-200 peer-checked:translate-x-5" />
                </label>
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="p-4 bg-[#f8f9ff] border border-[#c5c6cd] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 leading-relaxed font-sans text-center sm:text-left">
          Terakhir diatur oleh Anda pada (Admin Warung) <span className="font-semibold"></span>.
        </p>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleReset}
            className="flex-1 sm:flex-none px-6 py-2.5 border border-[#c5c6cd] hover:bg-slate-50 text-xs font-bold text-[#45474c] rounded-xl transition-all cursor-pointer"
          >
            Batalkan
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-[#091426] hover:bg-slate-800 text-[#6cf8bb] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}