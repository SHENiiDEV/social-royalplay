import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Lock, Mail, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

export default function ResetPassword({ token, email: initialEmail = '' }) {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!email) {
            setErrorMsg('Please enter your email address.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters long.');
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMsg('Passwords do not match. Please verify your confirmation.');
            return;
        }

        setLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    token: token,
                    email: email,
                    password: password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccessMsg('Your password has been successfully reset! Redirecting to lobby...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1500);
            } else {
                setErrorMsg(data.message || 'Unable to reset password. Please request a new reset link.');
            }
        } catch (err) {
            setErrorMsg('Network error. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-black">
            <Head title="Reset Your Password — RoyalPlay Social Casino" />

            {/* Header Bar */}
            <header className="w-full border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src="/images/logo.png"
                        alt="RoyalPlay"
                        className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    />
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Casino Lobby
                </Link>
            </header>

            {/* Form Container */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
                <div className="w-full max-w-md bg-[#0e1320] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                    
                    {/* Top ambient glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center space-y-2 relative z-10">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                            <KeyRound className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            Choose New Password
                        </h1>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Create a strong, secure password for your RoyalPlay account.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="p-3.5 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        {/* Email field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                            />
                        </div>

                        {/* New Password field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-400" /> New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-3 pr-11 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-400" /> Confirm Password
                            </label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="Re-enter your new password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    <span>UPDATE PASSWORD</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-slate-800/80">
                        <Link
                            href="/"
                            className="text-xs font-bold text-slate-400 hover:text-amber-400 transition"
                        >
                            Remember your password? <span className="text-amber-400 underline">Sign In</span>
                        </Link>
                    </div>

                </div>
            </main>

            {/* Simple Footer */}
            <footer className="text-center py-6 text-[11px] text-slate-600 border-t border-slate-900">
                © {new Date().getFullYear()} RoyalPlay Entertainment N.V. • 18+ Only
            </footer>
        </div>
    );
}
