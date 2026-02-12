import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
    it('should merge class names', () => {
        const result = cn('text-white', 'bg-black');
        expect(result).toBe('text-white bg-black');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const result = cn('base-class', isActive && 'active-class');
        expect(result).toContain('active-class');
    });

    it('should override conflicting tailwind classes', () => {
        const result = cn('text-red-500', 'text-blue-500');
        expect(result).toBe('text-blue-500');
    });

    it('should handle undefined and null', () => {
        const result = cn('base', undefined, null, 'end');
        expect(result).toBe('base end');
    });
});
