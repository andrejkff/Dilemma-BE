import type { VercelRequest, VercelResponse } from '@vercel/node';

import headersService from '../../src/services/utils/headers.js';
import feedbackService from '../../src/services/data/feedback.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

  const method = req.method;
  if (method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { game_id, session_id } = req.body;
    if (!game_id)
      return res.status(400).json({ error: 'Missing game id in payload!' });
    if (!session_id)
      return res.status(400).json({ error: 'Missing session id in payload!' });
    await feedbackService.saveSession(session_id, game_id);

    res.status(200).json({ status: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err });
  };
}
