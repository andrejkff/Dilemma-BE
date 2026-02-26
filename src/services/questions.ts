import { query } from '../db.js';
import answersService from './answers.js';
import levelUpService from './level_up.js';

async function getQuestionDependencies(question_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM question_dependencies WHERE question_id = $1`,
    [question_id]
  );
  return rows;
};

async function getQuestionExcludedStatuses(question_id: number): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM question_excluded_statuses WHERE question_id = $1`,
    [question_id]
  );
  return rows;
};

async function getQuestionAnswers(question_id: number, statuses: Array<{ id: string }>, pointSlots: any[]): Promise<any[]> {
  const { rows } =  await query(
    `SELECT * FROM answers WHERE question_id = $1`,
    [question_id],
  );
  const answerDetailsPromises: Promise<any>[] = [];
  rows.forEach(r => answerDetailsPromises.push(answersService.renderAnswerView(r, statuses, pointSlots)));
  const answers = await Promise.all(answerDetailsPromises);
  return answers;
};

async function renderQuestionView(question_row: any, statuses: Array<{id: string}>, pointSlots: any[]): Promise<object> {
  const question_id = question_row['id'];
  const [
    dependencies,
    excludedStatuses,
    answers,
  ] = await Promise.all([
    getQuestionDependencies(question_id),
    getQuestionExcludedStatuses(question_id),
    getQuestionAnswers(question_id, statuses, pointSlots),
  ]);
  const required_statuses = statuses.map(s => s.id).filter(id => !excludedStatuses.find(es => es.status_id === id));
  const ret = {
    ...question_row,
    required_statuses,
    preceeding_question_ids: dependencies.map(d => d.required_question_id),
    answers,
  };
  if (question_row['level_up_id']) {
    const level_up = await levelUpService.renderLevelUpView(question_row['level_up_id']);
    ret.level_up = level_up;
  } else
    ret.level_up = null;
  delete ret['level_up_id'];
  return ret;
};

async function getQuestionsList(stage_id: string): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM questions WHERE stage_id = $1 ORDER BY id`,
    [stage_id]
  );
  return rows;
};

export default {
  renderQuestionView,
  getQuestionsList,
};
