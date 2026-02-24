import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCache } from '@vercel/functions';

import headersService from '../../../../../src/services/headers.js';
import questionsService from '../../../../../src/services/questions.js';
import statusService from '../../../../../src/services/status.js';
import pointsService from '../../../../../src/services/points.js';
import { CACHE_ENTRY_TTL_MS } from '../../../../../src/constants.js';

function buildCacheKey(stage_id: string): string {
  return `stage_${stage_id}_questions`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  headersService.addDefaultResponseHeaders(req, res);

  const method = req.method;
  if (method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });
  const cache = getCache();

  const stage_id = req.query.stage_id;
  if (!stage_id) return res.status(400).json({ error: 'Missing stage id' });

  const cacheKey = buildCacheKey(stage_id as string);
  const cachedQuestions = await cache.get(cacheKey);
  if (cachedQuestions) return res.status(200).json(cachedQuestions);

  try {
    const game_id = req.query.game_id;
    const [
      questions,
      statuses,
      pointSlots,
    ] = await Promise.all([
      questionsService.getQuestionsList(stage_id as string),
      statusService.getGameStatuses(game_id as string),
      pointsService.getGamePointSlots(game_id as string)
    ]);
    const getQuestionsDetailsPromises: Array<Promise<any>> = [];
    questions.forEach(q => getQuestionsDetailsPromises.push(questionsService.renderQuestionView(q, statuses, pointSlots)));
    const detailedQuestionsList = await Promise.all(getQuestionsDetailsPromises);
    await cache.set(cacheKey, detailedQuestionsList, { ttl: CACHE_ENTRY_TTL_MS });
    res.status(200).json(detailedQuestionsList)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err });
  }
};
