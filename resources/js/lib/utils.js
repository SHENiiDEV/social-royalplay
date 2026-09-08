import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Format amounts in Social Coins / Sweeps Coins (SC) with 2 decimals
 */
export function formatCurrency(amount) {
    const num = Number(amount || 0);
    return 'SC ' + num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export const formatEuro = formatCurrency;
export const formatSC = formatCurrency;

/**
 * Format currency with custom sign
 */
export function formatNumber(num) {
    return Number(num || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
