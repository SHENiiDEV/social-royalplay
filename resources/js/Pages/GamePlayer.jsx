import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { formatEuro } from '../lib/utils';
import StoreModal from '../Components/StoreModal';
import WheelOfFortuneModal from '../Components/WheelOfFortuneModal';
import GameLoadingScreen from '../Components/GameLoadingScreen';
import GameCard from '../Components/GameCard';
import FullScreenBanAlert from '../Components/FullScreenBanAlert';
import {
    ArrowLeft,
    Maximize2,
    Volume2,
    VolumeX,
    Plus,
    Flame,
    Sparkles,
    ShieldCheck,
    Info,
    Trophy,
    Gamepad2,
    Crown
} from 'lucide-react';

export default function GamePlayer({
    auth,
    game,
    launchUrl,
    isMock = false,
    relatedGames = [],
    recentWins = [],
    company = {},
}) {
    const [storeOpen, setStoreOpen] = useState(false);
    const [wheelOpen, setWheelOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isIframeLoaded, setIsIframeLoaded] = useState(false);
    const [balance, setBalance] = useState(auth?.user?.game_balance || 0);

    // Fast real-time live balance polling while spinning slots
    const fetchFreshBalance = async () => {
        try {
            const res = await fetch('/api/user/balance');
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.balance !== undefined) {
                    setBalance(data.balance);
                }
            }
        } catch (err) {}
    };

    useEffect(() => {
        fetchFreshBalance();
        const interval = setInterval(fetchFreshBalance, 2000);
        window.addEventListener('focus', fetchFreshBalance);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', fetchFreshBalance);
        };
    }, [auth?.user]);

    const toggleFullscreen = () => {
        const frame = document.getElementById('gameFrameContainer');
        if (!document.fullscreenElement) {
            frame?.requestFullscreen?.();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen?.();
            setIsFullscreen(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col">
            <Head title={`${game.name} — RoyalPlay Casino`} />

            {/* Top Game Bar Controls */}
            <header className="bg-[#0b0f19] border-b border-slate-800/90 px-3 sm:px-6 py-3 flex items-center justify-between gap-3 z-30 shadow-xl">
                
                {/* Left: Back & Game Info */}
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Lobby</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className="text-xl">🎰</span>
                        <div>
                            <h1 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2 leading-none">
                                <span>{game.name}</span>
                                <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                                    {game.provider_code}
                                </span>
                            </h1>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5 hidden sm:flex items-center gap-2">
                                <span>RTP: <strong className="text-emerald-400">{game.rtp_display}</strong></span>
                                <span>•</span>
                                <span>Volatility: <strong className="text-amber-400">{game.volatility}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Balance & Tools */}
                <div className="flex items-center gap-2 sm:gap-4">
                    
                    {/* Player Balance Wallet */}
                    <div className="flex items-center bg-[#111622] border border-amber-500/40 rounded-xl p-1 shadow-md">
                        <div className="px-3 py-0.5 text-right">
                            <div className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">
                                Wallet
                            </div>
                            <div className="text-sm sm:text-base font-mono font-black text-amber-400">
                                {formatEuro(balance)}
                            </div>
                        </div>

                        <button
                            onClick={() => setStoreOpen(true)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black flex items-center justify-center font-black active:scale-95 transition cursor-pointer"
                            title="Top Up Balance"
                        >
                            <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                    </div>

                    {/* Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Toggle Fullscreen"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                </div>

            </header>

            {/* Game Canvas Container */}
            <div
                id="gameFrameContainer"
                className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 flex flex-col items-center justify-center relative min-h-[540px] md:min-h-[680px]"
            >
                <div className="w-full h-full flex-1 rounded-3xl overflow-hidden border border-slate-800 bg-black shadow-2xl relative flex items-center justify-center">
                    {/* Branded Luxury Loading Screen */}
                    <GameLoadingScreen
                        game={game}
                        isIframeLoaded={isIframeLoaded}
                    />

                    {/* Live Provider Game IFrame */}
                    <iframe
                        src={launchUrl}
                        title={game.name}
                        onLoad={() => setIsIframeLoaded(true)}
                        className={`w-full h-full min-h-[540px] md:min-h-[680px] border-0 transition-opacity duration-700 ${
                            isIframeLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        allow="autoplay; fullscreen; encrypted-media"
                    />
                </div>
            </div>

            {/* Related Games & Big Wins Section */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-8 w-full space-y-8">
                
                {/* Related Recommended Slots */}
                {relatedGames.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-amber-400" />
                            <h2 className="text-base sm:text-lg font-bold text-white">
                                You May Also Like ({game.provider_code})
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {relatedGames.map((rg) => (
                                <GameCard key={rg.id} game={rg} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Security Note */}
                <div className="p-4 rounded-2xl bg-[#0e131d] border border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>All bet allocations, payouts, and random reel physics are certified by certified RNG authorities under Curaçao License {company.license}.</span>
                    </div>
                    <div className="font-mono text-slate-500">
                        Session Agent: <span className="text-amber-400">crowdplay</span>
                    </div>
                </div>

            </div>

            {/* Modals */}
            <StoreModal
                isOpen={storeOpen}
                onClose={() => setStoreOpen(false)}
                user={auth?.user}
            />

            <WheelOfFortuneModal
                isOpen={wheelOpen}
                onClose={() => setWheelOpen(false)}
                user={auth?.user}
            />

            {/* Full Screen Emergency Police Ban Alert */}
            <FullScreenBanAlert user={auth?.user} company={company} />
        </div>
    );
}
