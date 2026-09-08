import React, { useState, useEffect } from 'react';
import { formatEuro } from '../lib/utils';
import { Sparkles, Trophy, Zap, Crown, Flame } from 'lucide-react';

export default function LiveWinnersBar({ initialWins = [] }) {
    const [wins, setWins] = useState(initialWins);

    useEffect(() => {
        const fetchWins = async () => {
            try {
                const res = await fetch('/api/live-wins');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setWins(data);
                    }
                }
            } catch (err) {
                // silent
            }
        };

        const interval = setInterval(fetchWins, 3500);
        return () => clearInterval(interval);
    }, []);

    const getTierStyle = (tier) => {
        switch (tier) {
            case 'epic':
                return {
                    badge: '👑 EPIC WIN',
                    badgeClass: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black shadow-lg shadow-amber-500/40 animate-pulse',
                    cardClass: 'border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black/60 shadow-lg shadow-amber-500/10',
                    amountClass: 'text-amber-300 font-black',
                };
            case 'mega':
                return {
                    badge: '⚡ MEGA WIN',
                    badgeClass: 'bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/40',
                    cardClass: 'border-fuchsia-500/40 bg-gradient-to-r from-fuchsia-950/40 via-purple-900/20 to-black/60 shadow-lg shadow-fuchsia-500/10',
                    amountClass: 'text-fuchsia-300 font-black',
                };
            case 'big':
                return {
                    badge: '💎 BIG WIN',
                    badgeClass: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/30',
                    cardClass: 'border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-black/60',
                    amountClass: 'text-cyan-300 font-extrabold',
                };
            case 'win':
                return {
                    badge: '✨ WIN',
                    badgeClass: 'bg-emerald-500/90 text-black',
                    cardClass: 'border-emerald-500/30 bg-slate-900/80',
                    amountClass: 'text-emerald-300 font-bold',
                };
            default:
                return {
                    badge: '🪙 WIN',
                    badgeClass: 'bg-slate-800 text-slate-300 border border-slate-700',
                    cardClass: 'border-slate-800 bg-slate-900/60',
                    amountClass: 'text-amber-200 font-bold',
                };
        }
    };

    if (!wins || wins.length === 0) return null;

    // Duplicate list for infinite marquee animation
    const displayList = [...wins, ...wins];

    return (
        <div className="w-full bg-[#080b11] border-y border-slate-800/80 py-2.5 overflow-hidden relative shadow-inner">
            <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
                {/* Left Static Badge */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider whitespace-nowrap z-10">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Live Winners</span>
                </div>

                {/* Animated Marquee Stream */}
                <div className="overflow-hidden flex-1 relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
                    <div className="animate-marquee flex gap-3.5 items-center">
                        {displayList.map((win, idx) => {
                            const style = getTierStyle(win.tier);
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 px-3 py-1.5 rounded-xl border backdrop-blur text-xs transition-transform hover:scale-105 cursor-pointer shrink-0 ${style.cardClass}`}
                                >
                                    {/* Player Avatar */}
                                    <div className="relative">
                                        <img
                                            src={win.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${win.player_name}`}
                                            alt={win.player_name}
                                            className="w-7 h-7 rounded-full object-cover border border-slate-700 bg-slate-800"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-slate-200 truncate max-w-[90px]">
                                                {win.player_name}
                                            </span>
                                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${style.badgeClass}`}>
                                                {style.badge}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                            {win.game_name}
                                        </span>
                                    </div>

                                    {/* Multiplier & Amount */}
                                    <div className="text-right pl-2 border-l border-slate-800/80">
                                        <div className={`text-xs font-mono ${style.amountClass}`}>
                                            +{formatEuro(win.win_amount)}
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400">
                                            {Number(win.multiplier).toFixed(1)}x
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
