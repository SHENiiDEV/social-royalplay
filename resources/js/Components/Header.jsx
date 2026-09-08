import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { formatEuro } from '../lib/utils';
import {
    Crown,
    Sparkles,
    Plus,
    Flame,
    Gift,
    Shield,
    ShieldAlert,
    Users,
    ChevronDown,
    LogOut,
    UserPlus,
    LayoutDashboard,
    Compass,
    LogIn,
    KeyRound
} from 'lucide-react';

export default function Header({
    user,
    jackpot,
    onOpenStore,
    onOpenWheel,
    onOpenVip,
    onOpenAuth,
}) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [jackpotAmount, setJackpotAmount] = useState(() => Number(jackpot?.current_pool) || 54890.45);
    const [liveBalance, setLiveBalance] = useState(() => Number(user?.game_balance) || 0);

    useEffect(() => {
        if (user?.game_balance !== undefined) {
            setLiveBalance(Number(user.game_balance));
        }
    }, [user?.game_balance]);

    // Live balance polling
    useEffect(() => {
        if (!user) return;
        const fetchBalance = async () => {
            try {
                const res = await fetch('/api/user/balance');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.balance !== undefined) {
                        setLiveBalance(Number(data.balance));
                    }
                }
            } catch (e) {}
        };

        const interval = setInterval(fetchBalance, 3000);
        window.addEventListener('focus', fetchBalance);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', fetchBalance);
        };
    }, [user?.id]);

    // Subtle realistic jackpot ticker increment
    useEffect(() => {
        const interval = setInterval(() => {
            setJackpotAmount(prev => Number((Number(prev || 54890.45) + 0.05 + Math.random() * 0.15).toFixed(2)));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            setDropdownOpen(false);
            window.location.href = '/';
        } catch(e) {
            window.location.href = '/';
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-b border-slate-800/90 shadow-2xl transition-all">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-2 md:gap-4">
                
                {/* Logo & Brand */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center group py-1" title="RoyalPlay Social Casino">
                        <img
                            src="/images/logo.png"
                            alt="RoyalPlay Social Casino"
                            className="h-12 sm:h-14 md:h-16 w-auto object-contain drop-shadow-[0_0_16px_rgba(245,158,11,0.45)] group-hover:scale-105 transition-transform duration-300"
                        />
                    </Link>

                    {/* Header Jackpot Pill */}
                    <div className="hidden xl:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black/60 border border-amber-500/40 shadow-inner">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <div className="text-[9px] uppercase font-extrabold tracking-wider text-amber-400/90 leading-none">
                                Grand Jackpot
                            </div>
                            <div className="text-xs font-mono font-black text-amber-300">
                                {formatEuro(jackpotAmount)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Center Quick Bonus Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Wheel of Fortune Button */}
                    <button
                        onClick={onOpenWheel}
                        className={`px-3 py-1.5 md:py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 border transition-all cursor-pointer ${
                            user?.can_spin_wheel
                                ? 'bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 border-pink-400/60 text-white shadow-lg shadow-fuchsia-500/30 animate-pulse hover:scale-105'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                        <span className="text-sm">🎡</span>
                        <span className="hidden sm:inline">Daily Wheel</span>
                        {user?.can_spin_wheel && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        )}
                    </button>

                    {/* Free Daily 1.00 SC */}
                    <button
                        onClick={onOpenStore}
                        className={`px-3 py-1.5 md:py-2 rounded-xl text-xs font-black tracking-wide flex items-center gap-1.5 border transition-all cursor-pointer ${
                            user?.can_claim_daily_bonus
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-400/60 text-white shadow-lg shadow-emerald-500/30 hover:scale-105'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                    >
                        <Gift className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Free 1.00 SC</span>
                    </button>
                </div>

                {/* Right Wallet & Profile Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {user ? (
                        <>
                            {/* User Balance Wallet Box */}
                            <div className="flex items-center bg-[#111622] border border-amber-500/40 rounded-2xl p-1 shadow-md">
                                <div className="px-3 py-1 text-right">
                                    <div className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                                        Wallet
                                    </div>
                                    <div className="text-sm md:text-base font-mono font-black text-amber-400 leading-tight">
                                        {formatEuro(liveBalance)}
                                    </div>
                                </div>

                                <button
                                    onClick={onOpenStore}
                                    title="Top up coins"
                                    className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black flex items-center justify-center font-black shadow-lg shadow-amber-500/30 active:scale-95 transition cursor-pointer"
                                >
                                    <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[3]" />
                                </button>
                            </div>

                            {/* VIP Rank Pill */}
                            <button
                                onClick={onOpenVip}
                                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-xs text-slate-300 transition cursor-pointer"
                            >
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                                <span className="font-bold">VIP {user?.vip_level || 1}</span>
                            </button>

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2 p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition cursor-pointer"
                                >
                                    <img
                                        src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Player'}`}
                                        alt="User Avatar"
                                        className="w-8 h-8 rounded-xl object-cover border border-slate-700 bg-slate-800"
                                    />
                                    <div className="hidden md:flex flex-col text-left pr-1">
                                        <span className="text-xs font-bold text-white leading-tight truncate max-w-[90px]">
                                            {user?.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono leading-none">
                                            {user?.user_code}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>

                                {/* Profile Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-72 bg-[#0f141f] border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-2.5">
                                        
                                        {/* User Identity Card */}
                                        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                                            <img
                                                src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'Player'}`}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-xl object-cover border border-amber-500/40"
                                            />
                                            <div className="flex-1 truncate">
                                                <div className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                                                    <span>{user?.name}</span>
                                                    {user?.is_admin && <span className="text-xs" title="Administrator">👑</span>}
                                                </div>
                                                <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                                                    <span className="text-slate-500">{user?.user_code}</span>
                                                    <span className="text-amber-400 font-bold">VIP {user?.vip_level || 1}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Account Menu Items */}
                                        <div className="space-y-1">
                                            <button
                                                onClick={() => { setDropdownOpen(false); onOpenStore?.(); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between font-semibold transition"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Plus className="w-4 h-4 text-amber-400" />
                                                    <span>Get Coins / Store</span>
                                                </div>
                                                <span className="text-amber-400 font-mono font-bold">{formatEuro(user?.game_balance)}</span>
                                            </button>

                                            <button
                                                onClick={() => { setDropdownOpen(false); onOpenWheel?.(); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 font-semibold transition"
                                            >
                                                <span className="text-sm">🎡</span>
                                                <span>Daily Wheel of Fortune</span>
                                            </button>

                                            <button
                                                onClick={() => { setDropdownOpen(false); onOpenVip?.(); }}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2 font-semibold transition"
                                            >
                                                <Crown className="w-4 h-4 text-amber-400" />
                                                <span>VIP Club & Benefits</span>
                                            </button>
                                        </div>

                                        {/* Admin Section (Only for Admins) */}
                                        {user?.is_admin && (
                                            <div className="pt-2 border-t border-slate-800 space-y-1">
                                                <div className="text-[9px] uppercase font-bold text-amber-400/80 px-2 tracking-wider">
                                                    Admin Suite
                                                </div>
                                                <Link
                                                    href="/admin"
                                                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                                                >
                                                    <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>Admin & RTP Control</span>
                                                </Link>
                                                <Link
                                                    href="/admin/users"
                                                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold"
                                                >
                                                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                                                    <span>Manage Users & Bans</span>
                                                </Link>
                                            </div>
                                        )}

                                        {/* Logout Button */}
                                        <div className="pt-2 border-t border-slate-800">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-bold transition cursor-pointer"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Not Logged In: Prominent Sign In & Register Buttons */
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onOpenAuth?.('login')}
                                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 transition cursor-pointer flex items-center gap-1.5"
                            >
                                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                                <span>Sign In</span>
                            </button>

                            <button
                                onClick={() => onOpenAuth?.('register')}
                                className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
                            >
                                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Register</span>
                            </button>
                        </div>
                    )}

                </div>

            </div>
        </header>
    );
}
