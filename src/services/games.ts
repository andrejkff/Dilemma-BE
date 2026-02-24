import { query } from '../db.js';

async function getGames(): Promise<any[]> {
  const { rows } = await query(
    `SELECT id, name, under_construction FROM games;`
  );
  return rows;
};

export default {
  getGames,
};
