import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import LiveWinnersBar from '../Components/LiveWinnersBar';
import HeroBanners from '../Components/HeroBanners';
import GameCard from '../Components/GameCard';
import Pagination from '../Components/Pagination';
import StoreModal from '../Components/StoreModal';
import WheelOfFortuneModal from '../Components/WheelOfFortuneModal';
import VipModal from '../Components/VipModal';
import AuthModal from '../Components/AuthModal';
import SplashScreen from '../Components/SplashScreen';
import FullScreenBanAlert from '../Components/FullScreenBanAlert';
import {
    Flame,
    Sparkles,
    LayoutGrid,
    Crown,
    Search,
    Zap,
    SlidersHorizontal,
    Trophy,
    Gamepad2,
    Tv,
    Heart
} from 'lucide-react';

const CATEGORIES = [
    { id: 'all', name: 'All Games', icon: LayoutGrid },
    { id: 'favorites', name: 'Favorites', icon: Heart },
    { id: 'popular', name: 'Popular', icon: Flame },
    { id: 'slots', name: 'Video Slots', icon: Gamepad2 },
    { id: 'buy_feature', name: 'Bonus Buy', icon: Zap },
    { id: 'megaways', name: 'Megaways', icon: Sparkles },
    { id: 'jackpots', name: 'Jackpots', icon: Trophy },
];

