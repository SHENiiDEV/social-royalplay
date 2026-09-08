import React from 'react';
import { X, ShieldCheck, Scale, FileText, AlertCircle } from 'lucide-react';

export default function LegalModal({ isOpen, onClose, type = 'terms', company = {} }) {
    if (!isOpen) return null;

    const titles = {
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        fairplay: 'Fair Play & RNG Certification',
        responsible: 'Responsible Social Gaming',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c1018] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <Scale className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg md:text-xl font-bold text-white">
                            {titles[type] || 'Legal Information'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-4 text-xs md:text-sm text-slate-300 space-y-4 leading-relaxed font-sans pr-2">
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 font-mono text-[11px] text-slate-400">
                        <div>Operating Entity: <strong className="text-slate-200">{company.name || 'RoyalPlay Entertainment N.V.'}</strong></div>
                        <div>Official License: <strong className="text-amber-400">{company.license || 'OGL/2026/184/0129'}</strong></div>
                        <div>Registration Number: <strong className="text-slate-200">{company.reg_number || '164829'}</strong></div>
                        <div>Registered Address: <strong className="text-slate-200">{company.address || 'Heelsumstraat 51, Willemstad, Curaçao'}</strong></div>
                    </div>

                    {type === 'terms' && (
                        <>
                            <h3 className="text-sm font-bold text-white">1. Platform Eligibility</h3>
                            <p>RoyalPlay Social Casino is strictly available to individuals aged 18 years or older. All virtual credits, gold coins, and bonus balances have no real-world monetary value and are non-transferable.</p>
                            <h3 className="text-sm font-bold text-white">2. Seamless Wallet & Gameplay Integrity</h3>
                            <p>Our server executes all spins via direct cryptographic RNG connections with verified game providers including Pragmatic Play, PG Soft, Amusnet, and Hacksaw Gaming under strict audit compliance.</p>
                        </>
                    )}

                    {type === 'fairplay' && (
                        <>
                            <h3 className="text-sm font-bold text-white">Certified Random Number Generation</h3>
                            <p>All slot mechanics, scatter allocations, and jackpot outcomes are calculated with industry-standard BMM Testlabs and eCOGRA certified mathematical random number generators.</p>
                        </>
                    )}

                    {type === 'responsible' && (
                        <>
                            <h3 className="text-sm font-bold text-white">Responsible Social Entertainment</h3>
                            <p>Social casino gaming is intended purely for fun and entertainment. Set time limits, take breaks, and remember that social casino gaming does not imply future success at real money gambling.</p>
                        </>
                    )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
