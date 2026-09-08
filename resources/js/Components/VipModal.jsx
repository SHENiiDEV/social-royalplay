import React from 'react';
import { Crown, Sparkles, X, Shield, Star, Award, Zap } from 'lucide-react';

const TIERS = [
    { level: 1, name: 'Bronze Explorer', points: '0 - 999', cashback: '1%', bonus: 'Free Daily Wheel', color: 'from-amber-700 to-amber-900', border: 'border-amber-700/50' },
    { level: 3, name: 'Silver Highflyer', points: '1,000 - 4,999', cashback: '3%', bonus: '5% Extra Store Coins', color: 'from-slate-400 to-slate-600', border: 'border-slate-400/50' },
    { level: 5, name: 'Gold Champion', points: '5,000 - 9,999', cashback: '5%', bonus: '10% Extra Store Coins + Priority Support', color: 'from-yellow-400 to-amber-500', border: 'border-amber-400/50' },
    { level: 8, name: 'Platinum Elite', points: '10,000 - 24,999', cashback: '8%', bonus: '20% Extra Store Coins + Dedicated VIP Host', color: 'from-cyan-400 to-blue-600', border: 'border-cyan-400/50' },
    { level: 10, name: '👑 Diamond Whale', points: '25,000+', cashback: '12%', bonus: 'Unlimited Turbo Spins + Custom High Stakes', color: 'from-fuchsia-400 via-purple-500 to-amber-400', border: 'border-fuchsia-400/50' },
];

export default function VipModal({ isOpen, onClose, user }) {
    if (!isOpen) return null;

    const currentLevel = user?.vip_level || 1;
    const currentPoints = user?.vip_points || 0;
    const nextLevelPoints = currentLevel * 1000;
    const progress = Math.min(100, Math.round((currentPoints % 1000) / 10));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#0c1018] border border-amber-500/30 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                                <span>VIP Royalty Club</span>
                                <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                                    Tier {currentLevel}
                                </span>
                            </h2>
                            <p className="text-xs text-slate-400">
                                Earn VIP Points with coin deposits and unlock exclusive royalty perks!
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Current VIP Status Card */}
                <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-black/60 border border-amber-500/40">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                        <span>Your VIP Status: <strong className="text-amber-400 font-bold">Level {currentLevel}</strong></span>
                        <span className="font-mono text-slate-400">{currentPoints} VIP Points</span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
                        <span>Progress to Level {currentLevel + 1}</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                {/* Tiers List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {TIERS.map((tier) => {
                        const isCurrent = currentLevel >= tier.level && currentLevel < tier.level + 2;
                        return (
                            <div
                                key={tier.level}
                                className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${tier.border} ${
                                    isCurrent ? 'bg-amber-500/10' : 'bg-slate-900/60'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${tier.color} flex items-center justify-center text-black font-black text-xs shadow`}>
                                        L{tier.level}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white flex items-center gap-2">
                                            <span>{tier.name}</span>
                                            {isCurrent && (
                                                <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded font-black uppercase">
                                                    Current Rank
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-0.5">{tier.bonus}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-mono text-right pl-11 md:pl-0">
                                    <div>
                                        <span className="text-slate-400">Cashback: </span>
                                        <strong className="text-emerald-400">{tier.cashback}</strong>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Points: </span>
                                        <strong className="text-amber-300">{tier.points}</strong>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
