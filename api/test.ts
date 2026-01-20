import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../src/db.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { rows } = await query(
    `SELECT * FROM playing_with_neon;`
  );

  res.json(rows);
}
