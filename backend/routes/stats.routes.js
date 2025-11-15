const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth } = require('../middleware/auth');

// Dashboard statistics
router.get('/dashboard', auth, async (req, res) => {
  try {
    const [leagueCount] = await db.query('SELECT COUNT(*) as count FROM LEAGUE');
    const [tournamentCount] = await db.query('SELECT COUNT(*) as count FROM TOURNAMENT');
    const [teamCount] = await db.query('SELECT COUNT(*) as count FROM TEAM');
    const [playerCount] = await db.query('SELECT COUNT(*) as count FROM PLAYER');
    const [matchCount] = await db.query('SELECT COUNT(*) as count FROM \`MATCH\`');
    const [upcomingMatches] = await db.query(`
      SELECT COUNT(*) as count FROM \`MATCH\` 
      WHERE Status = 'Scheduled' AND MatchDate >= CURDATE()
    `);

    res.json({
      leagues: leagueCount[0].count,
      tournaments: tournamentCount[0].count,
      teams: teamCount[0].count,
      players: playerCount[0].count,
      matches: matchCount[0].count,
      upcomingMatches: upcomingMatches[0].count
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch dashboard stats', status: 500 } });
  }
});

// Top players by rating
router.get('/top-players', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [players] = await db.query(`
      SELECT p.PlayerName, t.TeamName, ps.Rating, ps.GoalsOrRuns, ps.Assists
      FROM PLAYERSTATS ps
      JOIN PLAYER p ON ps.PlayerID = p.PlayerID
      LEFT JOIN TEAM t ON p.TeamID = t.TeamID
      ORDER BY ps.Rating DESC
      LIMIT ?
    `, [limit]);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch top players', status: 500 } });
  }
});

// Team standings (by league)
router.get('/standings/:leagueId', auth, async (req, res) => {
  try {
    const [standings] = await db.query(`
      SELECT t.TeamName, ts.Wins, ts.Losses, ts.Draws, ts.Points
      FROM TEAMSTATS ts
      JOIN TEAM t ON ts.TeamID = t.TeamID
      WHERE ts.LeagueID = ?
      ORDER BY ts.Points DESC, ts.Wins DESC
    `, [req.params.leagueId]);
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch standings', status: 500 } });
  }
});

// Recent transfers
router.get('/recent-transfers', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [transfers] = await db.query(`
      SELECT t.TransferDate, t.TransferType, p.PlayerName,
        ft.TeamName as FromTeam, tt.TeamName as ToTeam
      FROM TRANSFER t
      LEFT JOIN TRANSFERDETAILS td ON t.TransferID = td.TransferID
      LEFT JOIN PLAYER p ON td.PlayerID = p.PlayerID
      LEFT JOIN TEAM ft ON t.FromTeamID = ft.TeamID
      LEFT JOIN TEAM tt ON t.ToTeamID = tt.TeamID
      ORDER BY t.TransferDate DESC
      LIMIT ?
    `, [limit]);
    res.json(transfers);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch recent transfers', status: 500 } });
  }
});

module.exports = router;
