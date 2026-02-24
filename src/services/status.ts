import { query } from '../db.js';

async function getGameStatuses(game_id: string): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM game_statuses WHERE game_id = $1`,
    [game_id]
  );
  return rows;
}

export default {
  getGameStatuses,
};
