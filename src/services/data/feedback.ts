import { query } from '../db.js';

async function saveSession(sessionId: string, gameId: number): Promise<void> {
  await query(
    `INSERT INTO game_sessions VALUES($1, $2)`,
    [sessionId, gameId]
  );
};

async function saveUser(
  age_group: string,
  gender: string,
  location: string,
  has_business: boolean,
  session_id: string,
) {
  await query (
    `
      INSERT INTO players (
        age_group,
        gender,
        location,
        has_business,
        session_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      );
    `, [
      age_group,
      gender,
      location,
      has_business,
      session_id,
    ]
  );
};

async function saveAnsweredQuestion(
  question_id: number,
  answer_id: number,
  outcome_id: number,
  order_number: number,
  session_id: string,
) {
  await query (
    `
      INSERT INTO answered_questions (
        question_id,
        answer_id,
        outcome_id,
        order_number,
        session_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
    `, [
      question_id,
      answer_id,
      outcome_id,
      order_number,
      session_id,
    ]
  )
}

export default {
  saveSession,
  saveUser,
  saveAnsweredQuestion,
};
