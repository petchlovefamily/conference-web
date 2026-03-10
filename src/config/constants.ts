// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export const BACKOFFICE_URL = process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:3000';

// App Configuration
export const APP_NAME = 'Conference Registration System';
export const APP_DESCRIPTION = 'ระบบลงทะเบียนงานประชุมวิชาการ';

// Pagination
export const DEFAULT_PAGE_SIZE = 9;
export const EVENTS_PAGE_SIZE = 4;

// Image Placeholders
export const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop';
export const DEFAULT_AVATAR_IMAGE = 'https://via.placeholder.com/80';
export const DEFAULT_SPEAKER_IMAGE = 'https://via.placeholder.com/80';

// CPE Configuration
export const CPE_COUNCIL_NAME = 'สภาเภสัชกรรมแห่งประเทศไทย';

// Payment
export const STRIPE_TEST_CARD = '4242 4242 4242 4242';
export const SUPPORTED_PAYMENT_METHODS = ['credit_card', 'promptpay', 'bank_transfer'] as const;

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    MEMBER: 'member',
    PUBLIC: 'public',
} as const;

// Registration Status
export const REGISTRATION_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'checked_in',
    CANCELLED: 'cancelled',
} as const;

// Event Status
export const EVENT_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
} as const;

// Date Formats
export const DATE_FORMAT = {
    DISPLAY: 'dd MMM yyyy',
    DISPLAY_TH: 'dd MMMM yyyy',
    API: 'yyyy-MM-dd',
    DATETIME: 'yyyy-MM-dd h:mm:ss aa',
} as const;

// Validation
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 6,
    NAME_MIN_LENGTH: 2,
    PHONE_PATTERN: /^[0-9]{10}$/,
} as const;

// Home Page Stats
export const HOME_STATS = {
    YEARS_COUNT: 25,
    MEMBERS_COUNT: 50000,
    EVENTS_COUNT: 200,
    CPE_COUNT: 15000,
} as const;
