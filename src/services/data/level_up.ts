import { query } from '../../db.js';
import linksService from './links.js';

async function getLevelUpNextStatus(level_up_id: string): Promise<any[] | false> {
  const { rows: nextStatusRows } = await query(
    'SELECT status_id, text, remove_status_id, hide_for_status_id, outcome_html FROM level_up_next_status WHERE level_up_id = $1',
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
    nextStatusesRes,
  ] = await Promise.all([
    getLevelUpNextStatus(id),
  ]);
  let next_statuses: any[] = [];
  if (nextStatusesRes !== false)
    next_statuses = [
      ...nextStatusesRes,
    ];
  const links = await linksService.getLinksForLevelUpOutcome(id);
  return {
    ...levelUpRows[0],
    next_statuses,
    links: links.map(l => ({ name: l.name, link: l.url })),
  }
};

export default {
  renderLevelUpView,
};
