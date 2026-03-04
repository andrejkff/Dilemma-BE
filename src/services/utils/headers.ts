import type { VercelRequest, VercelResponse } from '@vercel/node';

function addDefaultResponseHeaders(req: VercelRequest, res: VercelResponse): void {
  const allowedOrigins = process.env.ALLOWED_ORIGINS!.split(',') || [];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
  }
}

export default {
  addDefaultResponseHeaders,
};
