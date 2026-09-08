import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
    currentPage = 1,
    lastPage = 1,
    total = 0,
    from = 0,
    to = 0,
    onPageChange,
}) {
    if (lastPage <= 1) return null;

    // Generate page numbers with smart ellipsis
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (lastPage <= maxPagesToShow + 2) {
            for (let i = 1; i <= lastPage; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(lastPage - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= lastPage - 2) {
                start = lastPage - 3;
            }

            if (start > 2) {
                pages.push('...');
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < lastPage - 1) {
                pages.push('...');
            }

            pages.push(lastPage);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            {/* Range Counter */}
            <div className="text-xs text-slate-400 font-mono">
                Showing <span className="font-bold text-white">{from || 0}</span> – <span className="font-bold text-white">{to || 0}</span> of <span className="font-bold text-amber-400">{total}</span> slots
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
                {/* First Page */}
                {currentPage > 2 && (
                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="First Page"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                )}

                {/* Prev Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Numbered Page Buttons */}
                <div className="flex items-center gap-1">
                    {pages.map((p, idx) => {
                        if (p === '...') {
                            return (
                                <span key={`ellipsis-${idx}`} className="px-2 text-xs font-mono text-slate-600">
                                    ...
                                </span>
                            );
                        }

                        const isCurrent = p === currentPage;

                        return (
                            <button
                                key={`page-${p}`}
                                onClick={() => onPageChange(p)}
                                className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                                    isCurrent
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black shadow-lg shadow-amber-500/25 scale-105'
                                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= lastPage}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                {currentPage < lastPage - 1 && (
                    <button
                        onClick={() => onPageChange(lastPage)}
                        disabled={currentPage === lastPage}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                        title="Last Page"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
