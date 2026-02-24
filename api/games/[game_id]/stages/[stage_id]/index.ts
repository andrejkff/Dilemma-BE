import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../../../../../src/db.js';
import { getCache } from '@vercel/functions';

import headersService from '../../../../../src/services/headers.js';
import { CACHE_ENTRY_TTL_MS } from '../../../../../src/constants.js';

function buildCacheKey(stage_id: string): string {
  return `stage_${stage_id}_full_view`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

  const method = req.method;
  if (method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });
  const cache = getCache();

  const id = req.query.stage_id;
  if (!id) return res.status(400).json({ error: 'Missing stage id' });

  const cacheKey = buildCacheKey(id as string);
  const cachedStage = await cache.get(cacheKey);
  if (cachedStage) return res.status(200).json(cachedStage);

  try {
    const { rows: stageRows } = await query(
      'SELECT * FROM stages WHERE id = $1;',
      [id]
    );

    if (stageRows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const stage = stageRows[0];
    await cache.set(cacheKey, stage, { ttl: CACHE_ENTRY_TTL_MS });

    res.status(200).json(stage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err });
  }
}
