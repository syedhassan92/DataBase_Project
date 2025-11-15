const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

const tournamentBaseQuery = `
  SELECT
    t.TournamentID AS id,
    t.TournamentName AS tournamentName,
    t.Description AS description,
    DATE_FORMAT(t.StartDate, '%Y-%m-%d') AS startDate,
    DATE_FORMAT(t.EndDate, '%Y-%m-%d') AS endDate,
    COALESCE(
      t.Status,
      CASE
        WHEN t.StartDate IS NOT NULL AND t.EndDate IS NOT NULL AND CURDATE() BETWEEN t.StartDate AND t.EndDate THEN 'ongoing'
        WHEN t.StartDate IS NOT NULL AND CURDATE() < t.StartDate THEN 'upcoming'
        ELSE 'completed'
      END
    ) AS status,
    t.LeagueID AS leagueId,
    l.LeagueName AS leagueName,
    COUNT(DISTINCT tt.TeamID) AS totalTeams,
    GROUP_CONCAT(DISTINCT tt.TeamID) AS teamIds,
    t.CreatedAt
  FROM TOURNAMENT t
  LEFT JOIN LEAGUE l ON t.LeagueID = l.LeagueID
  LEFT JOIN TOURNAMENTTEAM tt ON t.TournamentID = tt.TournamentID
`;

const formatTournamentRow = (row) => {
  const teamIds = row.teamIds ? row.teamIds.split(',').map((id) => Number(id)).filter(Boolean) : [];
  return {
    id: row.id,
    tournamentName: row.tournamentName,
    description: row.description || '',
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status || 'upcoming',
    leagueId: row.leagueId,
    leagueName: row.leagueName || null,
    totalTeams: Number(row.totalTeams ?? teamIds.length) || 0,
    teams: teamIds,
    createdAt: row.CreatedAt,
  };
};

const fetchTournamentById = async (id) => {
  const [rows] = await db.query(
    `${tournamentBaseQuery} WHERE t.TournamentID = ? GROUP BY t.TournamentID ORDER BY t.CreatedAt DESC`,
    [id]
  );
  if (rows.length === 0) {
    return null;
  }
  return formatTournamentRow(rows[0]);
};

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `${tournamentBaseQuery} GROUP BY t.TournamentID ORDER BY t.CreatedAt DESC`
    );
    res.json(rows.map(formatTournamentRow));
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    res.status(500).json({ error: { message: 'Failed to fetch tournaments', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tournament = await fetchTournamentById(req.params.id);
    if (!tournament) {
      return res.status(404).json({ error: { message: 'Tournament not found', status: 404 } });
    }
    res.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: { message: 'Failed to fetch tournament', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const {
      tournamentName,
      description = '',
      startDate,
      endDate,
      status = 'upcoming',
      leagueId = null,
      selectedTeams = [],
    } = req.body;

    if (!tournamentName || !startDate || !endDate) {
      return res.status(400).json({ error: { message: 'Tournament name, start date, and end date are required', status: 400 } });
    }

    const adminId = Number(req.user?.userId || req.body.adminId);
    if (!adminId) {
      return res.status(400).json({ error: { message: 'Admin context missing', status: 400 } });
    }

    const normalizedLeagueId = leagueId ? Number(leagueId) : null;

    const [result] = await db.query(
      'INSERT INTO TOURNAMENT (AdminID, LeagueID, TournamentName, Description, StartDate, EndDate, Status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [adminId, normalizedLeagueId, tournamentName, description, startDate, endDate, status]
    );

    const tournamentId = result.insertId;

    const teamIds = Array.isArray(selectedTeams)
      ? selectedTeams.map((teamId) => Number(teamId)).filter(Boolean)
      : [];

    if (teamIds.length) {
      const values = teamIds.map((teamId) => [tournamentId, teamId]);
      await db.query('INSERT INTO TOURNAMENTTEAM (TournamentID, TeamID) VALUES ?', [values]);
    }

    const tournament = await fetchTournamentById(tournamentId);
    res.status(201).json(tournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({ error: { message: 'Failed to create tournament', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const {
      tournamentName,
      description = '',
      startDate,
      endDate,
      status = 'upcoming',
      leagueId = null,
      selectedTeams,
    } = req.body;

    await db.query(
      'UPDATE TOURNAMENT SET TournamentName = ?, Description = ?, StartDate = ?, EndDate = ?, Status = ?, LeagueID = ? WHERE TournamentID = ?',
      [tournamentName, description, startDate, endDate, status, leagueId ? Number(leagueId) : null, req.params.id]
    );

    if (Array.isArray(selectedTeams)) {
      await db.query('DELETE FROM TOURNAMENTTEAM WHERE TournamentID = ?', [req.params.id]);
      const teamIds = selectedTeams.map((teamId) => Number(teamId)).filter(Boolean);
      if (teamIds.length) {
        const values = teamIds.map((teamId) => [req.params.id, teamId]);
        await db.query('INSERT INTO TOURNAMENTTEAM (TournamentID, TeamID) VALUES ?', [values]);
      }
    }

    const tournament = await fetchTournamentById(req.params.id);
    res.json(tournament);
  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({ error: { message: 'Failed to update tournament', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM TOURNAMENT WHERE TournamentID = ?', [req.params.id]);
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete tournament', status: 500 } });
  }
});

module.exports = router;
