import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../src/db.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { rows } = await query(
    `SELECT id, name FROM games;`
  );

  res.json(rows);
}
