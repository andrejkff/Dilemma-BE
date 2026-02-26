import { query } from '../db.js';

async function getOutcomeNextPoints(outcome_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM outcome_next_points WHERE outcome_id = $1`,
    [outcome_id]
  );
  return rows;
};

async function getOutcomeNextStatuses(outcome_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM outcome_next_statuses WHERE outcome_id = $1`,
    [outcome_id]
  );
  return rows;
};

async function getOutcomeExcludedStatuses(outcome_id: string): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM outcome_excluded_statuses WHERE outcome_id = $1`,
    [outcome_id]
  );
  return rows;
};

async function renderOutcomeView(outcome_row: any, pointSlots: any[], statuses: Array<{ id: string}>): Promise<any> {
  const [
    nextPoints,
    nextStatuses,
    excludedStatuses,
  ] = await Promise.all([
    getOutcomeNextPoints(outcome_row['id']),
    getOutcomeNextStatuses(outcome_row['id']),
    getOutcomeExcludedStatuses(outcome_row['id']),
  ]);
  const is_for_statuses = statuses.map(s => s.id).filter(id => !excludedStatuses.find(es => es.status_id === id));
  const next_points: any = {};
  const next_statuses = nextStatuses.map(s => s.status_id);
  nextPoints.forEach(np => {
    const slot_key = pointSlots.find(ps => ps.id === np.point_slot_id).slot_key
    next_points[slot_key] = {
      value: parseFloat(np.value),
      do_not_affect_dependent_slots: np.do_not_affect_dependent_slots || false,
    };
  });
  const ret: any = {
    ...outcome_row,
    next_points,
    next_statuses,
    is_for_statuses,
    required_documents: [],
  };

  return ret;
}

async function getOutcomesFor(game_id: string): Promise<any[]> {
  const { rows } = await query(
    'SELECT * FROM game_outcomes WHERE game_id = $1 ORDER BY id ASC;',
    [game_id]
  );
  return rows;
}

export default {
  renderOutcomeView,
  getOutcomesFor,
};
