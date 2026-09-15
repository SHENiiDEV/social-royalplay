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
    ExternalLink,
    CreditCard,
    Cookie,
    Gift,
    BookOpen,
    HelpCircle,
    Sparkles,
    Flame,
    Zap,
    Trophy
} from 'lucide-react';

const LEGAL_TABS = [
    { id: 'terms', title: 'Terms of Service', icon: Scale, subtitle: 'User agreement, coins & platform terms', path: '/terms' },
    { id: 'privacy', title: 'Privacy & Data Protection', icon: Lock, subtitle: 'GDPR, data safety & security policy', path: '/privacy' },
    { id: 'responsible', title: 'Responsible Social Gaming', icon: HeartHandshake, subtitle: 'Play limits, self-exclusion & safety', path: '/responsible-gaming' },
    { id: 'fairplay', title: 'Fair Play & RNG Audit', icon: Award, subtitle: 'Certified reels, odds & audit proof', path: '/fair-play' },
    { id: 'kyc', title: 'KYC & Anti-Fraud Policy', icon: ShieldCheck, subtitle: 'Identity verification & safety standards', path: '/kyc-aml' },
    { id: 'payments', title: 'Payment Security & PCI-DSS', icon: CreditCard, subtitle: 'Encrypted checkout, Visa & Mastercard', path: '/payment-security' },
    { id: 'cookies', title: 'Cookie Policy', icon: Cookie, subtitle: 'Analytics, essentials & consent choices', path: '/cookies' },
    { id: 'sweepstakes', title: 'Sweepstakes & Coin Rules', icon: Gift, subtitle: 'Complimentary coin rules & gameplay', path: '/sweepstakes-rules' },
];

const ARTICLE_TABS = [
    { id: 'guide_social', title: 'How Social Casinos Work', icon: BookOpen, subtitle: 'Beginners guide to virtual coins & free play', path: '/guides/how-it-works' },
    { id: 'guide_rtp', title: 'RTP & Volatility Explained', icon: Zap, subtitle: 'Mathematical breakdown of odds & hit frequency', path: '/guides/rtp-volatility' },
    { id: 'guide_vip', title: 'VIP Loyalty Program & Perks', icon: Trophy, subtitle: 'Tier progression, wheel boosts & bonuses', path: '/guides/vip-rewards' },
    { id: 'guide_slots', title: 'Slot Mechanics & Bonus Buy', icon: Sparkles, subtitle: 'Megaways, cascading reels & feature buys', path: '/guides/slots-strategy' },
];

const ALL_TABS = [...LEGAL_TABS, ...ARTICLE_TABS];

