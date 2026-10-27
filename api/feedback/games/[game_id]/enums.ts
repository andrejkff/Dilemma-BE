import type { VercelRequest, VercelResponse } from '@vercel/node';

import headersService from '../../../../src/services/utils/headers.js';

type Enum = { key: string | boolean; label: string; label_en: string };
type Field = { label: string; label_en: string; enums: Array<Enum> };

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

  let has_business: Field = {
    label: 'Статус',
    label_en: 'Status',
    enums: [],
  };

  switch (game_id) {
    case '1':
      has_business.enums = [
        {
          key: true,
          label: 'Издавам сместување/соби',
          label_en: 'I rent out accommodation/rooms',
        },
        {
          key: false,
          label: 'Не издавам сместување/соби',
          label_en: "I don't rent out accommodation/rooms",
        },
      ];
      break;
    case '2':
      has_business.enums = [
        {
          key: true,
          label: 'Поседувам лозје/опрема за производство',
          label_en: 'I own a vineyard/production equipment',
        },
        {
          key: false,
          label: 'Не поседувам лозје/опрема за производство',
          label_en: "I don't own a vineyard/production equipment",
        },
      ];
      break;
    default:
      break;
  }

  res.status(200).json({
    age_group: {
      label: 'Возраст',
      label_en: 'Age',
      enums: [
        { key: 'up_to_24', label: 'Помлад/а од 25 години', label_en: 'Under 25 years old' },
        { key: '25_49', label: 'Меѓу 25 и 49 години', label_en: 'Between 25 and 49 years old' },
        { key: '50_plus', label: '50 години или постар/а', label_en: '50 years or older' },
      ],
    },
    gender: {
      label: 'Пол',
      label_en: 'Gender',
      enums: [
        { key: 'male', label: 'Машки', label_en: 'Male' },
        { key: 'female', label: 'Женски', label_en: 'Female' },
      ],
    },
    location: {
      label: 'Локација',
      label_en: 'Location',
      enums: [
        { key: 'dk', label: 'Демир Капија', label_en: 'Demir Kapija' },
        { key: 'other', label: 'Друга локација', label_en: 'Other location' },
      ],
    },
    has_business,
  });
};
