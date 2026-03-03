import type { VercelRequest, VercelResponse } from '@vercel/node';

import headersService from '../../../../src/services/utils/headers.js';

// TODO rework DB so these are fetched from it instead of hard-coded values
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

  const method = req.method;
  if (method !== 'GET')
    return res.status(405).json({ error: 'Method not allowed' });

  const game_id = req.query.game_id;
  if (
    !['1', '2'].includes(game_id as string)
  )
    return res.status(404).json({ error: 'Game not found' });

  let has_business: Array<{key: string | boolean, label: string }>;

  switch (game_id) {
    case '1':
      has_business = [
        { key: true, label: 'Издавам сместување/соби' },
        { key: false, label: 'Не издавам сместување/соби' },
      ];
      break;
    case '2':
      has_business = [
        { key: true, label: 'Поседувам лозје/опрема за производство' },
        { key: false, label: 'Не поседувам лозје/опрема за производство' },
      ];
      break;
    default:
      has_business = [];
      break;
  }

  res.status(200).json({
    age_group: [
      { key: 'up_to_24', label: 'Помлад/а од 25 години' },
      { key: '25_49', label: 'Меѓу 25 и 49 години' },
      { key: '50_plus', label: '50 години или постар/а' },
    ],
    gender: [
      { key: 'male', label: 'Машки' },
      { key: 'female', label: 'Женски' },
    ],
    location: [
      { key: 'dk', label: 'Демир Капија' },
      { key: 'other', label: 'Друга локација'}
    ],
    has_business,
  });
};