export default function Legal({ auth, initialTab = 'terms', company = {} }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [storeOpen, setStoreOpen] = useState(false);
    const [wheelOpen, setWheelOpen] = useState(false);
    const [vipOpen, setVipOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const currentTabInfo = ALL_TABS.find((t) => t.id === activeTab) || ALL_TABS[0];
    const isArticle = ARTICLE_TABS.some((t) => t.id === activeTab);

    return (
        <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
            <Head title={`${currentTabInfo.title} — RoyalPlay Legal & Guides`} />

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
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8 pb-20">
                
                {/* Breadcrumbs & Title Bar */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                        <Link href="/" className="hover:text-amber-400 transition flex items-center gap-1">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Casino Lobby
                        </Link>
                        <span>/</span>
                        <span>{isArticle ? 'Articles & Guides' : 'Legal & Compliance'}</span>
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
                        
                        {/* Legal Documents Nav Box */}
                        <div className="bg-[#0e131f] border border-slate-800 rounded-3xl p-3 space-y-1 shadow-xl">
                            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                                <span>Legal Policies</span>
                                <Scale className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            {LEGAL_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            window.history.pushState(null, '', tab.path);
                                        }}
                                        className={`w-full p-2.5 sm:p-3 rounded-2xl text-left transition flex items-center justify-between cursor-pointer ${
                                            isActive
                                                ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                                                : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold">{tab.title}</div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{tab.subtitle}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-amber-400 translate-x-1' : 'text-slate-600'}`} />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Articles & Guides Nav Box */}
                        <div className="bg-[#0e131f] border border-slate-800 rounded-3xl p-3 space-y-1 shadow-xl">
                            <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                                <span>Player Guides & Articles</span>
                                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                            </div>
                            {ARTICLE_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveTab(tab.id);
                                            window.history.pushState(null, '', tab.path);
                                        }}
                                        className={`w-full p-2.5 sm:p-3 rounded-2xl text-left transition flex items-center justify-between cursor-pointer ${
                                            isActive
                                                ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                                                : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`p-1.5 rounded-xl ${isActive ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold">{tab.title}</div>
                                                <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{tab.subtitle}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-emerald-400 translate-x-1' : 'text-slate-600'}`} />
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
                                <a href="mailto:support@royalplay.social" className="text-amber-400 hover:underline flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> support@royalplay.social
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
                                    <p>Under the General Data Protection Regulation (GDPR) and global privacy directives, you possess the right to access your stored data, request full erasure (Right to be Forgotten), and restrict telemetry processing by contacting our Data Protection Officer at <a href="mailto:dpo@royalplay.social" className="text-amber-400 underline">dpo@royalplay.social</a>.</p>
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

                        {/* 6. PAYMENT SECURITY & PCI-DSS */}
                        {activeTab === 'payments' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">Payment Security & PCI-DSS Compliance</h2>
                                    <p className="text-xs text-slate-400 mt-1">Industry-standard financial data protection, Visa, Mastercard, and encrypted checkout protocols.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-start gap-3">
                                    <CreditCard className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-blue-200 leading-relaxed">
                                        <strong>PCI-DSS Level 1 Security:</strong> All card processing complies with Payment Card Industry Data Security Standards (PCI-DSS). RoyalPlay never stores your raw credit card number or CVV code on local servers.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                                        <img src="/images/payments/visa.png" alt="Visa" className="h-8 object-contain" />
                                        <span className="text-xs font-bold text-white">Verified by Visa</span>
                                        <span className="text-[10px] text-slate-400">3D Secure 2.0 Auth</span>
                                    </div>
                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                                        <img src="/images/payments/mastercard.png" alt="Mastercard" className="h-8 object-contain" />
                                        <span className="text-xs font-bold text-white">Mastercard Identity Check</span>
                                        <span className="text-[10px] text-slate-400">Biometric & SMS token</span>
                                    </div>
                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                                        <img src="/images/payments/pci-dss.png" alt="PCI DSS" className="h-8 object-contain" />
                                        <span className="text-xs font-bold text-emerald-400">PCI-DSS Compliant</span>
                                        <span className="text-[10px] text-slate-400">Audited Payment Gateways</span>
                                    </div>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Coin Package Purchases
                                    </h3>
                                    <p>When purchasing optional coin packs, funds are transferred securely via tokenized payment gateways. All purchases immediately credit your Standard Coins (SC) and corresponding VIP points instantly.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Refund & Dispute Resolution
                                    </h3>
                                    <p>Because virtual coins are consumed upon gameplay engagement, purchases are generally final. However, if a technical glitch prevents coin delivery, our support team at <a href="mailto:support@royalplay.social" className="text-amber-400 underline">support@royalplay.social</a> will review transaction logs and reissue balance within 24 business hours.</p>
                                </section>
                            </div>
                        )}

                        {/* 7. COOKIE POLICY */}
                        {activeTab === 'cookies' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">Cookie Policy & Preferences</h2>
                                    <p className="text-xs text-slate-400 mt-1">Understanding how cookies enhance your social casino gameplay and protect your session state.</p>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Essential Operational Cookies
                                    </h3>
                                    <p>These cookies are strictly required to keep you signed in, preserve your active game session, prevent CSRF attacks, and ensure fair jackpot distribution across seamless wallet instances.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Managing Cookie Settings
                                    </h3>
                                    <p>You can adjust or disable cookie storage via your web browser settings. Note that disabling essential session cookies may impair your ability to log in or launch slot game sessions.</p>
                                </section>
                            </div>
                        )}

                        {/* 8. SWEEPSTAKES & COIN RULES */}
                        {activeTab === 'sweepstakes' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <h2 className="text-xl font-black text-white">Free Coins & Sweepstakes Rules</h2>
                                    <p className="text-xs text-slate-400 mt-1">How complimentary Standard Coins are distributed with No Purchase Necessary.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                                    <Gift className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div className="text-xs text-amber-200 leading-relaxed">
                                        <strong>No Purchase Necessary:</strong> Every player receives complimentary Standard Coins every single day via the Daily Login Bonus and the Daily Wheel of Fortune without any obligation to make a deposit.
                                    </div>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">1</span>
                                        Daily Free 1.00 SC Claim
                                    </h3>
                                    <p>All active accounts can claim a free SC 1.00 daily allowance directly in the Coin Store once every 24 hours. The bonus resets at 00:00 UTC.</p>
                                </section>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                                        Daily Wheel of Fortune
                                    </h3>
                                    <p>Players are entitled to 1 free spin on the Wheel of Fortune every 24 hours with guaranteed bonus allocations between SC 1.00 and SC 10.00.</p>
                                </section>
                            </div>
                        )}

                        {/* 9. GUIDE: HOW SOCIAL CASINOS WORK */}
                        {activeTab === 'guide_social' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                                        Beginner's Guide
                                    </span>
                                    <h2 className="text-xl font-black text-white mt-2">How Social Casinos & Virtual Coins Work</h2>
                                    <p className="text-xs text-slate-400 mt-1">A comprehensive walkthrough of social gaming mechanics, virtual coin balances, and risk-free entertainment.</p>
                                </div>

                                <p>
                                    Social casinos have revolutionized online gaming by combining authentic Vegas-style slot mathematics with a purely social, fun, and risk-free model. Unlike real-money gambling sites, RoyalPlay operates strictly as a virtual entertainment destination.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                                        <div className="text-base font-black text-amber-400">🪙 Standard Coins (SC)</div>
                                        <p className="text-xs text-slate-300">
                                            The primary gameplay currency on RoyalPlay. You receive SC for free upon registration, from the daily login claim, and from the daily lucky wheel spin.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                                        <div className="text-base font-black text-emerald-400">⚡ Seamless Wallet</div>
                                        <p className="text-xs text-slate-300">
                                            Your coin balance travels with you automatically across hundreds of top slots without manual deposits or chips exchanges.
                                        </p>
                                    </div>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Top 3 Tips for New Players:
                                    </h3>
                                    <ol className="list-decimal list-inside space-y-2 text-slate-300">
                                        <li><strong>Claim Daily Bonuses:</strong> Never miss your 24-hour Daily Wheel spin and Free 1.00 SC claim.</li>
                                        <li><strong>Check Volatility Ratings:</strong> Low volatility slots award frequent smaller hits, while high volatility slots feature huge potential multipliers.</li>
                                        <li><strong>Level Up Your VIP:</strong> Higher VIP tiers grant increased daily bonus pools and prestige badges.</li>
                                    </ol>
                                </section>
                            </div>
                        )}

                        {/* 10. GUIDE: RTP & VOLATILITY */}
                        {activeTab === 'guide_rtp' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                                        Game Mathematics
                                    </span>
                                    <h2 className="text-xl font-black text-white mt-2">Understanding Slot RTP, Volatility & Hit Frequency</h2>
                                    <p className="text-xs text-slate-400 mt-1">Demystifying slot mechanics so you can select the games that match your playstyle.</p>
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-400" />
                                        What is Return to Player (RTP)?
                                    </h3>
                                    <p>
                                        RTP represents the theoretical mathematical percentage of coins returned to players over billions of simulated spins. For instance, a slot with a <strong>96.50% RTP</strong> is mathematically calibrated to return 96.50 SC for every 100 SC spun in the long run.
                                    </p>
                                </section>

                                <div className="space-y-3 pt-2">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Volatility Breakdown:
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3.5 bg-slate-900 border border-emerald-500/30 rounded-2xl space-y-1">
                                            <span className="text-xs font-black text-emerald-400 uppercase">Low Volatility</span>
                                            <p className="text-[11px] text-slate-300">Steady stream of frequent small wins. Ideal for extended gaming sessions.</p>
                                        </div>
                                        <div className="p-3.5 bg-slate-900 border border-yellow-500/30 rounded-2xl space-y-1">
                                            <span className="text-xs font-black text-yellow-400 uppercase">Medium Volatility</span>
                                            <p className="text-[11px] text-slate-300">Balanced mix of regular base-game payouts and exciting bonus rounds.</p>
                                        </div>
                                        <div className="p-3.5 bg-slate-900 border border-rose-500/30 rounded-2xl space-y-1">
                                            <span className="text-xs font-black text-rose-400 uppercase">High / Very High</span>
                                            <p className="text-[11px] text-slate-300">Less frequent wins, but massive bonus multipliers up to 100,000x!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 11. GUIDE: VIP REWARDS */}
                        {activeTab === 'guide_vip' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                                        Loyalty Rewards
                                    </span>
                                    <h2 className="text-xl font-black text-white mt-2">RoyalPlay VIP Club & Level Progression</h2>
                                    <p className="text-xs text-slate-400 mt-1">Unlock tier bonuses, custom avatars, priority assistance, and amplified jackpot entries.</p>
                                </div>

                                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-amber-300">Level 1 (Bronze) to Level 10 (Royal Sovereign)</div>
                                        <div className="text-xs text-slate-300">Every coin package deposit rewards instant VIP loyalty experience points.</div>
                                    </div>
                                    <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
                                </div>

                                <section className="space-y-2.5">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                                        Exclusive VIP Tier Privileges:
                                    </h3>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        <li className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span>Multiplied Daily Wheel Jackpot Segments</span>
                                        </li>
                                        <li className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span>Exclusive High-Roller Slot Room Access</span>
                                        </li>
                                        <li className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span>Personalized Account Concierge Support</span>
                                        </li>
                                        <li className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span>Weekly Community Grand Jackpot Boosts</span>
                                        </li>
                                    </ul>
                                </section>
                            </div>
                        )}

                        {/* 12. GUIDE: SLOTS STRATEGY & BONUS BUY */}
                        {activeTab === 'guide_slots' && (
                            <div className="space-y-6 animate-in fade-in duration-200">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                                        Slot Features
                                    </span>
                                    <h2 className="text-xl font-black text-white mt-2">Guide to Bonus Buy, Megaways & Tumble Reels</h2>
                                    <p className="text-xs text-slate-400 mt-1">Master modern slot mechanics from Pragmatic Play, Hacksaw, and PG Soft.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                                        <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                                            <Zap className="w-4 h-4" /> Bonus Buy Feature
                                        </h4>
                                        <p className="text-xs text-slate-300">
                                            Allows you to instantly trigger the free spins round by paying a fixed multiplier of your bet (typically 100x), skipping base game spins directly into the action.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                                        <h4 className="text-sm font-black text-cyan-400 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" /> Megaways™ & Dynamic Reels
                                        </h4>
                                        <p className="text-xs text-slate-300">
                                            Reels change size on every single spin, creating up to 117,649 ways to win along with cascading winning symbols that trigger consecutive payouts.
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1.5">
                                        <h4 className="text-sm font-black text-rose-400 flex items-center gap-2">
                                            <Flame className="w-4 h-4" /> Multiplier Wilds & Scatter Pays
                                        </h4>
                                        <p className="text-xs text-slate-300">
                                            Symbols pay anywhere on the screen regardless of paylines (like in Gates of Olympus and Sweet Bonanza), with random multiplier orbs boosting total tumble wins up to 500x.
                                        </p>
                                    </div>
                                </div>
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
