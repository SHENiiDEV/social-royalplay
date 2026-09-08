import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function GameLoadingScreen({ game, isIframeLoaded, onComplete }) {
    const [progress, setProgress] = useState(15);
    const [statusText, setStatusText] = useState(`Loading ${game?.name || 'game'}...`);
    const [fading, setFading] = useState(false);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        // Step 1: Connecting engine
        const t1 = setTimeout(() => {
            setProgress(42);
            setStatusText(`Connecting to certified ${game?.provider_code || 'PRAGMATIC'} engine...`);
        }, 400);

        // Step 2: Sync wallet
        const t2 = setTimeout(() => {
            setProgress(76);
            setStatusText('Synchronizing Wallet balance...');
        }, 900);

        // Step 3: Preparing reels
        const t3 = setTimeout(() => {
            setProgress(92);
            setStatusText('Preparing graphics and sound...');
        }, 1400);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [game]);

    // Once iframe is loaded and progress has advanced, complete and fade out
    useEffect(() => {
        if (isIframeLoaded && progress >= 76) {
            setProgress(100);
            setStatusText('Ready! Starting game...');
            const tFade = setTimeout(() => {
                setFading(true);
            }, 400);

            const tDone = setTimeout(() => {
                setHidden(true);
                onComplete?.();
            }, 1100);

            return () => {
                clearTimeout(tFade);
                clearTimeout(tDone);
            };
        }
    }, [isIframeLoaded, progress, onComplete]);

    // Safety fallback: if iframe doesn't trigger onload within 3.5s, auto-finish
    useEffect(() => {
        const fallback = setTimeout(() => {
            setProgress(100);
            setStatusText('Ready!');
            setFading(true);
            setTimeout(() => {
                setHidden(true);
                onComplete?.();
            }, 700);
        }, 3500);

        return () => clearTimeout(fallback);
    }, [onComplete]);

    if (hidden) return null;

    return (
        <div
            className={`absolute inset-0 z-40 bg-[#060a12] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ease-out ${
                fading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
            }`}
        >
            {/* Background Artwork */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/loading_screen_bg.jpg"
                    alt="RoyalPlay Loading Screen"
                    className="w-full h-full object-cover object-center filter brightness-95"
                />
            </div>

            {/* Glowing Ambient Particles & Radial Aura */}
            <div className="absolute inset-0 bg-radial from-transparent via-[#060a12]/30 to-[#060a12]/85 pointer-events-none" />

            {/* Centered Overlay & Progress Elements */}
            <div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-8 sm:pb-12 px-4 max-w-xl text-center">
                
                {/* Dynamic Animated Progress Bar Overlay */}
                <div className="w-full max-w-md bg-[#0a0f1d]/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl shadow-black/80">
                    
                    {/* Progress Bar Container */}
                    <div className="relative w-full h-5 sm:h-6 bg-slate-950 rounded-xl p-0.5 border border-amber-500/60 overflow-hidden shadow-inner">
                        {/* Plasma Electric Neon Progress Fill */}
                        <div
                            className="h-full rounded-lg bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300 relative transition-all duration-300 ease-out shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Animated Glint / Light Sweep */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                        </div>
                    </div>

                    {/* Status Text in English */}
                    <div className="mt-2.5 flex items-center justify-between text-xs px-1 font-mono">
                        <span className="text-amber-300 font-bold tracking-wide flex items-center gap-1.5 truncate max-w-[280px] sm:max-w-none text-left">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                            <span className="truncate">{statusText}</span>
                        </span>
                        <span className="text-cyan-300 font-black tracking-wider shrink-0">
                            {progress}%
                        </span>
                    </div>

                    {/* Game Details Sub-bar */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-extrabold text-white truncate max-w-[180px]">
                            {game?.name}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                            {game?.provider_code || 'PRAGMATIC'}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}
