import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { formatEuro } from '../lib/utils';
import { Sparkles, Clock, X, Trophy, Volume2, VolumeX, Crown, Zap, Flame, Gift, Star } from 'lucide-react';
import { router } from '@inertiajs/react';

const SECTORS = [
    { index: 0, label: '1.00 SC', icon: '🪙', color: '#1e3a8a', accent: '#60a5fa', textColor: '#ffffff' },
    { index: 1, label: '2.00 SC', icon: '💎', color: '#065f46', accent: '#34d399', textColor: '#ffffff' },
    { index: 2, label: '3.00 SC', icon: '🍀', color: '#b45309', accent: '#fbbf24', textColor: '#ffffff' },
    { index: 3, label: '4.00 SC', icon: '⚡', color: '#5b21b6', accent: '#a78bfa', textColor: '#ffffff' },
    { index: 4, label: '5.00 SC', icon: '🌟', color: '#9d174d', accent: '#f472b6', textColor: '#ffffff' },
    { index: 5, label: '6.00 SC', icon: '💎', color: '#155e75', accent: '#22d3ee', textColor: '#ffffff' },
    { index: 6, label: '8.00 SC', icon: '👑', color: '#9f1239', accent: '#fb7185', textColor: '#ffffff' },
    { index: 7, label: '10.00 SC', icon: '🏆', color: '#854d0e', accent: '#facc15', textColor: '#ffffff' },
];

