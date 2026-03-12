import { query } from '../../db.js';

async function getBadge(id: string): Promise<any | false> {
  const { rows } = await query(
    `SELECT * FROM badges WHERE id = $1`,
    [id]
  );
  if (!rows.length) return false;
  return rows[0];
};

export default {
  getBadge,
};
