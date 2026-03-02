import { query } from '../db.js';

async function saveSession(sessionId: string, gameId: number): Promise<void> {
  await query(
    `INSERT INTO game_sessions VALUES($1, $2)`,
    [sessionId, gameId]
  );
};

export default {
  saveSession,
};
