import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Play, Sparkles, Flame, Heart, Zap } from 'lucide-react';

export default function GameCard({ game, initialIsFavorite = false, onFavoriteToggle }) {
    const [isFavorite, setIsFavorite] = useState(() => {
        if (initialIsFavorite) return true;
        try {
            const saved = JSON.parse(localStorage.getItem('rp_favorites') || '[]');
            return saved.includes(game.id);
        } catch (e) {
            return false;
        }
    });

    const getProviderBadge = (provider) => {
        switch (provider) {
            case 'PRAGMATIC':
                return { name: 'Pragmatic Play', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
            case 'PGSOFT':
                return { name: 'PG Soft', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
            case 'HACKSAW':
                return { name: 'Hacksaw', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
            case 'AMUSNET':
                return { name: 'Amusnet', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
            case 'NO_LIMIT':
                return { name: 'NoLimit City', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
            case 'EVOLUTION':
                return { name: 'Evolution', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
            default:
                return { name: provider, color: 'bg-slate-800 text-slate-300 border-slate-700' };
        }
    };

    const providerInfo = getProviderBadge(game.provider_code);

    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const newState = !isFavorite;
        setIsFavorite(newState);

        // Update local storage
        try {
            const saved = JSON.parse(localStorage.getItem('rp_favorites') || '[]');
            let updated;
            if (newState) {
                updated = [...new Set([...saved, game.id])];
            } else {
                updated = saved.filter((id) => id !== game.id);
            }
            localStorage.setItem('rp_favorites', JSON.stringify(updated));
        } catch (err) {}

        onFavoriteToggle?.(game.id, newState);

        // Sync with API
        try {
            await fetch('/api/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ game_id: game.id }),
            });
        } catch (err) {}
    };

    return (
        <div className="group relative rounded-3xl bg-[#101522] border border-slate-800 hover:border-amber-500/60 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-1.5">
            
            {/* Thumbnail Image Container */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                    src={game.cover_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'}
                    alt={game.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    loading="lazy"
                />

                {/* Top Badges & Favorite Button */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border backdrop-blur-md ${providerInfo.color}`}>
                        {providerInfo.name}
                    </span>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        {game.is_featured && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/40">
                                <Flame className="w-3.5 h-3.5 fill-black" />
                                HOT
                            </span>
                        )}

                        {/* Favorite Button */}
                        <button
                            onClick={handleToggleFavorite}
                            className={`p-2 rounded-xl backdrop-blur-md border transition cursor-pointer active:scale-90 ${
                                isFavorite
                                    ? 'bg-rose-500/40 border-rose-500 text-rose-400 shadow-md shadow-rose-500/30'
                                    : 'bg-black/70 border-white/15 text-slate-300 hover:text-white hover:border-white/40'
                            }`}
                            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Bottom Overlay Info on image */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-slate-300 border border-white/10">
                        RTP: {game.rtp_display}
                    </span>

                    {game.max_multiplier && (
                        <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md shadow-amber-500/30">
                            {Number(game.max_multiplier).toLocaleString()}x
                        </span>
                    )}
                </div>

                {/* Hover Play Button Overlay (No Demo) */}
                <div className="absolute inset-0 bg-black/65 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-5 z-20">
                    <Link
                        href={`/game/${game.slug}`}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-amber-500/40 active:scale-95 transition transform flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Play className="w-4 h-4 fill-black" />
                        <span>PLAY NOW</span>
                    </Link>

                    <button
                        onClick={handleToggleFavorite}
                        className={`w-full py-2.5 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                            isFavorite
                                ? 'bg-rose-500/25 text-rose-300 border-rose-500/60 hover:bg-rose-500/35'
                                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{isFavorite ? 'In Favorites' : 'Add to Favorites'}</span>
                    </button>
                </div>

            </div>

            {/* Bottom Details */}
            <div className="p-4 flex items-center justify-between gap-2">
                <div className="flex flex-col truncate pr-1">
                    <h3 className="font-extrabold text-base md:text-lg text-slate-100 truncate group-hover:text-amber-400 transition-colors">
                        {game.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                        <span>Min: SC {Number(game.min_bet).toFixed(2)}</span>
                        <span>•</span>
                        <span className="text-amber-400/90 font-bold">{game.volatility}</span>
                    </div>
                </div>

                <Link
                    href={`/game/${game.slug}`}
                    className="w-10 h-10 rounded-2xl bg-slate-800/90 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-yellow-400 group-hover:text-black text-slate-300 flex items-center justify-center transition-all shadow-md group-hover:shadow-amber-500/30 shrink-0 cursor-pointer"
                    title="Play Now"
                >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                </Link>
            </div>

        </div>
    );
}
