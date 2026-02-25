import { query } from '../db.js';

async function getBackgroundFor(game_id: string): Promise<any | false> {
  const { rows: graphicsRows } = await query(
    'SELECT * FROM game_graphics WHERE game_id = $1;',
    [game_id]
  );
  if (!graphicsRows.length) return false;
  return graphicsRows[0];
};

async function getInitialSprite(sprite_id: string): Promise<any | false> {
  const { rows: initialSpriteRows } = await query(
    `SELECT * FROM game_sprites WHERE id = $1;`,
    [sprite_id]
  );
  if (!initialSpriteRows) return false;
  return initialSpriteRows[0];
};

export default {
  getBackgroundFor,
  getInitialSprite,
};
