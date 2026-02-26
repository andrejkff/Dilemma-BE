import { query } from '../db.js';

async function getLevelUpNextStatus(level_up_id: string): Promise<any[] | false> {
  const { rows: nextStatusRows } = await query(
    'SELECT * FROM level_up_next_status WHERE level_up_id = $1',
    [level_up_id]
  );
  if (!nextStatusRows.length) return false;
  return nextStatusRows;
};

async function renderLevelUpView(id: string): Promise<any | false> {
  const { rows: levelUpRows } = await query(
    'SELECT * FROM level_ups WHERE id = $1;',
    [id]
  );
  if (!levelUpRows.length) return false;
  const [
    nextStatusesRes
  ] = await Promise.all([
    getLevelUpNextStatus(id)
  ]);
  let next_statuses: any[] = [];
  if (nextStatusesRes !== false)
    next_statuses = [
      ...nextStatusesRes.map(ns => ({
        status_id: ns.status_id,
        text: ns.text,
      })),
    ];
  return {
    ...levelUpRows[0],
    next_statuses,
  }
};

export default {
  renderLevelUpView,
};
