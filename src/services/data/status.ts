import { query } from '../../db.js';

async function getPointAdjustmentsFor(status_id: string, game_id: string): Promise<any[]> {
  const { rows } = await query(
    `SELECT s.min_value_increment, s.max_value_increment, p.slot_key
    FROM status_point_limits_adjust s
    JOIN point_slots p ON p.id = s.points_id
    WHERE s.game_id = $2 AND s.status_id = $1`,
    [status_id, game_id]
  );
  return rows;
};

async function renderStatus(status_row: any, game_id: string): Promise<any> {
  const pointAdjustRows = await getPointAdjustmentsFor(status_row.id, game_id);
  const point_limits_adjust: any = {};
  pointAdjustRows.forEach(par => {
    point_limits_adjust[par.slot_key] = {
      min_value_increment: par.min_value_increment,
      max_value_increment: par.max_value_increment,
    };
  })
  return {
    id: status_row.id,
    name: status_row.name,
    point_limits_adjust,
  };
};

async function getGameStatuses(game_id: string): Promise<any[]> {
  const status_map: any = {};
  const { rows: statusRows } = await query(
    `SELECT * FROM game_statuses WHERE game_id = $1`,
    [game_id]
  );
  const mapped_statuses = await Promise.all(
    statusRows.map(sr => renderStatus(sr, game_id))
  );
  mapped_statuses.forEach(ms => {
    status_map[ms.id] = {
      name: ms.name,
      point_limits_adjust: ms.point_limits_adjust,
    };
  });

  return status_map;
};

async function getGameStatusesMinimal(game_id: string): Promise<any[]> {
  const { rows } = await query(
    `SELECT * FROM game_statuses WHERE game_id = $1`,
    [game_id]
  );
  return rows;
}

export default {
  getGameStatuses,
  getGameStatusesMinimal,
};
