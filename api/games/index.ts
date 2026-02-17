import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../src/db.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const method = req.method;
  if (method !== 'GET')
    res.status(405).json({ error: 'Method not allowed' });
  const { rows } = await query(
    `SELECT id, name FROM games;`
  );

  res.status(200).json(rows);
}
