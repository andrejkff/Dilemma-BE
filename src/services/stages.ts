import { query } from '../db.js';

async function getStage(stage_id: string): Promise<any | boolean> {
  const { rows: stageRows } = await query(
    'SELECT * FROM stages WHERE id = $1;',
    [stage_id]
  );
  if (!stageRows.length) return false;
  return stageRows[0];
}

export default {
  getStage,
};
