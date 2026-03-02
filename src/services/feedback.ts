import { query } from '../db.js';

async function saveSession(sessionId: string, gameId: number): Promise<void> {
  const result = await query(
    `INSERT INTO game_sessions VALUES($1, $2)`,
    [sessionId, gameId]
  );
  console.log(result)
};

export default {
  saveSession,
};
