import { db } from "../../db/connection";
import type { ResultSetHeader } from "mysql2";
import { logAction } from "../../utils/logger";

/* =========================
   GET ALL DEATH EVENTS
========================= */
export const getDeathEvents = (req: any, res: any) => {
  const sql = `
    SELECT 
      d.id,
      d.member_id,
      d.date_of_death,
      d.status,
      d.released_by,
      d.released_at,
      d.created_at,

      CONCAT(
        m.first_name,
        ' ',
        IFNULL(CONCAT(m.middle_name, ' '), ''),
        m.last_name
      ) AS member_name,

      m.member_code

    FROM death_events d
    LEFT JOIN members m ON m.id = d.member_id
    ORDER BY d.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET DEATH EVENTS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch death events",
        error: err,
      });
    }

    res.json(results);
  });
};

/* =========================
   CREATE DEATH EVENT
========================= */
export const createDeathEvent = (req: any, res: any) => {
  const { memberId, dateOfDeath } = req.body;
  const user = req.user;

  if (!memberId || !dateOfDeath) {
    return res.status(400).json({
      message: "memberId and dateOfDeath are required",
    });
  }

  const existingEventSql = `
    SELECT id
    FROM death_events
    WHERE member_id = ?
    LIMIT 1
  `;

  const insertSql = `
    INSERT INTO death_events (
      member_id,
      date_of_death,
      status,
      created_at
    )
    VALUES (?, ?, 'Pending', NOW())
  `;

  const updateMemberSql = `
    UPDATE members
    SET status = 'deceased'
    WHERE id = ?
  `;

  db.getConnection((connectionErr, connection) => {
    if (connectionErr) {
      console.error("GET TRANSACTION CONNECTION ERROR:", connectionErr);
      return res.status(500).json({
        message: "Failed to create death event",
        error: connectionErr,
      });
    }

    connection.beginTransaction((txErr) => {
      if (txErr) {
        connection.release();
        console.error("BEGIN TRANSACTION ERROR:", txErr);
        return res.status(500).json({ message: "Failed to create death event", error: txErr });
      }

      connection.query(existingEventSql, [memberId], (checkErr, existingRows: any[]) => {
        if (checkErr) {
          console.error("CHECK DEATH EVENT ERROR:", checkErr);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({
              message: "Failed to create death event",
              error: checkErr,
            });
          });
        }

        if (existingRows.length > 0) {
          return connection.rollback(() => {
            connection.release();
            res.status(409).json({ message: "A death event already exists for this member" });
          });
        }

        connection.query(insertSql, [memberId, dateOfDeath], (insertErr, result: ResultSetHeader) => {
          if (insertErr) {
            console.error("CREATE DEATH EVENT ERROR:", insertErr);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({ message: "Failed to create death event", error: insertErr });
            });
          }

          connection.query(updateMemberSql, [memberId], (updateErr) => {
            if (updateErr) {
              console.error("UPDATE MEMBER STATUS ERROR:", updateErr);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({ message: "Failed to update member status", error: updateErr });
              });
            }

            connection.commit((commitErr) => {
              if (commitErr) {
                console.error("COMMIT ERROR:", commitErr);
                return connection.rollback(() => {
                  connection.release();
                  res.status(500).json({ message: "Failed to create death event", error: commitErr });
                });
              }

              logAction("CREATE_DEATH_EVENT", `Created death event for member ${memberId}`, {
                id: user?.id,
                role: user?.role,
              });

              connection.release();
              res.status(201).json({ message: "Death event created", id: result.insertId });
            });
          });
        });
      });
    });
  });
};

/* =========================
   UPDATE DEATH EVENT
========================= */
export const updateDeathEvent = (req: any, res: any) => {
  const { id } = req.params;
  const { dateOfDeath } = req.body;
  const user = req.user;

  if (!id || !dateOfDeath) {
    return res.status(400).json({
      message: "Event ID and dateOfDeath are required",
    });
  }

  const sql = `
    UPDATE death_events
    SET date_of_death = ?
    WHERE id = ? AND status != 'Released'
  `;

  db.query(sql, [dateOfDeath, id], (err, result: ResultSetHeader) => {
    if (err) {
      console.error("UPDATE DEATH EVENT ERROR:", err);

      return res.status(500).json({
        message: "Failed to update death event",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Death event not found or already released",
      });
    }

    logAction("UPDATE_DEATH_EVENT", `Updated death event ${id}`, {
      id: user?.id,
      role: user?.role,
    });

    res.json({
      message: "Death event updated",
      affectedRows: result.affectedRows,
    });
  });
};

/* =========================
   RELEASE FUNERAL ASSISTANCE
========================= */
export const releaseDeathEvent = (req: any, res: any) => {
  const { id } = req.params;
  const user = req.user;

  if (!id) {
    return res.status(400).json({
      message: "Missing event ID",
    });
  }

  const sql = `
    UPDATE death_events
    SET 
      status = 'Released',
      released_by = ?,
      released_at = NOW()
    WHERE id = ? AND status != 'Released'
  `;

  db.query(sql, [user?.id || "system", id], (err, result: ResultSetHeader) => {
    if (err) {
      console.error("RELEASE DEATH EVENT ERROR:", err);

      return res.status(500).json({
        message: "Failed to release death event",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Death event not found or already released",
      });
    }

    logAction(
      "RELEASE_DEATH_EVENT",
      `Released funeral assistance for event ${id}`,
      {
        id: user?.id,
        role: user?.role,
      }
    );

    res.json({
      message: "Death event released successfully",
      affectedRows: result.affectedRows,
    });
  });
};