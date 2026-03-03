import { query } from '../db.js';

async function getGames(): Promise<any[]> {
  const { rows } = await query(
    `SELECT id, name, under_construction FROM games;`
  );
  return rows;
};

async function getGame(id: string): Promise<any | false> {
  const { rows: gameRows } = await query(
    'SELECT * FROM games WHERE id = $1;',
    [id]
  );
  if (!gameRows?.length) return false;
  return gameRows[0];
}

export default {
  getGames,
  getGame,
};
