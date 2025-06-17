// Application Constants
export const APP_NAME = 'SANEM';
export const APP_DESCRIPTION = 'Sistema de Gerenciamento de Doações';

// Routes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  BENEFICIARIOS: '/beneficiarios',
  CADASTRO: '/cadastro-pessoas',
  DOACOES: '/doacoes',
  ESTOQUE: '/estoque',
  DISTRIBUICAO: '/distribuicao',
  RELATORIOS: '/relatorios',
  PERFIL: '/perfil',
  GESTAO_USUARIOS: '/gestao-usuarios',
} as const;

// Permissions
export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_BENEFICIARIES: 'manage_beneficiaries',
  MANAGE_DONATIONS: 'manage_donations',
  MANAGE_STOCK: 'manage_stock',
  MANAGE_DISTRIBUTIONS: 'manage_distributions',
  VIEW_REPORTS: 'view_reports',
  MANAGE_USERS: 'manage_users',
  SYSTEM_SETTINGS: 'system_settings',
} as const;

// Role Permissions Mapping
export const ROLE_PERMISSIONS = {
  superadmin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_BENEFICIARIES,
    PERMISSIONS.MANAGE_DONATIONS,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.MANAGE_DISTRIBUTIONS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.SYSTEM_SETTINGS,
  ],
  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_BENEFICIARIES,
    PERMISSIONS.MANAGE_DONATIONS,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.MANAGE_DISTRIBUTIONS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  voluntario: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_BENEFICIARIES,
    PERMISSIONS.MANAGE_DONATIONS,
  ],
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'sanem_token',
  USER_DATA: 'sanem_user',
  THEME: 'sanem-ui-theme',
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 5000,
  MAX_TOASTS: 5,
} as const;

// Form Validation
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  MIN_PASSWORD_LENGTH: 6,
} as const;

// Status Options
export const STATUS_OPTIONS = {
  ACTIVE: 'ativo',
  INACTIVE: 'inativo',
} as const;

// Theme Options
export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const; 