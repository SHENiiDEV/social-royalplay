import React, { useState } from 'react';
import { formatEuro } from '../lib/utils';
import { Sparkles, X, Check, ShieldCheck, Zap, Crown, Gift, CreditCard, ArrowRight, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { router } from '@inertiajs/react';

const PACKAGES = [
    {
        id: 'pack_free',
        name: 'Daily Free Bonus',
        coins: 1.00,
        cost: 0.00,
        badge: 'FREE 24H',
        badgeColor: 'bg-emerald-500 text-black',
        bonusText: 'No Deposit Required',
        isFree: true,
    },
    {
        id: 'pack_starter',
        name: 'Starter Bundle',
        coins: 5.25,
        cost: 10.00,
        badge: '+5% BONUS',
        badgeColor: 'bg-blue-500 text-white',
        bonusText: '+1,000 VIP Points',
    },
    {
        id: 'pack_popular',
        name: 'Popular Bundle',
        coins: 27.50,
        cost: 50.00,
        badge: 'MOST POPULAR • +10%',
        badgeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black',
        bonusText: '+5,000 VIP Points (Level 5)',
        isFeatured: true,
    },
    {
        id: 'pack_value',
        name: 'High Value Pack',
        coins: 57.50,
        cost: 100.00,
        badge: '+15% BONUS',
        badgeColor: 'bg-purple-500 text-white',
        bonusText: '+10,000 VIP Points (Level 8)',
    },
    {
        id: 'pack_pro',
        name: 'Pro Player Crate',
        coins: 150.00,
        cost: 250.00,
        badge: '+20% BONUS',
        badgeColor: 'bg-pink-500 text-white',
        bonusText: '+25,000 VIP Points (Diamond)',
    },
    {
        id: 'pack_highroller',
        name: 'High Roller Vault',
        coins: 312.50,
        cost: 500.00,
        badge: '+25% BONUS',
        badgeColor: 'bg-gradient-to-r from-red-500 to-amber-500 text-white',
        bonusText: '+50,000 VIP Points',
    },
    {
        id: 'pack_vip_whale',
        name: 'Royal Whale Treasury',
        coins: 650.00,
        cost: 1000.00,
        badge: '👑 MAX +30% BONUS',
        badgeColor: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-600 text-black shadow-lg shadow-amber-500/40 font-black animate-pulse',
        bonusText: '+100,000 VIP Points • Max Bonus',
        isVip: true,
    },
];

export default function StoreModal({ isOpen, onClose, user }) {
    const [loadingPackId, setLoadingPackId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    // Custom Deposit State
    const [customAmount, setCustomAmount] = useState(100);
    const [customLoading, setCustomLoading] = useState(false);

    // Calculate dynamic bonus for custom deposit
    const calculateBonus = (amountEur) => {
        const amt = Number(amountEur) || 0;
        let bonusPercent = 0;
        if (amt >= 1000) bonusPercent = 30;
        else if (amt >= 500) bonusPercent = 25;
        else if (amt >= 250) bonusPercent = 20;
        else if (amt >= 100) bonusPercent = 15;
        else if (amt >= 50) bonusPercent = 10;
        else if (amt >= 10) bonusPercent = 5;

        const baseSc = amt * 0.50;
        const bonusSc = (baseSc * bonusPercent) / 100;
        const totalSc = baseSc + bonusSc;
        const vipPoints = Math.round(amt * 100);

        return { bonusPercent, baseSc, bonusSc, totalSc, vipPoints };
    };

    const customCalc = calculateBonus(customAmount);

    const handlePurchase = async (pack) => {
        setLoadingPackId(pack.id);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await fetch('/api/store/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ package_id: pack.id }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccessMessage(data.message);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
                router.reload({ only: ['auth'] });
            } else {
                setErrorMessage(data.message || 'Failed to claim or purchase pack.');
            }
        } catch (err) {
            setErrorMessage('Network error occurred.');
        } finally {
            setLoadingPackId(null);
        }
    };

    const handleCustomDeposit = async () => {
        if (customAmount < 5) {
            setErrorMessage('Minimum deposit amount is €5.00');
            return;
        }

        setCustomLoading(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const res = await fetch('/api/store/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    package_id: 'custom',
                    custom_amount: Number(customAmount),
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccessMessage(data.message);
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { y: 0.6 }
                });
                router.reload({ only: ['auth'] });
            } else {
                setErrorMessage(data.message || 'Failed to complete custom deposit.');
            }
        } catch (err) {
            setErrorMessage('Network error occurred.');
        } finally {
            setCustomLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0c1018] border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                                <span>Casino Coin Store</span>
                                <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-mono border border-amber-500/30">
                                    1 EUR = 0.50 SC
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Instant credit • Up to <strong className="text-amber-400 font-bold">+30% Bonus SC</strong> on deposits from €1,000+!
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Notifications */}
                {successMessage && (
                    <div className="my-2 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-semibold flex items-center justify-between">
                        <span>{successMessage}</span>
                        <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                )}
                {errorMessage && (
                    <div className="my-2 p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-xs">
                        {errorMessage}
                    </div>
                )}

                {/* Main Scrollable Area */}
                <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1">

                    {/* Interactive Custom Deposit Card */}
                    <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#111726] to-black border-2 border-amber-500/50 shadow-xl shadow-amber-500/10">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                                    ⚡
                                </span>
                                <div>
                                    <h3 className="text-sm md:text-base font-extrabold text-white">Custom Deposit</h3>
                                    <p className="text-[11px] text-slate-400">Enter custom amount in EUR & get dynamic bonus SC</p>
                                </div>
                            </div>

                            {/* Bonus Tag */}
                            <div className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                                customCalc.bonusPercent >= 30
                                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-lg shadow-amber-500/40 animate-pulse'
                                    : customCalc.bonusPercent > 0
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400'
                            }`}>
                                <Flame className="w-3.5 h-3.5" />
                                <span>+{customCalc.bonusPercent}% BONUS SC</span>
                            </div>
                        </div>

                        {/* Quick Preset Buttons */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase">Presets:</span>
                            {[20, 50, 100, 250, 500, 1000].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setCustomAmount(preset)}
                                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                                        customAmount === preset
                                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                >
                                    €{preset} {preset === 1000 ? '👑 (+30%)' : ''}
                                </button>
                            ))}
                        </div>

                        {/* Input & Output Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            {/* EUR Input */}
                            <div className="md:col-span-5 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">€</span>
                                <input
                                    type="number"
                                    min="5"
                                    step="5"
                                    max="50000"
                                    value={customAmount}
                                    onChange={(e) => setCustomAmount(Math.max(0, Number(e.target.value)))}
                                    placeholder="Enter EUR amount"
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-base font-mono font-black text-white focus:outline-none focus:border-amber-400 transition"
                                />
                            </div>

                            {/* Arrow */}
                            <div className="hidden md:flex md:col-span-1 justify-center text-amber-400">
                                <ArrowRight className="w-5 h-5" />
                            </div>

                            {/* Result Stats */}
                            <div className="md:col-span-3 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-right">
                                <div className="text-[10px] uppercase font-bold text-slate-400">You Receive:</div>
                                <div className="text-xl font-mono font-black text-amber-400 leading-tight">
                                    {formatEuro(customCalc.totalSc)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                    +{customCalc.vipPoints} VIP Points
                                </div>
                            </div>

                            {/* Deposit Button */}
                            <div className="md:col-span-3">
                                <button
                                    onClick={handleCustomDeposit}
                                    disabled={customLoading || customAmount < 5}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition cursor-pointer disabled:opacity-50"
                                >
                                    {customLoading ? 'Processing...' : `Deposit €${customAmount}`}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preset Packages Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {PACKAGES.map((pack) => {
                            const isLoading = loadingPackId === pack.id;
                            return (
                                <div
                                    key={pack.id}
                                    className={`relative rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ${
                                        pack.isFeatured
                                            ? 'bg-gradient-to-b from-amber-950/30 to-slate-900/90 border-2 border-amber-500/60 shadow-lg shadow-amber-500/10'
                                            : pack.isVip
                                            ? 'bg-gradient-to-b from-purple-950/30 to-slate-900/90 border-2 border-purple-500/60 shadow-lg shadow-purple-500/10'
                                            : 'bg-slate-900/70 border border-slate-800/90 hover:border-slate-700'
                                    }`}
                                >
                                    {/* Badge */}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${pack.badgeColor}`}>
                                            {pack.badge}
                                        </span>
                                        {pack.isFree ? (
                                            <Gift className="w-5 h-5 text-emerald-400" />
                                        ) : (
                                            <Zap className="w-4 h-4 text-amber-400" />
                                        )}
                                    </div>

                                    {/* Package Content */}
                                    <div>
                                        <div className="text-slate-400 text-xs font-semibold">{pack.name}</div>
                                        <div className="text-2xl font-black font-mono text-white mt-1">
                                            +{formatEuro(pack.coins)}
                                        </div>
                                        <div className="text-[11px] text-amber-400 font-semibold mt-1">
                                            {pack.bonusText}
                                        </div>
                                    </div>

                                    {/* Buy Button */}
                                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                                        <div className="font-mono text-sm font-black text-slate-200">
                                            {pack.cost === 0 ? 'FREE' : `€${pack.cost.toFixed(2)}`}
                                        </div>

                                        <button
                                            onClick={() => handlePurchase(pack)}
                                            disabled={isLoading}
                                            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition active:scale-95 cursor-pointer ${
                                                pack.isFree
                                                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20'
                                                    : pack.isFeatured
                                                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black shadow-lg shadow-amber-500/30'
                                                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                                            }`}
                                        >
                                            {isLoading ? 'Processing...' : pack.isFree ? 'Claim Free' : 'Get Coins'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Badges */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SSL 256-Bit Encrypted</span>
                        <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Instant Coin Delivery</span>
                    </div>
                    <div>Rate: 1 EUR = 0.50 SC • Max +30% Bonus (€1,000+)</div>
                </div>

            </div>
        </div>
    );
}
