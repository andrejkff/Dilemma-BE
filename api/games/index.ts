import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../src/db.js';
import { getCache } from '@vercel/functions';

import headersService from '../../src/services/headers.js';

const CACHE_KEY = 'games_index';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

  const method = req.method;
  if (method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });
  const cache = getCache();
  const cachedGames = await cache.get(CACHE_KEY);
  if (cachedGames) return res.status(200).json(cachedGames);
  try {
    const { rows } = await query(
      `SELECT id, name, under_construction FROM games;`
    );
    await cache.set(CACHE_KEY, rows, { ttl: 3600 * 24 });
    res.status(200).json(rows);
  } catch (e) {
    res.status(500).json(e);
  }
}
