// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_API_URL || 'https://localhost:7096/api',
    TIMEOUT: 30000,
};

// Camera Configuration
export const CAMERA_CONFIG = {
    STREAM_URL: import.meta.env.VITE_CAMERA_URL || 'http://localhost:8000',
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
};

// User endpoints
export const USER_ENDPOINTS = {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
};

// Game endpoints
export const GAME_ENDPOINTS = {
    LIST: '/Games',
    DETAIL: '/Games',
    START: '/Games/start',
    MOVE: '/Games/move',
    END: '/Games/end',
};

// Robot endpoints
export const ROBOT_ENDPOINTS = {
    STATUS: '/robots/status',
    CONNECT: '/robots/connect',
    DISCONNECT: '/robots/disconnect',
};

// AI Suggestion endpoints
export const AI_SUGGESTION_ENDPOINTS = {
    GET_SUGGESTION: '/AiSuggestions/get-suggestion',
    GET_COST: '/AiSuggestions/cost',
};
