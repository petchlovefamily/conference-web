import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Map backend role codes to Conference-hub display labels.
 * Conference-hub uses 3 roles: Pharmacist, General, Guest.
 */
export function getUserRoleLabel(role: string): string {
    switch (role) {
        case 'thpro':
        case 'interpro':
        case 'thstd':
        case 'interstd':
            return 'Pharmacist';
        case 'general':
            return 'General';
        case 'public':
        default:
            return 'Guest';
    }
}

/** Badge color classes for each Conference-hub role */
export function getUserRoleBadgeColor(role: string): string {
    switch (role) {
        case 'thpro':
        case 'interpro':
        case 'thstd':
        case 'interstd':
            return 'bg-[#537547]/20 text-[#537547]';
        case 'general':
            return 'bg-blue-100 text-blue-600';
        case 'public':
        default:
            return 'bg-gray-200 text-gray-600';
    }
}
