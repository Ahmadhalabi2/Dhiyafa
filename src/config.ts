const isProd = process.env.NODE_ENV === 'production';

export const BACKEND_URL = isProd
  ? 'https://dhiyafa-production.up.railway.app'
  : 'http://localhost:5000';
