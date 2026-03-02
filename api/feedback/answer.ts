import type { VercelRequest, VercelResponse } from '@vercel/node';

import headersService from '../../src/services/headers.js';
import feedbackService from '../../src/services/feedback.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

  const method = req.method;
  if (method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      question_id,
      answer_id,
      outcome_id,
      order_number,
      session_id,
    } = req.body;
    await feedbackService.saveAnsweredQuestion(
      question_id,
      answer_id,
      outcome_id,
      order_number,
      session_id,
    );

    res.status(200).json({ status: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err });
  };
}
