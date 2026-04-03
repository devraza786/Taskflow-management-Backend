import type { VercelRequest, VercelResponse } from '@vercel/node';

import app from '../src/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string;
  const allowedOrigins = [
    'https://taskflow-management-backend-web.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  // Helper to set CORS headers
  const setCorsHeaders = (response: VercelResponse) => {
    if (allowedOrigins.includes(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      response.setHeader('Access-Control-Allow-Origin', 'https://taskflow-management-backend-web.vercel.app');
    }
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-refresh-token'
    );
    response.setHeader('Access-Control-Max-Age', '86400');
  };

  setCorsHeaders(res);

  // Handle preflight OPTIONS immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    return app(req as any, res as any);
  } catch (err: any) {
    console.error('[Vercel Handler Crash]', err);
    
    // Ensure headers are set even on crash
    setCorsHeaders(res);
    
    res.status(500).json({
      error: 'Server boot failure',
      message: err?.message || 'Unknown error',
      stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
    });
  }
}
