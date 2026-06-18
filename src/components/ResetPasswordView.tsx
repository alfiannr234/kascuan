import { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';

interface ResetPasswordViewProps {
    onGoToLogin: () => void;
    onToast: (message: string, status?: 'success' | 'error') => void;
}

export default function ResetPasswordView({ onGoToLogin, onToast }: ResetPasswordViewProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            return onToast('Kata sandi minimal 6 karakter', 'error');
        }
        if (password !== confirmPassword) {
            return onToast('Kata sandi tidak cocok!', 'error');
        }

        // Ambil token dari URL Browser
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (!token) {
            return onToast('Token tidak ditemukan di URL. Silakan klik ulang link dari email.', 'error');
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/api/users/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });

            if (response.ok) {
                setIsSuccess(true);
                onToast('Kata sandi berhasil diperbarui!', 'success');
            } else {
                const data = await response.json();
                onToast(data.error || 'Tautan kedaluwarsa atau tidak valid.', 'error');
            }
        } catch (error) {
            onToast('Terjadi kesalahan saat menghubungi server.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 text-[#006c49] rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-extrabold text-[#091426] mb-2">Sandi Diperbarui!</h2>
                <p className="text-slate-500 mb-8 text-sm">
                    Kata sandi akun KasCuan Anda telah berhasil diubah. Silakan masuk menggunakan kata sandi yang baru.
                </p>
                <button
                    onClick={onGoToLogin}
                    className="w-full py-3.5 bg-[#091426] hover:bg-slate-800 text-[#6cf8bb] font-bold rounded-xl transition-all"
                >
                    Kembali ke Halaman Masuk
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-[#091426] mb-2">Buat Sandi Baru</h2>
                <p className="text-slate-500 text-sm">Masukkan kata sandi baru untuk akun Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Sandi Baru</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#091426] focus:ring-1 focus:ring-[#091426] outline-none transition-all text-sm"
                            placeholder="Minimal 6 karakter"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Konfirmasi Sandi Baru</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#091426] focus:ring-1 focus:ring-[#091426] outline-none transition-all text-sm"
                            placeholder="Ketik ulang sandi baru"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 mt-2 bg-[#091426] hover:bg-slate-800 disabled:bg-slate-400 text-[#6cf8bb] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Sandi Baru'}
                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
            </form>
        </div>
    );
}