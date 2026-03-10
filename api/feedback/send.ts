import type { VercelRequest, VercelResponse } from '@vercel/node';

import headersService from '../../src/services/utils/headers.js';
import processPayloadService from '../../src/services/utils/processPayload.js';
import feedbackService from '../../src/services/data/feedback.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

  const method = req.method;
  if (method === 'OPTIONS') return;
  if (method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  const { feedbackType } = req.query;

  let requiredFieldNames: string[] = [];
  switch(feedbackType) {
    case 'answer':
      requiredFieldNames = ['question_id', 'answer_id','outcome_id', 'order_number', 'session_id', 'status_id', 'game_id'];
      break;
    case 'game':
      requiredFieldNames = ['game_id', 'session_id'];
      break;
    case 'outcome':
      requiredFieldNames = ['outcome_id', 'session_id'];
      break;
    case 'user':
      requiredFieldNames = ['age_group', 'gender', 'location', 'has_business', 'session_id'];
      break;
    default:
      return res.status(400).json({ error: 'Invalid feedback type parameter' });
  };

  const missingFieldNames = processPayloadService.checkMissingFields(
    requiredFieldNames, req.body
  );

  if (missingFieldNames.length)
    return res.status(400).json({
      error: processPayloadService.buildMissingFieldsMessage(missingFieldNames)
    });

  const {
    question_id,
    answer_id,
    outcome_id,
    order_number,
    session_id,
    game_id,
    age_group,
    gender,
    location,
    has_business,
    status_id,
  } = req.body;

  try {
    switch(feedbackType) {
      case 'answer':
        await feedbackService.saveAnsweredQuestion(
          question_id,
          answer_id,
          outcome_id,
          order_number,
          session_id,
          status_id,
          game_id,
        );
        break;
      case 'game':
        await feedbackService.saveSession(session_id, game_id);
        break;
      case 'outcome':
        await feedbackService.saveOutcome(session_id, outcome_id);
        break;
      case 'user':
        await feedbackService.saveUser(
          age_group,
          gender,
          location,
          has_business,
          session_id,
        );
        break;
      default:
        return res.status(500).json({ error: 'An error has occured' })
    };
    res.status(200).json({ status: 'OK' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err });
  }
}
