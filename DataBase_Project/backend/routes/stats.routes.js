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
    const [venueCount] = await db.query('SELECT COUNT(*) as count FROM VENUE');
    const [matchCount] = await db.query('SELECT COUNT(*) as count FROM \`MATCH\`');
    const [upcomingMatches] = await db.query(`
      SELECT COUNT(*) as count FROM \`MATCH\` 
      WHERE Status = 'Scheduled' AND MatchDate >= CURDATE()
    `);
    const [completedMatches] = await db.query(`
      SELECT COUNT(*) as count FROM \`MATCH\` 
      WHERE Status = 'Completed'
    `);

    res.json({
      leagues: leagueCount[0].count,
      tournaments: tournamentCount[0].count,
      teams: teamCount[0].count,
      players: playerCount[0].count,
      venues: venueCount[0].count,
      totalMatches: matchCount[0].count,
      upcomingMatches: upcomingMatches[0].count,
      completedMatches: completedMatches[0].count
    });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch dashboard stats', status: 500 } });
  }
});

// Top players by rating
router.get('/top-players', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'goals';
    const leagueId = req.query.leagueId;
    const orderByClause = sortBy === 'assists' ? 'ps.Assists DESC' : 'ps.Goals DESC';
    
    let query = `
      SELECT 
        ps.StatsID as id,
        p.PlayerName as name, 
        p.PlayerRole as position,
        t.TeamName,
        COALESCE(l.LeagueName, 'N/A') as LeagueName,
        ps.Rating, 
        ps.Goals as goals, 
        ps.Assists as assists
      FROM PLAYERSTATS ps
      JOIN PLAYER p ON ps.PlayerID = p.PlayerID
      LEFT JOIN PLAYERTEAM pt ON p.PlayerID = pt.PlayerID AND pt.IsCurrent = 1
      LEFT JOIN TEAM t ON pt.TeamID = t.TeamID
      LEFT JOIN LEAGUE l ON ps.LeagueID = l.LeagueID
      WHERE ps.LeagueID IS NOT NULL`;
    
    const params = [];
    
    if (leagueId) {
      query += ' AND ps.LeagueID = ?';
      params.push(leagueId);
    }
    
    query += ` ORDER BY ${orderByClause} LIMIT ?`;
    params.push(limit);
    
    const [players] = await db.query(query, params);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch top players', status: 500 } });
  }
});

