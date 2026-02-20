import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../src/db.js';

import headersService from '../../src/services/headers.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

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
