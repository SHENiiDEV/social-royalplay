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
        <div className="w-full py-2 sm:py-4 md:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-6">
                    
                    {/* Main Massive Banner: Grand Progressive Jackpot */}
                    <div className="lg:col-span-8 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c1505] via-[#10141f] to-[#0a0d14] border-2 border-amber-500/40 p-4 sm:p-6 md:p-10 shadow-2xl shadow-amber-500/10 flex flex-col justify-between min-h-[220px] sm:min-h-[280px] md:min-h-[360px] group">
                        
                        {/* Background subtle art & glowing orb */}
                        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 group-hover:bg-amber-500/25 transition-all duration-700" />
                        <div className="absolute bottom-0 right-4 sm:right-10 text-[100px] sm:text-[140px] md:text-[180px] font-black text-amber-500/5 select-none pointer-events-none font-heading leading-none">
                            777
                        </div>

                        {/* Top Badges */}
                        <div className="relative z-10 flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                            <span className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/30">
                                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black" />
                                Community Pool
                            </span>
                            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[10px] sm:text-xs font-mono">
                                0.5% every spin contributes
                            </span>
                        </div>

                        {/* Middle Content */}
                        <div className="relative z-10 my-3 sm:my-6">
                            <h1 className="text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-widest text-amber-400/90 mb-0.5 sm:mb-1">
                                Grand Progressive Jackpot
                            </h1>
                            
                            {/* Massive Jackpot Number Display */}
                            <div className="text-3xl sm:text-5xl md:text-7xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)]">
                                {formatEuro(jackpotPool)}
                            </div>

                            <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 max-w-lg mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-none">
                                Win the ultimate community jackpot on any spin across all Pragmatic Play, PG Soft, and Hacksaw slots!
                            </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
                            {featuredGame ? (
                                <Link
                                    href={`/game/${featuredGame.slug}`}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/30 transition transform flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                                >
                                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
                                    <span>Play {featuredGame.name}</span>
                                </Link>
                            ) : null}

                            <button
                                onClick={onOpenStore}
                                className="px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-bold text-xs sm:text-sm transition flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                                <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                                <span>Get Free Coins</span>
                            </button>
                        </div>

                    </div>

                    {/* Right Column: 2 Promo Cards - 2 cols on mobile, vertical on desktop */}
                    <div className="lg:col-span-4 grid grid-cols-2 lg:flex lg:flex-col gap-2.5 sm:gap-4 md:gap-6">
                        
                        {/* Wheel of Fortune Promo Box */}
                        <div
                            onClick={onOpenWheel}
                            className="relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 bg-gradient-to-br from-purple-950/40 via-slate-900 to-black/80 border border-purple-500/40 hover:border-purple-400 shadow-xl flex flex-col justify-between cursor-pointer group transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-xl sm:text-2xl">🎡</span>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                                        Free 24h
                                    </span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 group-hover:translate-x-1 transition-transform hidden sm:block" />
                            </div>

                            <div className="my-1.5 sm:my-2">
                                <h3 className="text-xs sm:text-base md:text-lg font-black text-white group-hover:text-purple-300 transition-colors leading-tight">
                                    Daily Wheel
                                </h3>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-2">
                                    Spin daily for free SC 1.00 - 10.00!
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-purple-400 pt-1.5 sm:pt-2 border-t border-purple-500/20">
                                <span className="truncate">{user?.can_spin_wheel ? 'Ready!' : 'Active'}</span>
                                <span className="font-mono text-[10px] sm:text-[11px] underline shrink-0">Spin</span>
                            </div>
                        </div>

                        {/* Free Daily 1.00 SC Box */}
                        <div
                            onClick={onOpenStore}
                            className="relative rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-black/80 border border-emerald-500/40 hover:border-emerald-400 shadow-xl flex flex-col justify-between cursor-pointer group transition-all"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <span className="text-xl sm:text-2xl">🎁</span>
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 sm:px-2 py-0.5 rounded-full">
                                        Claim
                                    </span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:translate-x-1 transition-transform hidden sm:block" />
                            </div>

                            <div className="my-1.5 sm:my-2">
                                <h3 className="text-xs sm:text-base md:text-lg font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                                    Daily 1.00 SC
                                </h3>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 line-clamp-2">
                                    Claim complimentary daily balance.
                                </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold text-emerald-400 pt-1.5 sm:pt-2 border-t border-emerald-500/20">
                                <span className="truncate">{user?.can_claim_daily_bonus ? 'Ready!' : 'Claimed'}</span>
                                <span className="font-mono text-[10px] sm:text-[11px] underline shrink-0">Claim</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
