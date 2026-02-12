import { describe, it, expect } from 'vitest';
import {
    API_URL,
    BACKOFFICE_URL,
    APP_NAME,
    USER_ROLES,
    REGISTRATION_STATUS,
    VALIDATION,
} from '@/config';

describe('Config Constants', () => {
    describe('API URLs', () => {
        it('should have API_URL defined', () => {
            expect(API_URL).toBeDefined();
            expect(typeof API_URL).toBe('string');
        });

        it('should have BACKOFFICE_URL defined', () => {
            expect(BACKOFFICE_URL).toBeDefined();
            expect(typeof BACKOFFICE_URL).toBe('string');
        });
    });

    describe('App Config', () => {
        it('should have APP_NAME', () => {
            expect(APP_NAME).toBeDefined();
            expect(APP_NAME).toBe('Conference Registration System');
        });
    });

    describe('User Roles', () => {
        it('should have all user roles defined', () => {
            expect(USER_ROLES.ADMIN).toBe('admin');
            expect(USER_ROLES.STAFF).toBe('staff');
            expect(USER_ROLES.MEMBER).toBe('member');
            expect(USER_ROLES.PUBLIC).toBe('public');
        });
    });

    describe('Registration Status', () => {
        it('should have all statuses defined', () => {
            expect(REGISTRATION_STATUS.PENDING).toBe('pending');
            expect(REGISTRATION_STATUS.CONFIRMED).toBe('confirmed');
            expect(REGISTRATION_STATUS.CHECKED_IN).toBe('checked_in');
            expect(REGISTRATION_STATUS.CANCELLED).toBe('cancelled');
        });
    });

    describe('Validation', () => {
        it('should have password min length', () => {
            expect(VALIDATION.PASSWORD_MIN_LENGTH).toBe(6);
        });

        it('should have phone pattern', () => {
            expect(VALIDATION.PHONE_PATTERN.test('0812345678')).toBe(true);
            expect(VALIDATION.PHONE_PATTERN.test('123')).toBe(false);
        });
    });
});
