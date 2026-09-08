import React, { useState } from 'react';
import { 
    X, 
    Mail, 
    Lock, 
    User, 
    Eye, 
    EyeOff, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    ArrowLeft,
    KeyRound,
    ShieldCheck,
    Phone,
    Calendar,
    MapPin,
    Building2,
    Globe
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { COUNTRIES } from '../lib/countries';
import LegalModal from './LegalModal';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess, company = {} }) {
    const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'
    
    // Login fields
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');

    // Forgot password field
    const [forgotEmail, setForgotEmail] = useState('');
    
    // Register fields
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    
    // Address (4 sections)
    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('Germany');
    const [postalCode, setPostalCode] = useState('');
    
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Legal modal states
    const [legalType, setLegalType] = useState(null);

    if (!isOpen) return null;

    const resetForm = () => {
        setLoginInput('');
        setPassword('');
        setForgotEmail('');
        setPasswordConfirmation('');
        setName('');
        setSurname('');
        setEmail('');
        setPhone('');
        setDateOfBirth('');
        setAddressLine('');
        setCity('');
        setCountry('Germany');
        setPostalCode('');
        setTermsAccepted(false);
        setErrorMsg('');
        setSuccessMsg('');
    };

    const handleSwitchMode = (newMode) => {
        setMode(newMode);
        setErrorMsg('');
        setSuccessMsg('');
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    email: forgotEmail,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSuccessMsg(data.message || 'Password reset link has been sent to your email.');
                setForgotEmail('');
            } else {
                setErrorMsg(data.message || 'Unable to process reset request. Please check your email.');
            }
        } catch (err) {
            setErrorMsg('Network error. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    login: loginInput,
                    password: password,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSuccessMsg(data.message || 'Login successful!');
                setTimeout(() => {
                    onClose();
                    resetForm();
                    if (onAuthSuccess) {
                        onAuthSuccess(data.user);
                    } else {
                        router.reload();
                    }
                }, 600);
            } else {
                setErrorMsg(data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Invalid credentials'));
            }
        } catch (err) {
            setErrorMsg('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters long.');
            return;
        }

        if (password !== passwordConfirmation) {
            setErrorMsg('Passwords do not match.');
            return;
        }

        if (!termsAccepted) {
            setErrorMsg('You must agree to the Terms & Conditions and Privacy Policy to register.');
            return;
        }

        if (dateOfBirth) {
            const dob = new Date(dateOfBirth);
            const now = new Date();
            const age = now.getFullYear() - dob.getFullYear();
            const m = now.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
                if (age - 1 < 18) {
                    setErrorMsg('You must be at least 18 years old to register.');
                    return;
                }
            } else if (age < 18) {
                setErrorMsg('You must be at least 18 years old to register.');
                return;
            }
        }

        setLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    name: name,
                    surname: surname,
                    email: email,
                    phone: phone,
                    date_of_birth: dateOfBirth,
                    address_line: addressLine,
                    city: city,
                    country: country,
                    postal_code: postalCode,
                    password: password,
                    terms: true,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSuccessMsg(data.message || 'Registration successful! Welcome to RoyalPlay.');
                setTimeout(() => {
                    onClose();
                    resetForm();
                    if (onAuthSuccess) {
                        onAuthSuccess(data.user);
                    } else {
                        router.reload();
                    }
                }, 700);
            } else {
                setErrorMsg(data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : 'Registration failed'));
            }
        } catch (err) {
            setErrorMsg('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
                <div className="relative w-full max-w-xl max-h-[92vh] bg-[#0c1018] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-black/80 flex flex-col my-auto overflow-hidden">
                    
                    {/* Decorative Background Glows */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={() => { onClose(); resetForm(); }}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900/80 hover:bg-slate-800 transition cursor-pointer z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Brand Logo & Header */}
                    <div className="text-center mb-4 shrink-0 flex flex-col items-center">
                        <img
                            src="/images/logo.png"
                            alt="RoyalPlay Logo"
                            className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] mb-2"
                        />
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create RoyalPlay Account' : 'Reset Password'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {mode === 'login' 
                                ? 'Enter your credentials to access your games and wallet' 
                                : mode === 'register'
                                    ? 'Fill in your details to create your secure social casino profile'
                                    : 'Enter your email to receive a secure 60-minute password reset link'}
                        </p>
                    </div>

                    {/* Mode Selector Tabs (only shown for login / register) */}
                    {mode !== 'forgot' ? (
                        <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-2xl mb-4 shrink-0">
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('login')}
                                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                                    mode === 'login'
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('register')}
                                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                                    mode === 'register'
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md font-black'
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Register
                            </button>
                        </div>
                    ) : (
                        <div className="mb-4">
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('login')}
                                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                            </button>
                        </div>
                    )}

                    {/* Status Messages */}
                    {errorMsg && (
                        <div className="mb-3 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 shrink-0">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 shrink-0">
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Scrollable Form Body */}
                    <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 text-left">
                        
                        {/* FORGOT PASSWORD FORM */}
                        {mode === 'forgot' ? (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                        Registered Email Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Sending Reset Link...</span>
                                    ) : (
                                        <>
                                            <KeyRound className="w-4 h-4" />
                                            <span>Send Reset Link</span>
                                        </>
                                    )}
                                </button>

                                <div className="pt-2 text-center text-xs text-slate-400">
                                    Remember your password?{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchMode('login')}
                                        className="text-amber-400 font-bold hover:underline cursor-pointer"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        ) : mode === 'login' ? (
                            /* LOGIN FORM */
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                                        Email / User Code / Username
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={loginInput}
                                            onChange={(e) => setLoginInput(e.target.value)}
                                            placeholder="e.g. player@example.com or user_1"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Password
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => handleSwitchMode('forgot')}
                                            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 transition underline cursor-pointer"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Signing in...</span>
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                        </>
                                    )}
                                </button>

                                <div className="pt-2 text-center text-xs text-slate-400">
                                    Don't have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchMode('register')}
                                        className="text-amber-400 font-bold hover:underline cursor-pointer"
                                    >
                                        Register Now
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* REGISTER FORM */
                            <form onSubmit={handleRegister} className="space-y-4">
                                
                                {/* Section 1: Account Credentials */}
                                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                                    <div className="text-[10px] uppercase font-black tracking-wider text-amber-400/90 flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5" />
                                        <span>Account Credentials</span>
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="yourname@domain.com"
                                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                Password (min 6) *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                    <Lock className="w-3.5 h-3.5" />
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    minLength={6}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
                                                >
                                                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                Confirm Password *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                </div>
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={passwordConfirmation}
                                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Personal Details */}
                                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                                    <div className="text-[10px] uppercase font-black tracking-wider text-amber-400/90 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Personal Information</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                First Name *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Alex"
                                                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                Surname *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                    <User className="w-3.5 h-3.5" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={surname}
                                                    onChange={(e) => setSurname(e.target.value)}
                                                    placeholder="Morgan"
                                                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                    <Phone className="w-3.5 h-3.5" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="+49 170 1234567"
                                                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                Date of Birth (18+) *
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                </div>
                                                <input
                                                    type="date"
                                                    required
                                                    value={dateOfBirth}
                                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-amber-500 transition [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 3: Residential Address (4 sections) */}
                                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                                    <div className="text-[10px] uppercase font-black tracking-wider text-amber-400/90 flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Residential Address</span>
                                    </div>

                                    {/* 1. Street, house number, apartment... */}
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                            1. Street, House Number, Apartment... *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Building2 className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={addressLine}
                                                onChange={(e) => setAddressLine(e.target.value)}
                                                placeholder="e.g. Hauptstraße 42, Apt 3B"
                                                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. City & 4. Post code */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                2. City *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="e.g. Berlin"
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                                4. Post Code (ZIP) *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                placeholder="e.g. 10115"
                                                className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-amber-500 transition font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. Country (full list excluding restricted) */}
                                    <div>
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                            3. Country *
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                                <Globe className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                required
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-amber-500 transition cursor-pointer [color-scheme:dark]"
                                            >
                                                {COUNTRIES.map((c) => (
                                                    <option key={c.code} value={c.name}>
                                                        {c.name} ({c.dial})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                </div>

                                {/* Section 4: Terms & Privacy Checkbox */}
                                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500/30 accent-amber-500"
                                        />
                                        <span className="text-[11px] text-slate-300 leading-snug">
                                            I agree to the{' '}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setLegalType('terms'); }}
                                                className="text-amber-400 font-bold hover:underline"
                                            >
                                                Terms & Conditions
                                            </button>{' '}
                                            and{' '}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setLegalType('privacy'); }}
                                                className="text-amber-400 font-bold hover:underline"
                                            >
                                                Privacy Policy
                                            </button>
                                            , and confirm I am at least 18 years old.
                                        </span>
                                    </label>
                                </div>

                                {/* Submit Register Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 mt-2"
                                >
                                    {loading ? (
                                        <span className="animate-pulse">Creating Account...</span>
                                    ) : (
                                        <>
                                            <span>Create Account</span>
                                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                                        </>
                                    )}
                                </button>

                                <div className="pt-1 text-center text-xs text-slate-400">
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchMode('login')}
                                        className="text-amber-400 font-bold hover:underline cursor-pointer"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                </div>
            </div>

            {/* Embedded Legal Modal when clicking terms/privacy links */}
            {legalType && (
                <LegalModal
                    isOpen={Boolean(legalType)}
                    type={legalType}
                    onClose={() => setLegalType(null)}
                    company={company}
                />
            )}
        </>
    );
}
