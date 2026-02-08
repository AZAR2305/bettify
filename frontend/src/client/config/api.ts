// API Configuration for both development and production
// Uses environment variables set by Vite

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

console.log('🔧 API Configuration:', { API_URL, WS_URL });

export { API_URL, WS_URL };
