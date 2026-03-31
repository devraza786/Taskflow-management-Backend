import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers manually at the very top before anything else
  // This ensures even if the app crashes, preflight OPTIONS still works
  const origin = req.headers.origin as string;
  const allowedOrigins = [
    'https://taskflow-management-backend-web.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://taskflow-management-backend-web.vercel.app');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS immediately - before Express touches anything
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    // Dynamic import so boot-time crashes are caught and returned as JSON
    const { default: app } = await import('../src/index');
    return app(req as any, res as any);
  } catch (err: any) {
    console.error('[Vercel Handler Crash]', err);
    res.status(500).json({
      error: 'Server boot failure',
      message: err?.message || 'Unknown error',
      stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined,
    });
  }
}
