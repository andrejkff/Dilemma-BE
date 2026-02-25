import type { VercelRequest, VercelResponse } from '@vercel/node';

import { getCache } from '@vercel/functions';

import headersService from '../../../src/services/headers.js';
import gamesService from '../../../src/services/games.js';
import pointsService from '../../../src/services/points.js';
import statusService from '../../../src/services/status.js';
import outcomesService from '../../../src/services/outcomes.js';
import graphicsService from '../../../src/services/graphics.js';

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
    const gameRes = await gamesService.getGame(id as string);

    if (gameRes === false) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const game = gameRes;

    const pointRows = await pointsService.getGamePointSlots(id as string);

    const points_map: Record<string, any> = {};
    pointRows.forEach((slot) => {
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

    const statusRows = await statusService.getGameStatuses(id as string);
    const status_map: Record<string, any> = {};
    statusRows.forEach((status) => {
      status_map[status.id] = { name: status.name };
    });

    const outcomesRows = await outcomesService.getOutcomesFor(id as string);
    const outcomes = outcomesRows.map((o) => ({
      min_calculated_points: o.min_calculated_points,
      max_calculated_points: o.max_calculated_points,
      outcome_html: o.outcome_html,
    }));

    const graphicsRes = await graphicsService.getBackgroundFor(id as string);
    const graphics: any = {
      background_image_url: graphicsRes?.background_image_url || null,
      initial_sprites: [],
    };
    if (game.initial_sprite_id) {
      const initialSprite = await graphicsService.getInitialSprite(game.initial_sprite_id as string);
      if (!!initialSprite) {
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
