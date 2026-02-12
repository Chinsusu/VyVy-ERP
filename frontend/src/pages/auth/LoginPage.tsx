import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { LANGUAGES } from '../../lib/i18n';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);
    const { t, i18n } = useTranslation('login');

    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
    const nextLang = LANGUAGES.find(l => l.code !== i18n.language) || LANGUAGES[1];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authApi.login({ email, password });
            setAuth(response.user, response.access_token, response.refresh_token);
            navigate('/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.error?.message || 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center gradient-mesh px-4">
            {/* Decorative orbs */}
            <div className="fixed top-1/4 left-1/4 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
            <div className="fixed bottom-1/4 right-1/4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Language toggle */}
            <button
                onClick={() => i18n.changeLanguage(nextLang.code)}
                className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-md rounded-lg shadow-sm text-sm text-slate-600 hover:bg-white transition-colors z-50"
                title={`Switch to ${nextLang.label}`}
            >
                <Globe className="w-4 h-4" />
                {currentLang.flag} {currentLang.label}
            </button>

            <div className="w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary shadow-lg shadow-violet-500/25 mb-4">
                        <span className="text-white text-2xl font-bold">V</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('brandName')}</h1>
                    <p className="mt-1 text-sm text-slate-500 font-medium">{t('brandSubtitle')}</p>
                </div>

                {/* Card */}
                <div className="glass rounded-2xl p-8 shadow-xl">
                    <h2 className="text-lg font-semibold text-slate-800 mb-6">{t('title')}</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="label">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    className="input pl-10"
                                    placeholder={t('emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="label">{t('password')}</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="input pl-10 pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm animate-slide-up">
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary btn-lg w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {t('signingIn')}
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    {t('signIn')}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Test credentials */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-xs text-slate-400 text-center mb-1.5">{t('demoCredentials')}</p>
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <code className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-mono">admin@vyvy.com</code>
                            <span className="text-slate-300">/</span>
                            <code className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs font-mono">password123</code>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    {t('version')}
                </p>
            </div>
        </div>
    );
}
