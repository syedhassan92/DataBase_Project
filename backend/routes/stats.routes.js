const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');

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
      SELECT 
        t.TeamID,
        t.TeamName, 
        ts.MatchesPlayed,
        ts.Wins, 
        ts.Draws,
        ts.Losses, 
        ts.GoalsFor,
        ts.GoalDifference,
        ts.Points
      FROM TEAMSTATS ts
      JOIN TEAM t ON ts.TeamID = t.TeamID
      WHERE ts.LeagueID = ?
      ORDER BY ts.Points DESC, ts.GoalDifference DESC, ts.GoalsFor DESC
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

// Save player stats from match
router.post('/players', adminAuth, async (req, res) => {
  try {
    const { matchId, playerStats } = req.body;
    
    if (!matchId || !playerStats || playerStats.length === 0) {
      return res.status(400).json({ error: { message: 'Match ID and player stats are required', status: 400 } });
    }

    // Get match details to determine if it's a win
    const [matches] = await db.query(`
      SELECT Team1ID, Team2ID, Team1Score, Team2Score, WinnerTeamID 
      FROM \`MATCH\` 
      WHERE MatchID = ?
    `, [matchId]);
    
    if (matches.length === 0) {
      return res.status(404).json({ error: { message: 'Match not found', status: 404 } });
    }

    const match = matches[0];

    // Update stats for each player
    for (const stat of playerStats) {
      const { playerId, goals, assists } = stat;
      
      // Get player's team to check if they won
      const [playerTeams] = await db.query(`
        SELECT TeamID 
        FROM PLAYERTEAM 
        WHERE PlayerID = ? AND IsCurrent = TRUE
      `, [playerId]);
      
      if (playerTeams.length === 0) continue;
      
      const playerTeamId = playerTeams[0].TeamID;
      const isWin = match.WinnerTeamID === playerTeamId ? 1 : 0;

      // Check if player stats record exists
      const [existingStats] = await db.query(`
        SELECT StatsID 
        FROM PLAYERSTATS 
        WHERE PlayerID = ?
      `, [playerId]);

      if (existingStats.length > 0) {
        // Update existing stats
        await db.query(`
          UPDATE PLAYERSTATS 
          SET 
            MatchesPlayed = MatchesPlayed + 1,
            Wins = Wins + ?,
            GoalsOrRuns = GoalsOrRuns + ?,
            Assists = Assists + ?
          WHERE PlayerID = ?
        `, [isWin, parseInt(goals) || 0, parseInt(assists) || 0, playerId]);
      } else {
        // Create new stats record
        await db.query(`
          INSERT INTO PLAYERSTATS (PlayerID, MatchesPlayed, Wins, GoalsOrRuns, Assists, Rating)
          VALUES (?, 1, ?, ?, ?, 0.00)
        `, [playerId, isWin, parseInt(goals) || 0, parseInt(assists) || 0]);
      }
    }

    res.json({ message: 'Player stats updated successfully' });
  } catch (error) {
    console.error('Error saving player stats:', error);
    res.status(500).json({ error: { message: 'Failed to save player stats', status: 500 } });
  }
});

module.exports = router;