export default function WheelOfFortuneModal({ isOpen, onClose, user }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [wonPrize, setWonPrize] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(user?.wheel_spin_seconds || 0);
    const [ledLightTick, setLedLightTick] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [pointerBounced, setPointerBounced] = useState(false);

    const canSpin = secondsLeft <= 0;

    // LED Chase Lights Animation (24 LEDs around the wheel)
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => {
            setLedLightTick((prev) => (prev + 1) % 24);
        }, 150);
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setWonPrize(null);
            setErrorMsg(null);
        }
        if (user) {
            setSecondsLeft(user.wheel_spin_seconds || 0);
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsLeft]);

    // Mechanical Peg Click Sound via Web Audio API
    const playPegClickTone = (freq = 750) => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.035);
            gain.gain.setValueAtTime(0.14, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.035);
        } catch(e) {}
    };

    // Celebratory Fanfare Chord
    const playWinFanfare = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
                gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.09);
                gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + idx * 0.09 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 1.1);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.09);
                osc.stop(ctx.currentTime + idx * 0.09 + 1.15);
            });
        } catch(e) {}
    };

    const handleSpin = async () => {
        if (isSpinning || !canSpin) return;
        setIsSpinning(true);
        setErrorMsg(null);
        setWonPrize(null);

        try {
            const res = await fetch('/api/bonus/wheel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                }
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setErrorMsg(data.message || 'Error occurred while spinning wheel.');
                setIsSpinning(false);
                if (data.seconds_remaining) {
                    setSecondsLeft(data.seconds_remaining);
                }
                return;
            }

            const targetIndex = data.sector_index;
            const sectorAngle = 360 / 8; // 45 deg per sector
            
            // Calculate total degrees with 6 full extra rotations
            const targetSectorCenter = targetIndex * sectorAngle + (sectorAngle / 2);
            const finalAngle = 360 * 6 + (360 - targetSectorCenter);

            setRotation(finalAngle);

            // Realistic peg clicks with easing rate
            let clickTimer;
            let currentDelay = 40;
            const maxDuration = 4400;
            const startTime = Date.now();

            const triggerClick = () => {
                const elapsed = Date.now() - startTime;
                if (elapsed >= maxDuration) return;

                setPointerBounced(prev => !prev);
                playPegClickTone(650 + Math.random() * 200);

                // Slow down clicks following the cubic-bezier physics
                const progress = elapsed / maxDuration;
                currentDelay = 40 + Math.pow(progress, 2.5) * 380;
                clickTimer = setTimeout(triggerClick, currentDelay);
            };

            clickTimer = setTimeout(triggerClick, currentDelay);

            // Finish callback
            setTimeout(() => {
                clearTimeout(clickTimer);
                setIsSpinning(false);
                setWonPrize(data.prize_label);
                setSecondsLeft(86400); // 24 hours
                playWinFanfare();

                // Double Fireworks Confetti
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { x: 0.2, y: 0.6 },
                    colors: ['#fbbf24', '#f59e0b', '#ec4899', '#3b82f6', '#10b981']
                });
                confetti({
                    particleCount: 120,
                    spread: 80,
                    origin: { x: 0.8, y: 0.6 },
                    colors: ['#fbbf24', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e']
                });

                router.reload({ only: ['auth'] });
            }, 4500);

        } catch (err) {
            console.error(err);
            setErrorMsg('Network error. Please try again.');
            setIsSpinning(false);
        }
    };

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200 overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#141b2d] via-[#0d1220] to-[#070a12] border-2 border-amber-500/60 rounded-3xl p-5 sm:p-8 shadow-[0_0_80px_rgba(245,158,11,0.3)] flex flex-col items-center text-center overflow-hidden my-auto">
                
                {/* Sunburst background rotating effect */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-purple-600/5 to-transparent pointer-events-none" />

                {/* Top Controls */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="p-2.5 text-slate-400 hover:text-amber-400 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-full transition cursor-pointer shadow-lg"
                        title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    </button>
                </div>

                <button
                    onClick={onClose}
                    disabled={isSpinning}
                    className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-white bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-full transition cursor-pointer z-20 shadow-lg"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header Title */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-black tracking-widest uppercase text-[11px] mb-1.5 shadow-inner">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Free Daily Fortune</span>
                </div>
                
                <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 tracking-tight leading-tight uppercase font-heading">
                    ROYAL WHEEL OF FORTUNE
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-3 max-w-md">
                    Spin once every 24 hours to win free Social Coins for all slot machines & tables!
                </p>

                {/* HUGE WHEEL STAGE */}
                <div className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] md:w-[480px] md:h-[480px] my-2 flex items-center justify-center select-none">
                    
                    {/* Outer Vegas Gold Bezel with 24 Chasing LED Bulbs */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-800 p-3 sm:p-4 shadow-[0_0_50px_rgba(245,158,11,0.45)] border-4 border-amber-300/80 flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-[#070b14] border-4 border-amber-900/80 shadow-inner" />
                    </div>

                    {/* 24 Chasing LED Bulbs Around the Perimeter */}
                    {Array.from({ length: 24 }).map((_, i) => {
                        const angle = (i * 360) / 24;
                        const rad = (angle * Math.PI) / 180;
                        const r = 47.2; // percent radius
                        const x = 50 + r * Math.cos(rad);
                        const y = 50 + r * Math.sin(rad);
                        const isActive = (i + ledLightTick) % 4 === 0 || (i + ledLightTick) % 4 === 1;

                        return (
                            <div
                                key={i}
                                className={`absolute w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full z-10 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-150 border ${
                                    isActive
                                        ? 'bg-yellow-200 border-white shadow-[0_0_12px_#fef08a]'
                                        : 'bg-amber-900/90 border-amber-950/60 shadow-none'
                                }`}
                                style={{ left: `${x}%`, top: `${y}%` }}
                            />
                        );
                    })}

                    {/* TOP GOLD 3D FLAPPER / NEEDLE POINTER */}
                    <div className="absolute -top-4 z-30 flex flex-col items-center pointer-events-none drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]">
                        <div 
                            className={`transition-transform duration-75 origin-top ${
                                isSpinning && pointerBounced ? '-rotate-8' : 'rotate-0'
                            }`}
                        >
                            {/* Gold 3D Flapper Body */}
                            <div 
                                className="w-10 h-12 sm:w-12 sm:h-14 bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600 border-2 border-yellow-100 flex items-center justify-center shadow-2xl"
                                style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }}
                            >
                                <div className="w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white -mt-4 shadow-inner animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* ROTATING SVG WHEEL */}
                    <div
                        className="w-[280px] h-[280px] sm:w-[370px] sm:h-[370px] md:w-[410px] md:h-[410px] rounded-full overflow-hidden z-10 shadow-2xl"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transitionDuration: isSpinning ? '4500ms' : '0ms',
                            transitionTimingFunction: 'cubic-bezier(0.12, 0.95, 0.22, 1)',
                        }}
                    >
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            <defs>
                                {SECTORS.map((s, i) => (
                                    <radialGradient key={i} id={`wheel-grad-${i}`} cx="50%" cy="50%" r="50%">
                                        <stop offset="25%" stopColor={s.accent} stopOpacity="0.9" />
                                        <stop offset="70%" stopColor={s.color} />
                                        <stop offset="100%" stopColor="#050811" stopOpacity="0.95" />
                                    </radialGradient>
                                ))}
                            </defs>

                            {SECTORS.map((sector, i) => {
                                const angle = 360 / 8;
                                const startAngle = i * angle;
                                const endAngle = startAngle + angle;

                                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                                // Text angle & placement
                                const textAngle = startAngle + angle / 2;
                                const tx = 50 + 34 * Math.cos((Math.PI * textAngle) / 180);
                                const ty = 50 + 34 * Math.sin((Math.PI * textAngle) / 180);

                                return (
                                    <g key={i}>
                                        {/* Sector Pie Slice */}
                                        <path
                                            d={pathData}
                                            fill={`url(#wheel-grad-${i})`}
                                            stroke="#f59e0b"
                                            strokeWidth="0.8"
                                        />
                                        
                                        {/* Outer chrome dividing peg */}
                                        <circle
                                            cx={x1}
                                            cy={y1}
                                            r="1.4"
                                            fill="#fffbeb"
                                            stroke="#b45309"
                                            strokeWidth="0.5"
                                        />

                                        {/* Sector Label */}
                                        <text
                                            x={tx}
                                            y={ty}
                                            fill={sector.textColor}
                                            fontSize="5.4"
                                            fontWeight="900"
                                            fontFamily="ui-sans-serif, system-ui, sans-serif"
                                            textAnchor="middle"
                                            dominantBaseline="central"
                                            transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                                            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-wider select-none"
                                        >
                                            {sector.label}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>

                    {/* 3D MULTI-TIER GOLD CENTER HUB */}
                    <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-400 to-amber-300 border-4 border-[#070b14] shadow-[0_0_35px_rgba(0,0,0,0.95)] flex items-center justify-center z-20">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-[#182030] to-[#070b14] border-2 border-amber-400 flex flex-col items-center justify-center shadow-inner">
                            <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_#f59e0b]" />
                            <span className="text-[8px] sm:text-[9px] font-black text-amber-300 tracking-tighter uppercase mt-0.5">ROYAL</span>
                        </div>
                    </div>

                </div>

                {/* WIN PRIZE ALERT */}
                {wonPrize && (
                    <div className="mt-3 p-4 bg-gradient-to-r from-emerald-600/40 via-emerald-500/25 to-teal-500/40 border-2 border-emerald-400/80 rounded-2xl w-full text-emerald-200 shadow-2xl shadow-emerald-500/25 animate-in zoom-in-95">
                        <div className="text-xs uppercase font-black tracking-widest text-emerald-300">JACKPOT WINNER!</div>
                        <div className="text-3xl font-black text-white mt-0.5">You won +{wonPrize}!</div>
                        <div className="text-xs text-emerald-100/90 mt-0.5 font-semibold">Coins have been credited directly to your balance</div>
                    </div>
                )}

                {errorMsg && (
                    <div className="mt-3 p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl w-full text-rose-300 text-xs">
                        {errorMsg}
                    </div>
                )}

                {/* ACTION / SPIN BUTTONS */}
                <div className="mt-4 w-full flex flex-col items-center gap-3">
                    {canSpin ? (
                        <button
                            onClick={handleSpin}
                            disabled={isSpinning}
                            className="w-full py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 hover:from-amber-400 hover:to-yellow-200 text-black font-black text-lg sm:text-2xl tracking-wider uppercase shadow-[0_0_40px_rgba(245,158,11,0.5)] active:scale-98 transition transform cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSpinning ? (
                                <span className="animate-pulse">SPINNING THE WHEEL...</span>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6 stroke-[2.5]" />
                                    <span>SPIN FOR FREE</span>
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="w-full py-4 px-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-slate-300 text-xs sm:text-sm font-semibold shadow-inner">
                            <div className="flex items-center gap-2.5 text-slate-400">
                                <Clock className="w-5 h-5 text-amber-400" />
                                <span>Next Free Spin Available in:</span>
                            </div>
                            <span className="text-amber-400 font-mono font-bold text-sm sm:text-base bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                                {formatTime(secondsLeft)}
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
