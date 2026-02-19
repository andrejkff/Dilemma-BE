import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../src/db.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN!);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const method = req.method;
  if (method !== 'GET')
    res.status(405).json({ error: 'Method not allowed' });
  try {
    const { rows } = await query(
      `SELECT id, name, under_construction FROM games;`
    );

    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json(e);
  }
}
