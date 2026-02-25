import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCache } from '@vercel/functions';

import headersService from '../../src/services/headers.js';
import gamesService from '../../src/services/games.js';
import { CACHE_ENTRY_TTL_MS } from '../../src/constants.js';

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
    const games = await gamesService.getGames();
    await cache.set(CACHE_KEY, games, { ttl: CACHE_ENTRY_TTL_MS });
    res.status(200).json(games);
  } catch (e) {
    res.status(500).json(e);
  }
}
