import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Crown, ShieldCheck, Lock, Award, HeartHandshake, Mail, Phone, MapPin } from 'lucide-react';
import LegalModal from './LegalModal';

export default function Footer({ company = {} }) {
    const [legalType, setLegalType] = useState(null);

    return (
        <footer className="w-full bg-[#07090e] border-t border-slate-800/90 pt-12 pb-8 text-slate-400 text-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
                
                {/* Providers Showcase Bar */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4 border-y border-slate-800/60 opacity-70">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-slate-500">
                        Official Game Partners:
                    </span>
                    <span className="font-heading font-black text-slate-300 text-sm tracking-wider">PRAGMATIC PLAY</span>
                    <span className="font-heading font-black text-slate-300 text-sm tracking-wider">PG SOFT</span>
                    <span className="font-heading font-black text-slate-300 text-sm tracking-wider">HACKSAW GAMING</span>
                    <span className="font-heading font-black text-slate-300 text-sm tracking-wider">AMUSNET</span>
                    <span className="font-heading font-black text-slate-300 text-sm tracking-wider">NOLIMIT CITY</span>
                    <span className="font-heading font-black text-slate-300 text-sm tracking-wider">EVOLUTION</span>
                </div>

                {/* Main 4-Column Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    
                    {/* Col 1: About & Logo */}
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <img
                                src="/images/logo.png"
                                alt="RoyalPlay Social Casino"
                                className="h-14 w-auto object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                            />
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            RoyalPlay Social Casino is a next-generation social gaming platform powered by seamless wallet mechanics and certified fair slot algorithms.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                            <span className="px-2 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black">
                                18+ ONLY
                            </span>
                            <span className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black">
                                CERTIFIED RNG
                            </span>
                        </div>
                    </div>

                    {/* Col 2: Legal & Information Links */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Legal & Fair Play</h4>
                        <ul className="space-y-1.5">
                            <li>
                                <Link href="/terms" className="hover:text-amber-400 transition cursor-pointer">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-amber-400 transition cursor-pointer">
                                    Privacy & Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/fair-play" className="hover:text-amber-400 transition cursor-pointer">
                                    Fair Play & RNG Audit
                                </Link>
                            </li>
                            <li>
                                <Link href="/responsible-gaming" className="hover:text-amber-400 transition cursor-pointer">
                                    Responsible Social Gaming
                                </Link>
                            </li>
                            <li>
                                <Link href="/kyc-aml" className="hover:text-amber-400 transition cursor-pointer">
                                    KYC & Anti-Fraud Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Col 3: Trust & Security Badges */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Security & Trust</h4>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-[11px] text-slate-300">SSL 256-Bit Encrypted Platform</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="text-[11px] text-slate-300">Nexus GGR Seamless Wallet Verified</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HeartHandshake className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span className="text-[11px] text-slate-300">BeGambleAware Support Standards</span>
                            </div>
                        </div>
                    </div>

                    {/* Col 4: Corporate Licensing Info */}
                    <div className="space-y-2.5 font-mono text-[11px]">
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 font-sans">
                            Corporate Details
                        </h4>
                        <div className="space-y-1.5 text-slate-400">
                            <div className="flex items-start gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>{company.name || 'Crowdplay Entertainment N.V.'}, {company.address || 'Heelsumstraat 51, Willemstad, Curaçao'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="text-slate-300">{company.email || 'support@crowdplaycasino.com'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                <span className="text-slate-300">{company.phone || '+357 22 123 456'}</span>
                            </div>
                            <div className="pt-1 text-[10px] text-slate-500">
                                License: <strong className="text-amber-400/90">{company.license || 'OGL/2026/184/0129'}</strong> • Reg: {company.reg_number || '164829'}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Copyright & Disclaimer */}
                <div className="pt-8 border-t border-slate-800/80 text-center space-y-2 text-[10px] text-slate-500">
                    <p>
                        © 2026 {company.name || 'RoyalPlay Entertainment N.V.'}. All Rights Reserved. RoyalPlay is a free-to-play social casino intended for amusement purposes only. Virtual currency has no cash value.
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
