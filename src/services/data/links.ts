import { query } from '../../db.js';

async function getLink(id: string): Promise<any | false> {
  const { rows } = await query(
    `SELECT * FROM external_links WHERE id = $1`,
    [id]
  );
  if (!rows.length) return false;
  return rows[0];
};

async function getLinksForOutcome(id: string): Promise<any[]> {
  const { rows } = await query(
    `SELECT link_id FROM outcome_links WHERE outcome_id = $1`,
    [id],
  );
  if (!rows.length) return [];
  const linksDetails = await Promise.all(
    rows.map(r => getLink(r.link_id))
  );
  return linksDetails.filter(ld => ld !== false);
};

export default {
  getLinksForOutcome,
  getLink,
}
