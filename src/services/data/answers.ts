import { query } from '../db.js';
import outcomesService from './outcomes.js';

async function getAnswerExcludedStatuses(answer_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM answer_excluded_statuses WHERE answer_id = $1`,
    [answer_id]
  );
  return rows;
};

async function getAnswerOutcomes(answer_id: number, pointSlots: any[], statuses: Array<{ id: string}>): Promise<any[]> {
  const { rows } = await query(
    `SELECT* FROM outcomes WHERE answer_id = $1`,
    [answer_id],
  );
  const outcomeDetailsPromises: Promise<any>[] = [];
  rows.forEach(r => outcomeDetailsPromises.push(outcomesService.renderOutcomeView(r, pointSlots, statuses)));
  const outcomes = await Promise.all(outcomeDetailsPromises);
  return outcomes;
};

async function renderAnswerView(answer_row: any, statuses: Array<{ id: string }>, pointSlots: any[]): Promise<any> {
  const answer_id = answer_row['id'];
  const [
    excludedStatuses,
    outcomes,
  ] = await Promise.all([
    getAnswerExcludedStatuses(answer_id),
    getAnswerOutcomes(answer_id, pointSlots, statuses),
  ]);
  const is_for_statuses = statuses.map(s => s.id).filter(id => !excludedStatuses.find(es => es.status_id === id));
  return {
    ...answer_row,
    is_for_statuses,
    outcomes,
  };
};

export default {
  renderAnswerView,
};
