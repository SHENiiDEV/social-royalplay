import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { formatEuro } from '../../lib/utils';
import {
    Users,
    ShieldAlert,
    Sliders,
    ArrowLeft,
    Download,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    X,
    Plus,
    Crown,
    Scale,
    Radio,
    Search,
    ShieldCheck,
    Dices,
    Edit3,
    Eye,
    UserX,
    UserCheck,
    FileText,
    Lock
} from 'lucide-react';

export default function AdminUsers({
    auth,
    users = [],
    allowedRtpValues = [95, 200, 300, 400, 500, 600, 700, 800, 999],
    company = {},
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingRtpUserId, setLoadingRtpUserId] = useState(null);
    const [feedback, setFeedback] = useState(null);
    
    // Balance Adjust Modal
    const [adjustUser, setAdjustUser] = useState(null);
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustType, setAdjustType] = useState('add');
    const [adjustLoading, setAdjustLoading] = useState(false);

    // Ban / Block User Modal & Form Fields
    const [banModalUser, setBanModalUser] = useState(null);
    const [banFirstName, setBanFirstName] = useState('');
    const [banLastName, setBanLastName] = useState('');
    const [banCaseNumber, setBanCaseNumber] = useState('');
    const [banReasonText, setBanReasonText] = useState('Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.');
    const [banLoading, setBanLoading] = useState(false);

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            || (document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ? decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)[1]) : '');
    };

    const generateUniqueCaseNumber = () => {
        const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
        return `CAS-${randomDigits}`;
    };

    const openBanModal = (user) => {
        const parts = (user.name || '').trim().split(/\s+/);
        const defaultFirst = user.ban_first_name || parts[0] || 'First Name';
        const defaultLast = user.ban_last_name || parts.slice(1).join(' ') || 'Last Name';
        const defaultCase = user.ban_case_number || ('CAS-' + (user.id * 94127 + 104829).toString().padStart(8, '0'));
        const defaultReason = user.ban_reason || 'Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.';

        setBanModalUser(user);
        setBanFirstName(defaultFirst);
        setBanLastName(defaultLast);
        setBanCaseNumber(defaultCase);
        setBanReasonText(defaultReason);
    };

    const handleRtpChange = async (userId, rtpVal) => {
        setLoadingRtpUserId(userId);
        setFeedback(null);

        try {
            const token = getCsrfToken();
            const res = await fetch('/admin/rtp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-XSRF-TOKEN': token,
                },
                body: JSON.stringify({ user_id: userId, rtp: parseInt(rtpVal) }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setFeedback({
                    type: 'success',
                    message: data.message + ' (Game Server response: ' + (data.nexus_response?.message || 'OK') + ')',
                });
                router.reload({ only: ['users'] });
            } else {
                setFeedback({
                    type: 'error',
                    message: data.message || 'Failed to update RTP.',
                });
            }
        } catch (err) {
            setFeedback({ type: 'error', message: 'Network connection error.' });
        } finally {
            setLoadingRtpUserId(null);
        }
    };

    const handleAdjustBalance = async (e) => {
        e.preventDefault();
        if (!adjustUser || !adjustAmount) return;
        setAdjustLoading(true);

        try {
            const token = getCsrfToken();
            const res = await fetch('/admin/balance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-XSRF-TOKEN': token,
                },
                body: JSON.stringify({
                    user_id: adjustUser.id,
                    amount: parseFloat(adjustAmount),
                    type: adjustType,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setFeedback({ type: 'success', message: data.message });
                setAdjustUser(null);
                setAdjustAmount('');
                router.reload({ only: ['users'] });
            }
        } catch (err) {
            alert('Failed to update balance');
        } finally {
            setAdjustLoading(false);
        }
    };

    const handleSaveBan = async (e) => {
        if (e) e.preventDefault();
        if (!banModalUser) return;
        setBanLoading(true);

        try {
            const token = getCsrfToken();
            const res = await fetch('/admin/ban', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-XSRF-TOKEN': token,
                },
                body: JSON.stringify({
                    user_id: banModalUser.id,
                    is_banned: true,
                    first_name: banFirstName.trim(),
                    last_name: banLastName.trim(),
                    case_number: banCaseNumber.trim() || generateUniqueCaseNumber(),
                    reason: banReasonText.trim(),
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setFeedback({
                    type: 'error',
                    message: data.message || `Пользователь ${banModalUser.name} заблокирован с официальным уведомлением.`,
                });
                setBanModalUser(null);
                router.reload({ only: ['users'] });
            } else {
                alert(data.message || 'Error occurred while updating user status');
            }
        } catch (err) {
            alert('Network connection error');
        } finally {
            setBanLoading(false);
        }
    };

    const handleUnban = async (user) => {
        setBanLoading(true);
        try {
            const token = getCsrfToken();
            const res = await fetch('/admin/ban', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-XSRF-TOKEN': token,
                },
                body: JSON.stringify({
                    user_id: user.id,
                    is_banned: false,
                }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setFeedback({
                    type: 'success',
                    message: data.message || `Пользователь ${user.name} успешно разблокирован.`,
                });
                router.reload({ only: ['users'] });
            } else {
                alert(data.message || 'Error occurred while unblocking user');
            }
        } catch (err) {
            alert('Network connection error');
        } finally {
            setBanLoading(false);
        }
    };

    const handleSwitchAndPreview = async (userId) => {
        try {
            await fetch('/api/auth/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ user_id: userId }),
            });
            window.location.href = '/';
        } catch (e) {
            window.location.href = '/';
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.user_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans">
            <Head title="Users & Fraud Enforcement — RoyalPlay Admin" />

            {/* Admin Header */}
            <header className="bg-[#0c1018] border-b border-slate-800 px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-2xl">
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                    </Link>

                    <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center text-black font-black text-xs">
                            <Crown className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-base font-black text-white flex items-center gap-2 leading-none">
                                <span>Users & Player Enforcement</span>
                                <span className="text-[10px] font-mono uppercase bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded">
                                    FRAUD & RTP CONTROL
                                </span>
                            </h1>
                            <span className="text-[11px] text-slate-400 font-mono">
                                /admin/users • Seamless Wallet Accounts
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
                    >
                        Go to Casino Lobby
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-6 flex-1">
                
                {/* Feedback Toast */}
                {feedback && (
                    <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                        feedback.type === 'success'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}>
                        <div className="flex items-center gap-2">
                            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span>{feedback.message}</span>
                        </div>
                        <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Table Header & Search */}
                <div className="bg-[#0f1420] border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-400" />
                                <span>Player Management Directory ({users.length} registered)</span>
                            </h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Lock down fraudulent accounts with police notification alerts or adjust payout RTP.
                            </p>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, user code, email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Code / Email</th>
                                    <th className="py-3 px-4">Balance</th>
                                    <th className="py-3 px-4">Status & RTP</th>
                                    <th className="py-3 px-4">RTP Mode</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 font-mono">
                                {filteredUsers.map((u) => {
                                    const isLoading = loadingRtpUserId === u.id;
                                    return (
                                        <tr key={u.id} className="hover:bg-slate-900/40 transition">
                                            <td className="py-3 px-4 font-sans font-bold text-white flex items-center gap-2.5">
                                                <img
                                                    src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                                                    className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                                                />
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>{u.name}</span>
                                                        {u.is_admin && <span className="text-[9px] bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded font-mono">ADMIN</span>}
                                                    </div>
                                                    {u.is_banned ? (
                                                        <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1 mt-0.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                                            ⛔ BLOCKED (POLICE NOTICE)
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            Active Account
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-slate-400">
                                                <div>{u.user_code}</div>
                                                <div className="text-[10px] text-slate-500 font-sans">{u.email}</div>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-amber-400">{formatEuro(u.game_balance)}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                                    u.is_banned
                                                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                                                        : u.rtp > 100
                                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow'
                                                        : 'bg-slate-800 text-slate-300'
                                                }`}>
                                                    {u.is_banned ? 'BLOCKED' : `${u.rtp}%`}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        defaultValue={u.rtp}
                                                        onChange={(e) => handleRtpChange(u.id, e.target.value)}
                                                        disabled={isLoading || u.is_banned}
                                                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500 font-sans disabled:opacity-50"
                                                    >
                                                        <option value="95">95% (Standard Default)</option>
                                                        <option value="200">200% (High Payout)</option>
                                                        <option value="300">300% (Super Multipliers)</option>
                                                        <option value="400">400% (Frequent Bonus)</option>
                                                        <option value="500">500% (Streamer Mega Win)</option>
                                                        <option value="600">600% (Epic Free Spins)</option>
                                                        <option value="700">700% (Extreme Jackpots)</option>
                                                        <option value="800">800% (Insane Spree)</option>
                                                        <option value="999">999% (Max Jackpot Mode)</option>
                                                    </select>
                                                    {isLoading && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2 font-sans">
                                                    <button
                                                        onClick={() => setAdjustUser(u)}
                                                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition cursor-pointer"
                                                    >
                                                        Balance
                                                    </button>

                                                    {u.is_banned ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => handleSwitchAndPreview(u.id)}
                                                                className="px-2.5 py-1.5 bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                                title="Switch to this user and view full-screen official ban notice"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>View Notice</span>
                                                            </button>
                                                            <button
                                                                onClick={() => openBanModal(u)}
                                                                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                                title="Edit Case Number, Name, or Notice text"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleUnban(u)}
                                                                disabled={banLoading}
                                                                className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <UserCheck className="w-3.5 h-3.5" />
                                                                <span>Unblock</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => openBanModal(u)}
                                                            disabled={u.is_admin}
                                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 transition flex items-center gap-1 disabled:opacity-30 cursor-pointer"
                                                            title="Block user and trigger official notice"
                                                        >
                                                            <ShieldAlert className="w-3.5 h-3.5" />
                                                            <span>Block User</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>

            {/* Adjust Balance Modal */}
            {adjustUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#0f141f] border border-slate-800 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <h3 className="font-bold text-base text-white">Adjust User Balance</h3>
                            <button onClick={() => setAdjustUser(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAdjustBalance} className="mt-4 space-y-4">
                            <div className="text-xs text-slate-400">
                                Adjusting wallet for <strong className="text-white font-sans">{adjustUser.name}</strong> ({adjustUser.user_code})
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAdjustType('add')}
                                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                                        adjustType === 'add' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                                    }`}
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Add Funds</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustType('set')}
                                    className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                                        adjustType === 'set' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                                    }`}
                                >
                                    <span>Set Exact</span>
                                </button>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase">Amount (SC)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 500.00"
                                    value={adjustAmount}
                                    onChange={(e) => setAdjustAmount(e.target.value)}
                                    required
                                    className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setAdjustUser(null)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adjustLoading}
                                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                                >
                                    {adjustLoading ? 'Updating...' : 'Save Balance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ban / Block User Modal & Official Notice Configuration */}
            {banModalUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
                    <div className="w-full max-w-4xl bg-[#0f141f] border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/70 my-auto">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
                                    <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">
                                        {banModalUser.is_banned ? 'Edit Official Ban Notice' : 'Block User & Issue Official Notice'}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Configure the full-screen official legal notice for <strong className="text-white font-sans">{banModalUser.name}</strong> ({banModalUser.user_code}).
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setBanModalUser(null)} className="text-slate-400 hover:text-white p-1">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveBan} className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                
                                {/* Left Side: Configuration Fields */}
                                <div className="space-y-4 font-sans text-xs">
                                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="w-4 h-4" />
                                        <span>1. Notice Recipient & Case Details</span>
                                    </div>

                                    {/* First & Last Name Inputs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                                                First Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="First Name"
                                                value={banFirstName}
                                                onChange={(e) => setBanFirstName(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-sans focus:outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                                                Last Name <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Last Name"
                                                value={banLastName}
                                                onChange={(e) => setBanLastName(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-sans focus:outline-none focus:border-red-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Unique Case Number */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-slate-300 uppercase">
                                                Case Number <span className="text-red-400">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setBanCaseNumber(generateUniqueCaseNumber())}
                                                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold transition"
                                            >
                                                <Dices className="w-3.5 h-3.5" />
                                                <span>Random Case No.</span>
                                            </button>
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. CAS-89412049"
                                            value={banCaseNumber}
                                            onChange={(e) => setBanCaseNumber(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold focus:outline-none focus:border-red-500"
                                        />
                                    </div>

                                    {/* Notice Reason */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">
                                            Security Review Note / Reason
                                        </label>
                                        <textarea
                                            rows="3"
                                            value={banReasonText}
                                            onChange={(e) => setBanReasonText(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-red-500 resize-none font-sans"
                                        />
                                    </div>

                                    <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-[11px] leading-relaxed">
                                        ⚠️ Once saved, this user will immediately see the full-screen official notice on every page, with game access disabled.
                                    </div>
                                </div>

                                {/* Right Side: Live Official Notice Preview */}
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                        <Scale className="w-4 h-4" />
                                        <span>2. Live Notice Preview (User View)</span>
                                    </div>

                                    <div className="p-5 bg-red-950/60 border-2 border-red-500 rounded-2xl space-y-3 font-sans text-xs shadow-2xl text-left">
                                        <div className="flex items-center justify-between border-b border-red-500/40 pb-2">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-red-300 flex items-center gap-1">
                                                <Scale className="w-3.5 h-3.5 text-red-400" />
                                                OFFICIAL NOTICE
                                            </span>
                                            <span className="text-[10px] font-mono text-red-400 font-bold bg-black/40 px-2 py-0.5 rounded border border-red-500/30">
                                                Case No. {banCaseNumber || '[Unique Number]'}
                                            </span>
                                        </div>

                                        <p className="text-sm font-bold text-white leading-relaxed">
                                            Dear <span className="text-amber-300 font-bold">{banFirstName || 'First Name'} {banLastName || 'Last Name'}</span>,
                                        </p>

                                        <p className="text-xs text-red-100 font-semibold leading-relaxed">
                                            Your account has been blocked due to suspicious activity identified during a security review, which may indicate fraudulent activity.
                                        </p>

                                        <p className="text-xs text-amber-300 font-mono font-bold">
                                            Case No. {banCaseNumber || '[Unique Number]'}
                                        </p>

                                        <p className="text-xs text-red-200/90 leading-relaxed">
                                            All relevant information regarding this incident may be forwarded to the appropriate authorities for further review and any action deemed necessary under applicable law.
                                        </p>

                                        <p className="text-[11px] text-red-300/90 italic leading-relaxed pt-0.5">
                                            Please retain all correspondence and documents related to this matter. You may be contacted by the relevant authorities if additional information is required.
                                        </p>

                                        {/* Summary Credentials Card */}
                                        <div className="p-3 bg-black/70 border border-red-500/40 rounded-xl space-y-1 font-mono text-[11px] text-slate-300 mt-2">
                                            <div className="flex justify-between items-center py-0.5 border-b border-slate-800">
                                                <span className="text-slate-400">Status:</span>
                                                <span className="text-red-400 font-black uppercase">Blocked</span>
                                            </div>
                                            <div className="flex justify-between items-center py-0.5 border-b border-slate-800">
                                                <span className="text-slate-400">Case Number:</span>
                                                <strong className="text-amber-400">{banCaseNumber || '[Unique Number]'}</strong>
                                            </div>
                                            <div className="flex justify-between items-center py-0.5">
                                                <span className="text-slate-400">Name:</span>
                                                <strong className="text-white">{banFirstName || 'First Name'} {banLastName || 'Last Name'}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* Modal Actions */}
                            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setBanModalUser(null)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={banLoading}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                                >
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>{banLoading ? 'Saving...' : banModalUser.is_banned ? 'Update Official Notice' : 'Activate Block & Notice'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
