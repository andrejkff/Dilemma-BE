import { query } from '../db.js';

async function getGamePointSlots(game_id: string): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM point_slots WHERE game_id = $1`,
    [game_id]
  );
  return rows;
};

export default {
  getGamePointSlots,
};
