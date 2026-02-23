import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getCache } from '@vercel/functions';
import { query } from '../../../src/db.js';

import headersService from '../../../src/services/headers.js';

import { CACHE_ENTRY_TTL_MS } from '../../../src/constants.js';

function buildCacheKey(game_id: string): string {
  return `game_${game_id}_full_view`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  headersService.addDefaultResponseHeaders(req, res);

  const cache = getCache();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const id = req.query.game_id;
  if (!id) return res.status(400).json({ error: 'Missing game id' });

  const cacheKey = buildCacheKey(id as string);
  const cachedGame = await cache.get(cacheKey);
  if (cachedGame) return res.status(200).json(cachedGame);

  try {
    const { rows: gameRows } = await query(
      'SELECT * FROM games WHERE id = $1;',
      [id]
    );

    if (gameRows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const game = gameRows[0];

    const { rows: slotsRows } = await query(
      'SELECT * FROM point_slots WHERE game_id = $1 ORDER BY id ASC;',
      [id]
    );

    const points_map: Record<string, any> = {};
    slotsRows.forEach((slot) => {
      points_map[slot.slot_key] = {
        id: slot.id,
        name: slot.name,
        initial_value: parseInt(slot.initial_value),
        min_value: parseInt(slot.min_value),
        max_value: parseInt(slot.max_value),
        decimal_places: slot.decimal_places,
        points_unit: slot.points_unit,
        include_in_game_outcome_calculation: slot.include_in_game_outcome_calculation,
        continuousConfig: slot.continuous_config,
        outcomeConfig: slot.outcome_config,
      };
    });

    const { rows: statusesRows } = await query(
      'SELECT id, name FROM game_statuses WHERE game_id = $1;',
      [id]
    );
    const status_map: Record<string, any> = {};
    statusesRows.forEach((status) => {
      status_map[status.id] = { name: status.name };
    });

    const { rows: outcomesRows } = await query(
      'SELECT * FROM game_outcomes WHERE game_id = $1 ORDER BY id ASC;',
      [id]
    );

    const outcomes = outcomesRows.map((o) => ({
      min_calculated_points: o.min_calculated_points,
      max_calculated_points: o.max_calculated_points,
      outcome_html: o.outcome_html,
    }));

    const { rows: graphicsRows } = await query(
      'SELECT * FROM game_graphics WHERE game_id = $1;',
      [id]
    );
    const graphics = graphicsRows[0] || { background_image_url: null };

    graphics.initial_sprites = [];
    if (game.initial_sprite_id) {
      const { rows: initialSpriteRows } = await query(
        `SELECT * FROM game_sprites WHERE id = $1;`,
        [game.initial_sprite_id]
      );
      if (initialSpriteRows[0]) {
        const initialSprite = initialSpriteRows[0];
        graphics.initial_sprites.push({
          id: initialSprite.id,
          image_url: initialSprite.image_url,
          left: initialSprite.left_pos,
          top: initialSprite.top_pos,
        });
      }
    }

    const fullGame = {
      id: game.id,
      name: game.name,
      first_stage_id: game.first_stage_id,
      initial_status: game.initial_status,
      under_construction: game.under_construction,
      timeline_config: {
        unitName: game.timeline_unit_name,
        incrementStep: game.timeline_increment_step,
        max_value: game.timeline_max_value,
      },
      points_map,
      status_map,
      outcomes,
      graphics_config: graphics,
    };

    await cache.set(cacheKey, fullGame, { ttl: CACHE_ENTRY_TTL_MS });

    res.status(200).json(fullGame);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error', details: err });
  }
}
