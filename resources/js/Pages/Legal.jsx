import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import StoreModal from '../Components/StoreModal';
import WheelOfFortuneModal from '../Components/WheelOfFortuneModal';
import VipModal from '../Components/VipModal';
import AuthModal from '../Components/AuthModal';
import {
    Scale,
    ShieldCheck,
    Lock,
    HeartHandshake,
    FileText,
    Award,
    AlertCircle,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Mail,
    Building,
    BadgeCheck,
    ExternalLink
} from 'lucide-react';

const TABS = [
    { id: 'terms', title: 'Terms of Service', icon: Scale, subtitle: 'User agreement, coins & platform terms' },
    { id: 'privacy', title: 'Privacy & Cookies', icon: Lock, subtitle: 'GDPR, data safety & security policy' },
    { id: 'responsible', title: 'Responsible Gaming', icon: HeartHandshake, subtitle: 'Play limits, self-exclusion & safety' },
    { id: 'fairplay', title: 'Fair Play & RNG', icon: Award, subtitle: 'Certified reels, odds & audit proof' },
    { id: 'kyc', title: 'KYC & Anti-Fraud', icon: ShieldCheck, subtitle: 'Identity verification & safety standards' },
];

export default function Legal({ auth, initialTab = 'terms', company = {} }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [storeOpen, setStoreOpen] = useState(false);
    const [wheelOpen, setWheelOpen] = useState(false);
    const [vipOpen, setVipOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const currentTabInfo = TABS.find((t) => t.id === activeTab) || TABS[0];

    return (
        <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
            <Head title={`${currentTabInfo.title} — RoyalPlay Legal & Regulatory Compliance`} />

            {/* Header */}
            <Header
                user={auth?.user}
                onOpenStore={() => setStoreOpen(true)}
                onOpenWheel={() => setWheelOpen(true)}
                onOpenVip={() => setVipOpen(true)}
                onOpenAuth={(mode = 'login') => {
                    setAuthMode(mode);
                    setAuthOpen(true);
                }}
            />

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
                
                {/* Breadcrumbs & Title Bar */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <Link href="/" className="hover:text-amber-400 transition flex items-center gap-1">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Casino Lobby
                        </Link>
                        <span>/</span>
                        <span>Legal & Compliance</span>
                        <span>/</span>
                        <span className="text-amber-400 font-bold">{currentTabInfo.title}</span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                                <span className="p-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 inline-flex">
                                    <currentTabInfo.icon className="w-6 h-6" />
                                </span>
                                <span>{currentTabInfo.title}</span>
                            </h1>
                            <p className="text-xs md:text-sm text-slate-400 mt-1">
                                {currentTabInfo.subtitle} • Last updated: September 2026
                            </p>
                        </div>

                        {/* License Certificate Pill */}
                        <div className="px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                            <BadgeCheck className="w-5 h-5 text-emerald-400" />
                            <div className="text-xs font-mono">
                                <div className="text-slate-400 text-[10px] uppercase">Official License</div>
                                <div className="font-bold text-slate-200">{company.license || 'OGL/2026/184/0129'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout: Sidebar Navigation + Rich Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Navigation Sidebar */}
                    <aside className="lg:col-span-4 space-y-4">
                        <div className="bg-[#0e131f] border border-slate-800 rounded-3xl p-3 space-y-1 shadow-xl">
                            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">
                                Compliance Navigation
                            </div>
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            window.history.pushState(null, '', `/${tab.id === 'terms' ? 'terms' : tab.id === 'privacy' ? 'privacy' : tab.id === 'responsible' ? 'responsible-gaming' : tab.id === 'fairplay' ? 'fair-play' : 'kyc-aml'}`);
                                        }}
                                        className={`w-full p-3.5 rounded-2xl text-left transition flex items-center justify-between cursor-pointer ${
                                            isActive
                                                ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                                                : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${isActive ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold">{tab.title}</div>
                                                <div className="text-[10px] text-slate-500">{tab.subtitle}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Corporate Card */}
                        <div className="bg-[#0e131f] border border-slate-800 rounded-3xl p-5 space-y-3 text-xs font-mono text-slate-400">
                            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase font-sans">
                                <Building className="w-4 h-4 text-amber-400" />
                                <span>Operating Company</span>
                            </div>
                            <div className="space-y-1 text-[11px] pt-1">
                                <div>Entity: <strong className="text-slate-200">{company.name || 'RoyalPlay Entertainment N.V.'}</strong></div>
                                <div>Registration: <strong className="text-slate-200">{company.reg_number || '164829'}</strong></div>
                                <div>Address: <strong className="text-slate-200">{company.address || 'Heelsumstraat 51, Willemstad, Curaçao'}</strong></div>
                            </div>
                            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                                <span>Support:</span>
                                <a href="mailto:support@royalplay.io" className="text-amber-400 hover:underline flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> support@royalplay.io
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* Document View Content Area */}
                    <div className="lg:col-span-8 bg-[#0c1018] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed shadow-2xl">
                        
                        {/* 1. TERMS OF SERVICE */}
                        {activeTab === 'terms' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">RoyalPlay Terms & Conditions of Use</h2>
                                    <p className="text-xs text-slate-400 mt-1">Please read these Terms carefully before engaging with our platform services.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-200 leading-relaxed">
                                        <strong>Social Gaming Notice:</strong> RoyalPlay is a free-to-play social casino intended exclusively for entertainment purposes for players aged 18 and older. Virtual Coins (SC) have no cash value and cannot be exchanged for real money.
                                    </div>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Eligibility & Account Security
                                    </h3>
                                    <p>You must be at least 18 years of age (or the legal age of majority in your jurisdiction) to open an account or play games on RoyalPlay. Only one account per person, household, IP address, and device is permitted. Accounts found to be duplicate, automated, or operated by third parties are subject to immediate suspension.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Virtual Game Balances & Wallet Mechanics
                                    </h3>
                                    <p>All virtual coins and balances (Standard Coins / SC) are non-transferable, cannot be redeemed for fiat currency, and remain the property of RoyalPlay Entertainment N.V. Game outcomes and balance transfers are managed via secure Seamless Wallet protocols directly integrated with certified provider servers.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">3</span>
                                        VIP Points & Loyalty Tiers
                                    </h3>
                                    <p>VIP Loyalty Points are granted upon coin package deposits. VIP points grant access to higher tier levels, increased daily bonus allocations, and exclusive gameplay features. RoyalPlay reserves the right to adjust reward schedules and VIP perk tier thresholds with appropriate platform notification.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">4</span>
                                        Prohibited Activities & Fair Play Enforcement
                                    </h3>
                                    <p>Users may not exploit software vulnerabilities, use automated scripts, bot engines, VPN obfuscation to bypass country restrictions, or engage in collusive behavior. Any manipulated transactions or balance tampering will result in immediate termination of access under Curaçao regulatory compliance.</p>
                                </section>
                            </div>
                        )}

                        {/* 2. PRIVACY POLICY */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">Privacy & Cookie Policy</h2>
                                    <p className="text-xs text-slate-400 mt-1">How RoyalPlay collects, encrypts, and protects your personal data under GDPR & international privacy standards.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-emerald-200 leading-relaxed">
                                        <strong>256-Bit SSL Encryption:</strong> All data transmissions between your browser and our high-availability cluster are encrypted end-to-end using TLS 1.3 cryptographic protocols.
                                    </div>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Information We Collect
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                                        <li><strong>Account Data:</strong> Full name, verified email address, date of birth, phone number, and residential country.</li>
                                        <li><strong>Gameplay Telemetry:</strong> Bet history, session duration, RNG round transaction IDs, and wallet adjustments.</li>
                                        <li><strong>Technical Logs:</strong> IP address, device fingerprints, browser version, and essential operational cookies.</li>
                                    </ul>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Your GDPR Rights
                                    </h3>
                                    <p>Under the General Data Protection Regulation (GDPR) and global privacy directives, you possess the right to access your stored data, request full erasure (Right to be Forgotten), and restrict telemetry processing by contacting our Data Protection Officer at <a href="mailto:dpo@royalplay.io" className="text-amber-400 underline">dpo@royalplay.io</a>.</p>
                                </section>
                            </div>
                        )}

                        {/* 3. RESPONSIBLE GAMING */}
                        {activeTab === 'responsible' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">Responsible Social Gaming</h2>
                                    <p className="text-xs text-slate-400 mt-1">Our commitment to player well-being, healthy habits, and social casino entertainment safety.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                                    <HeartHandshake className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-cyan-200 leading-relaxed">
                                        <strong>Play for Fun:</strong> Social casino games are meant to provide enjoyable entertainment. Set healthy boundaries, take regular breaks, and treat gaming as casual leisure.
                                    </div>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Player Safety & Self-Exclusion Tools
                                    </h3>
                                    <p>If you feel you need a break from playing, RoyalPlay provides tools to assist:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                                            <div className="font-bold text-white text-xs">⏱️ Session Time Limits</div>
                                            <div className="text-[11px] text-slate-400">Set automatic notifications or timeouts after prolonged gameplay.</div>
                                        </div>
                                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                                            <div className="font-bold text-white text-xs">🛑 Self-Exclusion</div>
                                            <div className="text-[11px] text-slate-400">Temporarily or permanently close your account upon request.</div>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Independent Support Organizations
                                    </h3>
                                    <p>If you or someone you know is seeking guidance on responsible gaming habits, please consult these certified international resources:</p>
                                    <ul className="space-y-2 pt-1 font-mono text-xs">
                                        <li className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                                            <span className="text-slate-200">BeGambleAware (UK & Europe)</span>
                                            <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                                                Visit Site <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </li>
                                        <li className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                                            <span className="text-slate-200">Gambling Therapy Helpline</span>
                                            <a href="https://www.gamblingtherapy.org" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                                                Visit Site <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </li>
                                    </ul>
                                </section>
                            </div>
                        )}

                        {/* 4. FAIR PLAY & RNG */}
                        {activeTab === 'fairplay' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">Fair Play & RNG Mathematics</h2>
                                    <p className="text-xs text-slate-400 mt-1">Audit verification, Return to Player (RTP) specifications, and reel randomness standards.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                                    <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-200 leading-relaxed">
                                        <strong>Certified RNG:</strong> Every spin, reel stop, scatter distribution, and multiplier on RoyalPlay is computed using cryptographically secure hardware RNG algorithms audited by accredited testing laboratories.
                                    </div>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Audited Game Providers
                                    </h3>
                                    <p>All slot mechanics featured on RoyalPlay are developed by tier-one providers including Pragmatic Play, PG Soft, Amusnet, Hacksaw Gaming, and NoLimit City. Each provider holds active testing seals from <strong>BMM Testlabs, eCOGRA, and Gaming Laboratories International (GLI)</strong>.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Theoretical Return to Player (RTP)
                                    </h3>
                                    <p>Our slot library maintains certified theoretical RTP rates ranging between <strong>94.00% and 97.50%</strong>. Game rules, paytable breakdowns, and volatility indexes are permanently accessible directly within each game interface.</p>
                                </section>
                            </div>
                        )}

                        {/* 5. KYC & AML COMPLIANCE */}
                        {activeTab === 'kyc' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">KYC & Anti-Money Laundering (AML)</h2>
                                    <p className="text-xs text-slate-400 mt-1">Identity verification, age confirmation, and fraud prevention protocols.</p>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Identity & Age Verification (18+)
                                    </h3>
                                    <p>To uphold legal licensing requirements and protect minors from online gaming access, RoyalPlay performs automated and manual identity verification checks. We verify player identity against international databases and age registries.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Anti-Fraud Monitoring
                                    </h3>
                                    <p>Our risk monitoring system analyzes transaction integrity in real-time. Accounts exhibiting multi-accounting, chargeback abuse, or suspicious automated bot patterns will be investigated and permanently restricted.</p>
                                </section>
                            </div>
                        )}

                    </div>

                </div>

            </main>

            {/* Footer */}
            <Footer company={company} />

            {/* Modals */}
            <StoreModal isOpen={storeOpen} onClose={() => setStoreOpen(false)} user={auth?.user} />
            <WheelOfFortuneModal isOpen={wheelOpen} onClose={() => setWheelOpen(false)} user={auth?.user} />
            <VipModal isOpen={vipOpen} onClose={() => setVipOpen(false)} user={auth?.user} />
            <AuthModal isOpen={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} />
        </div>
    );
}
