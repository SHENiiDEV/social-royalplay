import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function SplashScreen() {
    const [visible, setVisible] = useState(() => {
        // Check if already shown in this browser session
        if (typeof window !== 'undefined') {
            return !sessionStorage.getItem('royalplay_splash_loaded');
        }
        return false;
    });
    
    const [progress, setProgress] = useState(12);
    const [statusText, setStatusText] = useState('Initializing Gaming Experience...');
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (!visible) return;

        // Progress step simulation
        const p1 = setTimeout(() => {
            setProgress(38);
            setStatusText('Connecting RNG Gaming Engines...');
        }, 350);

        const p2 = setTimeout(() => {
            setProgress(72);
            setStatusText('Loading Seamless Wallet...');
        }, 850);

        const p3 = setTimeout(() => {
            setProgress(94);
            setStatusText('Preparing Social Slots...');
        }, 1350);

        const p4 = setTimeout(() => {
            setProgress(100);
            setStatusText('Welcome to RoyalPlay!');
        }, 1750);

        const p5 = setTimeout(() => {
            setFadeOut(true);
            try {
                sessionStorage.setItem('royalplay_splash_loaded', 'true');
            } catch (e) {}
        }, 2050);

        const p6 = setTimeout(() => {
            setVisible(false);
        }, 2750);

        return () => {
            clearTimeout(p1);
            clearTimeout(p2);
            clearTimeout(p3);
            clearTimeout(p4);
            clearTimeout(p5);
            clearTimeout(p6);
        };
    }, [visible]);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-[9999] bg-[#060a12] flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-700 ease-out ${
                fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
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

            {/* Ambient Radial Vignette */}
            <div className="absolute inset-0 bg-radial from-transparent via-[#060a12]/20 to-[#060a12]/80 pointer-events-none" />

            {/* Bottom Progress Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-end w-full h-full pb-8 sm:pb-12 px-4 max-w-xl text-center">
                
                {/* Dynamic Progress Card */}
                <div className="w-full max-w-md bg-[#0a0f1d]/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl shadow-black/80">
                    
                    {/* Progress Bar */}
                    <div className="relative w-full h-5 sm:h-6 bg-slate-950 rounded-xl p-0.5 border border-amber-500/60 overflow-hidden shadow-inner">
                        <div
                            className="h-full rounded-lg bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300 relative transition-all duration-300 ease-out shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                        </div>
                    </div>

                    {/* Status Text in English */}
                    <div className="mt-2.5 flex items-center justify-between text-xs px-1 font-mono">
                        <span className="text-amber-300 font-bold tracking-wide flex items-center gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
                            <span>{statusText}</span>
                        </span>
                        <span className="text-cyan-300 font-black tracking-wider shrink-0">
                            {progress}%
                        </span>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-4 flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    <span>18+ Play Responsibly</span>
                    <span>•</span>
                    <span>Certified RNG Entertainment</span>
                </div>
            </div>
        </div>
    );
}
