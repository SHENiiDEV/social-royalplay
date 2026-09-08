import React, { useState, useEffect } from 'react';
import { formatEuro } from '../lib/utils';
import { Crown, Sparkles, Flame, Gift, ArrowRight, Trophy, Zap, Play } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function HeroBanners({
    jackpot,
    user,
    onOpenStore,
    onOpenWheel,
    featuredGame,
}) {
    const [jackpotPool, setJackpotPool] = useState(() => Number(jackpot?.current_pool) || 54890.45);

    useEffect(() => {
        const interval = setInterval(() => {
            setJackpotPool(prev => Number((Number(prev || 54890.45) + 0.08 + Math.random() * 0.12).toFixed(2)));
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                    
                    {/* Main Massive Banner: Grand Progressive Jackpot */}
                    <div className="lg:col-span-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c1505] via-[#10141f] to-[#0a0d14] border-2 border-amber-500/40 p-6 md:p-10 shadow-2xl shadow-amber-500/10 flex flex-col justify-between min-h-[300px] md:min-h-[360px] group">
                        
                        {/* Background subtle art & glowing orb */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-amber-500/25 transition-all duration-700" />
                        <div className="absolute bottom-0 right-10 text-[180px] font-black text-amber-500/5 select-none pointer-events-none font-heading leading-none">
                            777
                        </div>

                        {/* Top Badges */}
                        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30">
                                <Crown className="w-3.5 h-3.5 fill-black" />
                                Community Pool
                            </span>
                            <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-xs font-mono">
                                0.5% of every spin contributes
                            </span>
                        </div>

                        {/* Middle Content */}
                        <div className="relative z-10 my-6">
                            <h1 className="text-sm md:text-base font-extrabold uppercase tracking-widest text-amber-400/90 mb-1">
                                Grand Progressive Jackpot
                            </h1>
                            
                            {/* Massive Jackpot Number Display */}
                            <div className="text-4xl sm:text-5xl md:text-7xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
                                {formatEuro(jackpotPool)}
                            </div>

                            <p className="text-xs md:text-sm text-slate-400 max-w-lg mt-2">
                                Win the ultimate community jackpot on any spin across all Pragmatic Play, PG Soft, and Hacksaw slots!
                            </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="relative z-10 flex flex-wrap items-center gap-3 pt-2">
                            {featuredGame ? (
                                <Link
                                    href={`/game/${featuredGame.slug}`}
                                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-black font-black text-sm tracking-wider uppercase shadow-xl shadow-amber-500/30 transition transform flex items-center gap-2 cursor-pointer"
                                >
                                    <Play className="w-4 h-4 fill-black" />
                                    <span>Play {featuredGame.name}</span>
                                </Link>
                            ) : null}

                            <button
                                onClick={onOpenStore}
                                className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer"
                            >
                                <Gift className="w-4 h-4 text-emerald-400" />
                                <span>Get Free Coins</span>
                            </button>
                        </div>

                    </div>

                    {/* Right Column: 2 Promo Cards */}
                    <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
                        
                        {/* Wheel of Fortune Promo Box */}
                        <div
                            onClick={onOpenWheel}
                            className="relative rounded-3xl p-5 md:p-6 bg-gradient-to-br from-purple-950/40 via-slate-900 to-black/80 border border-purple-500/40 hover:border-purple-400 shadow-xl flex-1 flex flex-col justify-between cursor-pointer group transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🎡</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                                        Free 24h
                                    </span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                            </div>

                            <div className="my-2">
                                <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors">
                                    Daily Wheel of Fortune
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Spin every day for guaranteed rewards from SC 1.00 up to SC 10.00!
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold text-purple-400 pt-2 border-t border-purple-500/20">
                                <span>{user?.can_spin_wheel ? 'Ready to Spin!' : 'Cooldown Active'}</span>
                                <span className="font-mono text-[11px] underline">Spin Now</span>
                            </div>
                        </div>

                        {/* Free Daily 1.00 SC Box */}
                        <div
                            onClick={onOpenStore}
                            className="relative rounded-3xl p-5 md:p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-black/80 border border-emerald-500/40 hover:border-emerald-400 shadow-xl flex-1 flex flex-col justify-between cursor-pointer group transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🎁</span>
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                        Instant Claim
                                    </span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                            </div>

                            <div className="my-2">
                                <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                                    Free Daily 1.00 SC Bonus
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                    Claim your daily complimentary balance in the coin store.
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 pt-2 border-t border-emerald-500/20">
                                <span>{user?.can_claim_daily_bonus ? 'Available Now' : 'Claimed'}</span>
                                <span className="font-mono text-[11px] underline">Claim 1.00 SC</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
