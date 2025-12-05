// API Configuration
// Note: For Android Emulator use 'http://10.0.2.2:7096/api'
// For Physical Device use your computer's IP address e.g. 'http://192.168.1.x:7096/api'
export const API_CONFIG = {
    BASE_URL: 'https://localhost:7096/api', // Update this with your actual IP
    TIMEOUT: 30000, 
};

// Camera Configuration
export const CAMERA_CONFIG = {
    STREAM_URL: 'http://10.17.0.187:8000/stream', // Update this with your actual IP
};

// Auth endpoints
export const AUTH_ENDPOINTS = {
    LOGIN: '/Auth/login',
    SIGNUP: '/Auth/signup',
    LOGOUT: '/Auth/logout',
    REFRESH: '/Auth/refresh',
    ME: '/Auth/me',
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
