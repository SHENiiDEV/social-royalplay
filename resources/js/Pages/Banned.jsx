import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ShieldAlert, Scale, Lock, LogOut, ArrowRight, Radio } from 'lucide-react';

export default function Banned({
    user,
    ip = '127.0.0.1',
    incident_id = 'SEC-9842104921',
    company = {},
}) {
    const handleLogout = () => {
        router.post('/logout');
    };

    const handleSwitchToAdmin = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                || (document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1]) : '');

            await fetch('/api/auth/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-XSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({ user_id: 1 }),
            });
            window.location.href = '/admin';
        } catch(e) {
            window.location.href = '/admin';
        }
    };

    const displayName = user?.ban_full_name || (user?.ban_first_name || user?.ban_last_name ? `${user.ban_first_name || ''} ${user.ban_last_name || ''}`.trim() : (user?.name || 'User'));
    const caseNumber = user?.ban_case_number || ('CAS-' + ((user?.id || 1) * 94127 + 104829).toString().padStart(8, '0'));

    return (
        <div className="min-h-screen bg-[#05060a] text-slate-100 flex items-center justify-center p-4 selection:bg-red-600 selection:text-white relative overflow-hidden font-sans">
            <Head title="OFFICIAL NOTICE: ACCOUNT BLOCKED" />

            {/* Top Police Siren Light */}
            <div className="fixed top-0 left-0 right-0 h-2.5 flex z-50 pointer-events-none">
                <div className="w-1/2 bg-red-600 animate-pulse shadow-[0_0_50px_rgba(239,68,68,1)]" />
                <div className="w-1/2 bg-blue-600 animate-pulse shadow-[0_0_50px_rgba(37,99,235,1)]" />
            </div>

            {/* Red / Blue Ambient Glows */}
            <div className="absolute top-5 left-5 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-ping duration-1000" />
            <div className="absolute bottom-5 right-5 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse duration-700" />

            <div className="relative w-full max-w-2xl bg-[#0c080b]/95 border-2 border-red-600 rounded-3xl p-6 sm:p-10 shadow-[0_0_80px_rgba(220,38,38,0.5)] flex flex-col items-center text-center backdrop-blur-xl">
                
                {/* Security Emblem */}
                <div className="relative mb-5">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-red-700 via-rose-600 to-amber-500 p-1 flex items-center justify-center shadow-2xl shadow-red-600/60 animate-bounce">
                        <div className="w-full h-full bg-[#12070a] rounded-[22px] flex items-center justify-center">
                            <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 animate-pulse" />
                        </div>
                    </div>
                    <span className="absolute -bottom-2 px-3 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-red-300 shadow">
                        SECURITY ENFORCEMENT
                    </span>
                </div>

                {/* Header */}
                <div className="space-y-1.5 mb-6">
                    <div className="text-[11px] uppercase font-mono font-black tracking-widest text-red-400 flex items-center justify-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                        <span>CYBERSECURITY INCIDENT RESPONSE • LAW ENFORCEMENT NOTIFICATION</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-wide uppercase">
                        🚨 OFFICIAL NOTICE
                    </h1>
                </div>

                {/* Official Notice Document Box */}
                <div className="w-full p-5 sm:p-7 bg-red-950/50 border-2 border-red-500 rounded-2xl mb-6 text-left space-y-4 shadow-2xl font-sans">
                    <div className="flex items-center justify-between border-b border-red-500/40 pb-2.5">
                        <span className="text-xs font-black uppercase tracking-widest text-red-300 flex items-center gap-1.5">
                            <Scale className="w-4 h-4 text-red-400" />
                            OFFICIAL NOTICE
                        </span>
                        <span className="text-[11px] font-mono text-red-400 font-bold bg-black/40 px-2 py-0.5 rounded border border-red-500/30">
                            Case No. {caseNumber}
                        </span>
                    </div>

                    <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                        Dear <span className="text-amber-300">{displayName}</span>,
                    </p>

                    <p className="text-xs sm:text-sm text-red-100 font-semibold leading-relaxed">
                        Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.
                    </p>

                    <p className="text-xs sm:text-sm text-amber-300 font-mono font-bold">
                        Case No. {caseNumber}
                    </p>

                    <p className="text-xs sm:text-sm text-red-200/90 leading-relaxed">
                        All relevant information regarding this incident may be forwarded to the appropriate authorities for further review and any action deemed necessary under applicable law.
                    </p>

                    <p className="text-xs sm:text-sm text-red-300/90 italic leading-relaxed pt-1">
                        Please retain all correspondence and documents related to this matter. You may be contacted by the relevant authorities if additional information is required.
                    </p>

                    {/* Summary Credentials Card */}
                    <div className="p-4 bg-black/70 border border-red-500/40 rounded-xl space-y-1.5 font-mono text-xs sm:text-sm text-slate-300 mt-2">
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
                            <span className="text-slate-400">Status:</span>
                            <span className="text-red-400 font-black uppercase tracking-wider animate-pulse">Blocked</span>
                        </div>
                        <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
                            <span className="text-slate-400">Case Number:</span>
                            <strong className="text-amber-400 font-bold">{caseNumber}</strong>
                        </div>
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-slate-400">Name:</span>
                            <strong className="text-white font-bold">{displayName}</strong>
                        </div>
                    </div>
                </div>

                {/* Actions & Switcher */}
                <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={handleLogout}
                        className="w-full sm:flex-1 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Log Out</span>
                    </button>

                    <button
                        onClick={handleSwitchToAdmin}
                        className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition cursor-pointer"
                    >
                        <span>Switch to Admin Account</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-5 pt-3 border-t border-slate-800 text-[10px] text-slate-500 w-full flex items-center justify-between">
                    <span>{company.name || 'RoyalPlay Security & Risk Division'}</span>
                    <span>License {company.license || 'OGL/2026/184/0129'}</span>
                </div>

            </div>
        </div>
    );
}
