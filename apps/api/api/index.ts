// Diagnostic Entry Point
export default async function handler(req: any, res: any) {
  try {
    // Dynamically load the Express app during the request instead of on global boot
    const appModule = await import('../src/index');
    const app = appModule.default;
    
    // Pass control to Express
    return await app(req, res);
  } catch (error: any) {
    // If Prisma, Express, or any module physically crashes on boot, we catch it here natively
    console.error("VERCEL DIAGNOSTIC CRASH:", error);
    
    // Explicitly allow CORS headers for the crash report so the browser can see it
    res.setHeader('Access-Control-Allow-Origin', 'https://taskflow-management-backend-web.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    
    // Return standard HTTP 500 with the full stringified JS Trace
    res.status(500).json({
      error: 'Monorepo API Boot Crash',
      message: error?.message || 'Unknown Native Panic',
      stack: error?.stack || null
    });
  }
}