export default function Lobby({
    auth,
    games = [],
    featuredGames = [],
    jackpot,
    liveWins = [],
    providers = [],
    userFavorites = [],
    filters = {},
    company = {},
}) {
    const [storeOpen, setStoreOpen] = useState(false);
    const [wheelOpen, setWheelOpen] = useState(false);
    const [vipOpen, setVipOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const [activeCategory, setActiveCategory] = useState(filters.category || 'all');
    const [activeProvider, setActiveProvider] = useState(filters.provider || 'all');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');

    const gamesList = Array.isArray(games) ? games : (games?.data || []);
    const pagination = Array.isArray(games) ? null : games;
    const totalGamesCount = pagination ? pagination.total : gamesList.length;

    const handleCategoryChange = (catId) => {
        setActiveCategory(catId);
        
        let clientFavIds = '';
        if (catId === 'favorites') {
            try {
                const saved = JSON.parse(localStorage.getItem('rp_favorites') || '[]');
                clientFavIds = saved.join(',');
            } catch (e) {}
        }

        router.get('/', {
            category: catId,
            provider: activeProvider,
            search: searchQuery,
            fav_ids: clientFavIds,
            page: 1,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleProviderChange = (prov) => {
        setActiveProvider(prov);
        router.get('/', {
            category: activeCategory,
            provider: prov,
            search: searchQuery,
            page: 1,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        router.get('/', {
            category: activeCategory,
            provider: activeProvider,
            search: query,
            page: 1,
        }, { preserveState: true, preserveScroll: true });
    };

    const handlePageChange = (newPage) => {
        router.get('/', {
            category: activeCategory,
            provider: activeProvider,
            search: searchQuery,
            page: newPage,
        }, {
            preserveState: true,
            preserveScroll: false,
            onSuccess: () => {
                document.getElementById('games-catalog')?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
            <Head title="RoyalPlay — Next-Gen Social Casino & Seamless Slots" />

            {/* First-time Session Splash Screen */}
            <SplashScreen />

            {/* Header */}
            <Header
                user={auth?.user}
                jackpot={jackpot}
                onOpenStore={() => setStoreOpen(true)}
                onOpenWheel={() => setWheelOpen(true)}
                onOpenVip={() => setVipOpen(true)}
                onOpenAuth={(mode = 'login') => {
                    setAuthMode(mode);
                    setAuthOpen(true);
                }}
            />

            {/* Live Community Winners Marquee */}
            <LiveWinnersBar initialWins={liveWins} />

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 w-full space-y-6 md:space-y-10 pb-16">
                
                {/* Hero Showcase Banners */}
                <HeroBanners
                    jackpot={jackpot}
                    user={auth?.user}
                    onOpenStore={() => setStoreOpen(true)}
                    onOpenWheel={() => setWheelOpen(true)}
                    featuredGame={featuredGames[0]}
                />

                {/* Filters, Categories & Search Bar */}
                <section className="space-y-4">
                    
                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                        isActive
                                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/25 scale-105'
                                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Secondary Filter Bar: Providers & Search */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0f1420] p-3 rounded-2xl border border-slate-800/80">
                        
                        {/* Provider Chips & Quick Select */}
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
                            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 shrink-0">
                                Provider:
                            </span>
                            <button
                                onClick={() => handleProviderChange('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                                    activeProvider.toLowerCase() === 'all'
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20 font-black'
                                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                            >
                                All Providers
                            </button>
                            {providers.map((prov) => {
                                const code = typeof prov === 'string' ? prov : prov.code;
                                const name = typeof prov === 'string' ? prov : prov.name;
                                const count = typeof prov === 'object' ? prov.count : null;
                                const isSelected = activeProvider.toLowerCase() === code.toLowerCase();

                                return (
                                    <button
                                        key={code}
                                        onClick={() => handleProviderChange(code)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                            isSelected
                                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20 font-black'
                                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <span>{name}</span>
                                        {count !== null && (
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                                isSelected ? 'bg-black/20 text-black font-extrabold' : 'bg-slate-800 text-slate-400'
                                            }`}>
                                                {count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search slots, providers..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
                            />
                        </div>

                    </div>

                </section>

                {/* Games Catalog Grid */}
                <section id="games-catalog" className="space-y-4 scroll-mt-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-amber-400" />
                            <h2 className="text-lg md:text-xl font-extrabold text-white">
                                {activeCategory === 'all' ? 'Popular & Top Slots' : CATEGORIES.find(c => c.id === activeCategory)?.name || 'Games'}
                            </h2>
                            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                                {totalGamesCount} games
                            </span>
                        </div>
                    </div>

                    {gamesList.length === 0 ? (
                        <div className="py-16 text-center bg-slate-900/50 rounded-3xl border border-slate-800">
                            {activeCategory === 'favorites' ? (
                                <>
                                    <Heart className="w-12 h-12 text-rose-500/50 mx-auto mb-2" />
                                    <h3 className="text-base font-bold text-slate-300">No favorite games yet</h3>
                                    <p className="text-xs text-slate-500 mt-1">Click the ❤️ heart icon on any slot card to add it to your Favorites!</p>
                                </>
                            ) : (
                                <>
                                    <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                                    <h3 className="text-base font-bold text-slate-300">No games matched your criteria</h3>
                                    <p className="text-xs text-slate-500 mt-1">Try resetting your search or selecting another category</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
                                {gamesList.map((game) => (
                                    <GameCard
                                        key={game.id}
                                        game={game}
                                        initialIsFavorite={userFavorites.includes(game.id)}
                                    />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {pagination && (
                                <Pagination
                                    currentPage={pagination.current_page}
                                    lastPage={pagination.last_page}
                                    total={pagination.total}
                                    from={pagination.from}
                                    to={pagination.to}
                                    onPageChange={handlePageChange}
                                />
                            )}
                        </>
                    )}
                </section>

            </main>

            {/* Modals */}
            <StoreModal
                isOpen={storeOpen}
                onClose={() => setStoreOpen(false)}
                user={auth?.user}
            />

            <WheelOfFortuneModal
                isOpen={wheelOpen}
                onClose={() => setWheelOpen(false)}
                user={auth?.user}
            />

            <VipModal
                isOpen={vipOpen}
                onClose={() => setVipOpen(false)}
                user={auth?.user}
            />

            <AuthModal
                isOpen={authOpen}
                initialMode={authMode}
                onClose={() => setAuthOpen(false)}
                company={company}
            />

            {/* Full Screen Emergency Police Ban Alert */}
            <FullScreenBanAlert user={auth?.user} company={company} />

            {/* Footer */}
            <Footer company={company} />
        </div>
    );
}