// Top players by tournament
router.get('/tournament-top-players', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'goals';
    const tournamentId = req.query.tournamentId;
    const orderByClause = sortBy === 'assists' ? 'ps.Assists DESC' : 'ps.Goals DESC';
    
    let query = `
      SELECT 
        ps.StatsID as id,
        p.PlayerName as name, 
        p.PlayerRole as position,
        t.TeamName,
        COALESCE(tn.TournamentName, 'N/A') as TournamentName,
        ps.Rating, 
        ps.Goals as goals, 
        ps.Assists as assists
      FROM PLAYERSTATS ps
      JOIN PLAYER p ON ps.PlayerID = p.PlayerID
      LEFT JOIN PLAYERTEAM pt ON p.PlayerID = pt.PlayerID AND pt.IsCurrent = 1
      LEFT JOIN TEAM t ON pt.TeamID = t.TeamID
      LEFT JOIN TOURNAMENT tn ON ps.TournamentID = tn.TournamentID`;
    
    const params = [];
    
    if (tournamentId) {
      query += ' WHERE ps.TournamentID = ?';
      params.push(tournamentId);
    }
    
    query += ` ORDER BY ${orderByClause} LIMIT ?`;
    params.push(limit);
    
    const [players] = await db.query(query, params);
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch tournament top players', status: 500 } });
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
      FROM LEAGUETEAMSTATS ts
      JOIN TEAM t ON ts.TeamID = t.TeamID
      WHERE ts.LeagueID = ?
      ORDER BY ts.Points DESC, ts.GoalDifference DESC, ts.GoalsFor DESC
    `, [req.params.leagueId]);
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch standings', status: 500 } });
  }
});

// Tournament standings
router.get('/tournament-standings/:tournamentId', auth, async (req, res) => {
  try {
    const [standings] = await db.query(`
      SELECT 
        t.TeamID,
        t.TeamName, 
        tts.MatchesPlayed,
        tts.Wins, 
        tts.Draws,
        tts.Losses, 
        tts.GoalsFor,
        tts.GoalDifference,
        tts.Points
      FROM TOURNAMENTTEAMSTATS tts
      JOIN TEAM t ON tts.TeamID = t.TeamID
      WHERE tts.TournamentID = ?
      ORDER BY tts.Points DESC, tts.GoalDifference DESC, tts.GoalsFor DESC
    `, [req.params.tournamentId]);
    res.json(standings);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch tournament standings', status: 500 } });
  }
});

// Recent transfers
router.get('/recent-transfers', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const [transfers] = await db.query(`
      SELECT t.TransferDate, t.TransferType, p.PlayerName,
        ft.TeamName as FromTeam, tt.TeamName as ToTeam, l.LeagueName
      FROM TRANSFER t
      LEFT JOIN PLAYER p ON t.PlayerID = p.PlayerID
      LEFT JOIN TEAM ft ON t.FromTeamID = ft.TeamID
      LEFT JOIN TEAM tt ON t.ToTeamID = tt.TeamID
      LEFT JOIN LEAGUE l ON t.LeagueID = l.LeagueID
      ORDER BY t.TransferDate DESC
      LIMIT ?
    `, [limit]);
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching recent transfers:', error);
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

    // Get match details to determine if it's a win and league/tournament
    const [matches] = await db.query(`
      SELECT Team1ID, Team2ID, Team1Score, Team2Score, WinnerTeamID, LeagueID, TournamentID 
      FROM \`MATCH\` 
      WHERE MatchID = ?
    `, [matchId]);
    
    if (matches.length === 0) {
      return res.status(404).json({ error: { message: 'Match not found', status: 404 } });
    }

    const match = matches[0];

    // Validate that match has either league or tournament
    if (!match.LeagueID && !match.TournamentID) {
      return res.status(400).json({ error: { message: 'Match must belong to either a league or tournament', status: 400 } });
    }

    // First pass: Get all player teams
    const playerTeamMap = {};
    for (const stat of playerStats) {
      const [playerTeams] = await db.query(`
        SELECT TeamID 
        FROM PLAYERTEAM 
        WHERE PlayerID = ? AND IsCurrent = TRUE
      `, [stat.playerId]);
      
      if (playerTeams.length > 0) {
        playerTeamMap[stat.playerId] = playerTeams[0].TeamID;
      }
    }

    // Calculate total goals per team from player stats
    const team1Goals = playerStats
      .filter(stat => playerTeamMap[stat.playerId] === match.Team1ID)
      .reduce((sum, stat) => sum + (parseInt(stat.goals) || 0), 0);
    
    const team2Goals = playerStats
      .filter(stat => playerTeamMap[stat.playerId] === match.Team2ID)
      .reduce((sum, stat) => sum + (parseInt(stat.goals) || 0), 0);

    // Validate total goals don't exceed team scores
    if (team1Goals > match.Team1Score) {
      const [team1] = await db.query('SELECT TeamName FROM TEAM WHERE TeamID = ?', [match.Team1ID]);
      return res.status(400).json({ 
        error: { 
          message: `Total goals for ${team1[0]?.TeamName || 'Team 1'} (${team1Goals}) exceeds their team score (${match.Team1Score}). Please adjust the player goals.`,
          status: 400 
        } 
      });
    }

    if (team2Goals > match.Team2Score) {
      const [team2] = await db.query('SELECT TeamName FROM TEAM WHERE TeamID = ?', [match.Team2ID]);
      return res.status(400).json({ 
        error: { 
          message: `Total goals for ${team2[0]?.TeamName || 'Team 2'} (${team2Goals}) exceeds their team score (${match.Team2Score}). Please adjust the player goals.`,
          status: 400 
        } 
      });
    }

    // Validate assists don't exceed goals scored by team
    const team1Assists = playerStats
      .filter(stat => playerTeamMap[stat.playerId] === match.Team1ID)
      .reduce((sum, stat) => sum + (parseInt(stat.assists) || 0), 0);
    
    const team2Assists = playerStats
      .filter(stat => playerTeamMap[stat.playerId] === match.Team2ID)
      .reduce((sum, stat) => sum + (parseInt(stat.assists) || 0), 0);

    if (team1Assists > match.Team1Score) {
      const [team1] = await db.query('SELECT TeamName FROM TEAM WHERE TeamID = ?', [match.Team1ID]);
      return res.status(400).json({ 
        error: { 
          message: `Total assists for ${team1[0]?.TeamName || 'Team 1'} (${team1Assists}) exceeds their team score (${match.Team1Score}). Assists cannot exceed goals scored.`,
          status: 400 
        } 
      });
    }

    if (team2Assists > match.Team2Score) {
      const [team2] = await db.query('SELECT TeamName FROM TEAM WHERE TeamID = ?', [match.Team2ID]);
      return res.status(400).json({ 
        error: { 
          message: `Total assists for ${team2[0]?.TeamName || 'Team 2'} (${team2Assists}) exceeds their team score (${match.Team2Score}). Assists cannot exceed goals scored.`,
          status: 400 
        } 
      });
    }

    // Update stats for each player
    for (const stat of playerStats) {
      const { playerId, goals, assists } = stat;
      
      const playerTeamId = playerTeamMap[playerId];
      if (!playerTeamId) continue;
      
      const isWin = match.WinnerTeamID === playerTeamId ? 1 : 0;

      // Check if player stats record exists for this specific match
      let existingStats;
      if (match.LeagueID) {
        [existingStats] = await db.query(`
          SELECT StatsID 
          FROM PLAYERSTATS 
          WHERE PlayerID = ? AND MatchID = ? AND LeagueID = ?
        `, [playerId, matchId, match.LeagueID]);
      } else {
        [existingStats] = await db.query(`
          SELECT StatsID 
          FROM PLAYERSTATS 
          WHERE PlayerID = ? AND MatchID = ? AND TournamentID = ?
        `, [playerId, matchId, match.TournamentID]);
      }

      if (existingStats.length > 0) {
        // Update existing stats for this match
        await db.query(`
          UPDATE PLAYERSTATS 
          SET 
            Goals = ?,
            Assists = ?
          WHERE StatsID = ?
        `, [parseInt(goals) || 0, parseInt(assists) || 0, existingStats[0].StatsID]);
      } else {
        // Create new stats record for this match
        if (match.LeagueID) {
          await db.query(`
            INSERT INTO PLAYERSTATS (PlayerID, MatchID, LeagueID, TournamentID, MatchesPlayed, Wins, Goals, Assists, Rating)
            VALUES (?, ?, ?, NULL, 1, ?, ?, ?, 0.00)
          `, [playerId, matchId, match.LeagueID, isWin, parseInt(goals) || 0, parseInt(assists) || 0]);
        } else {
          await db.query(`
            INSERT INTO PLAYERSTATS (PlayerID, MatchID, LeagueID, TournamentID, MatchesPlayed, Wins, Goals, Assists, Rating)
            VALUES (?, ?, NULL, ?, 1, ?, ?, ?, 0.00)
          `, [playerId, matchId, match.TournamentID, isWin, parseInt(goals) || 0, parseInt(assists) || 0]);
        }
      }
    }

    res.json({ message: 'Player stats updated successfully' });
  } catch (error) {
    console.error('Error saving player stats:', error);
    res.status(500).json({ error: { message: 'Failed to save player stats', status: 500 } });
  }
});

module.exports = router;
