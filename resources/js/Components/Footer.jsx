import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Crown, ShieldCheck, Lock, Award, HeartHandshake, Mail, Phone, MapPin, BookOpen, FileText, Sparkles, Zap, Trophy, ShieldAlert, CheckCircle2 } from 'lucide-react';
import LegalModal from './LegalModal';

export default function Footer({ company = {} }) {
    const [legalType, setLegalType] = useState(null);

    return (
        <footer className="w-full bg-[#07090e] border-t border-slate-800/90 pt-12 pb-12 text-slate-400 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
                
                {/* Providers Showcase Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4 border-y border-slate-800/60 opacity-80">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500">
                        Official Game Providers:
                    </span>
                    <span className="font-heading font-black text-slate-300 text-xs sm:text-sm tracking-wider hover:text-amber-400 transition">PRAGMATIC PLAY</span>
                    <span className="font-heading font-black text-slate-300 text-xs sm:text-sm tracking-wider hover:text-emerald-400 transition">PG SOFT</span>
                    <span className="font-heading font-black text-slate-300 text-xs sm:text-sm tracking-wider hover:text-rose-400 transition">HACKSAW GAMING</span>
                    <span className="font-heading font-black text-slate-300 text-xs sm:text-sm tracking-wider hover:text-yellow-400 transition">AMUSNET</span>
                    <span className="font-heading font-black text-slate-300 text-xs sm:text-sm tracking-wider hover:text-purple-400 transition">NOLIMIT CITY</span>
                    <span className="font-heading font-black text-slate-300 text-xs sm:text-sm tracking-wider hover:text-blue-400 transition">EVOLUTION</span>
                </div>

                {/* Main 4-Column Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    {/* Col 1: About & Logo */}
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="RoyalPlay Social Casino"
                                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                            />
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            RoyalPlay Social Casino is a next-generation social gaming platform powered by seamless wallet mechanics and certified fair slot algorithms. Play for fun with daily free coins.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                                18+ ADULTS ONLY
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
                                CERTIFIED RNG
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black">
                                NO PURCHASE REQ.
                            </span>
                        </div>
                    </div>

                    {/* Col 2: Player Guides & Strategy Articles */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                            <span>Guides & Articles</span>
                        </h4>
                        <ul className="space-y-2 text-[11px]">
                            <li>
                                <Link href="/guides/how-it-works" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:bg-amber-400 transition" />
                                    <span>How Social Casinos Work</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides/rtp-volatility" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 group-hover:bg-amber-400 transition" />
                                    <span>RTP & Volatility Explained</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides/vip-rewards" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 group-hover:bg-amber-400 transition" />
                                    <span>VIP Loyalty Club & Tier Rewards</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides/slots-strategy" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 group-hover:bg-amber-400 transition" />
                                    <span>Bonus Buy & Megaways™ Guide</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/fair-play" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:bg-amber-400 transition" />
                                    <span>Fair Play & RNG Mathematics</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Legal & Regulatory Policies */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span>Legal & Compliance</span>
                        </h4>
                        <ul className="space-y-2 text-[11px]">
                            <li>
                                <Link href="/terms" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition" />
                                    <span>Terms of Service</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition" />
                                    <span>Privacy & Data Protection (GDPR)</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/responsible-gaming" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition" />
                                    <span>Responsible Social Gaming</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/kyc-aml" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition" />
                                    <span>KYC & Anti-Fraud Policy</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/payment-security" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition" />
                                    <span>Payment Security & PCI-DSS</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition" />
                                    <span>Cookie Preferences</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/sweepstakes-rules" className="hover:text-amber-400 transition cursor-pointer flex items-center gap-1.5 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-amber-400 transition" />
                                    <span>Sweepstakes & Coin Rules</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 4: Corporate Licensing & Support */}
                    <div className="space-y-3 font-mono text-[11px]">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-sans flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-amber-400" />
                            <span>Corporate & Licensing</span>
                        </h4>
                        <div className="space-y-2 text-slate-400 font-sans">
                            <div className="flex items-start gap-1.5 text-xs">
                                <span>{company.name || 'RoyalPlay Entertainment N.V.'}, {company.address || 'Heelsumstraat 51, E-Commerce Park, Willemstad, Curaçao'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 pt-1">
                                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <a href="mailto:support@royalplay.social" className="text-slate-300 hover:text-amber-400 font-mono transition">
                                    {company.email || 'support@royalplay.social'}
                                </a>
                            </div>
                            <div className="pt-2 text-[10px] text-slate-500 font-mono space-y-1">
                                <div>License: <strong className="text-amber-400/90">{company.license || 'OGL/2026/184/0129'}</strong></div>
                                <div>Reg. Number: <strong className="text-slate-300">{company.reg_number || '164829'}</strong></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Payment Security & Trust Seals Bar */}
                <div className="pt-8 border-t border-slate-800/80">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0c1018] p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
                        
                        {/* Payment Cards and PCI DSS Logos */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                Secure Payments:
                            </span>

                            {/* Visa */}
                            <div className="bg-white/95 px-3 py-1.5 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform" title="Visa 3D Secure">
                                <img
                                    src="/images/payments/visa.png"
                                    alt="Visa"
                                    className="h-5 sm:h-6 w-auto object-contain"
                                />
                            </div>

                            {/* Mastercard */}
                            <div className="bg-white/95 px-3 py-1.5 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform" title="Mastercard Identity Check">
                                <img
                                    src="/images/payments/mastercard.png"
                                    alt="Mastercard"
                                    className="h-5 sm:h-6 w-auto object-contain"
                                />
                            </div>

                            {/* PCI-DSS Compliant */}
                            <div className="bg-white/95 px-3 py-1.5 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform" title="PCI DSS Level 1 Certified">
                                <img
                                    src="/images/payments/pci-dss.png"
                                    alt="PCI DSS Compliant"
                                    className="h-5 sm:h-6 w-auto object-contain"
                                />
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>SSL 256-Bit</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>Nexus GGR Gold</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                                <HeartHandshake className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span>BeGambleAware</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Bottom Copyright & Disclaimer */}
                <div className="pt-6 border-t border-slate-800/60 text-center space-y-2 text-[10px] text-slate-500">
                    <p>
                        © 2026 {company.name || 'RoyalPlay Entertainment N.V.'}. All Rights Reserved. RoyalPlay is a free-to-play social casino intended for amusement and entertainment purposes only. Standard Coins (SC) have no real monetary value and cannot be redeemed for fiat currency.
                    </p>
                    <p className="text-slate-600">
                        Games on this platform are provided by licensed external gaming studios under certified RNG testing certificates.
                    </p>
                </div>

            </div>

            {/* Legal Modal Popup */}
            <LegalModal
                isOpen={!!legalType}
                onClose={() => setLegalType(null)}
                type={legalType || 'terms'}
                company={company}
            />
        </footer>
    );
}
