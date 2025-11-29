const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [matches] = await db.query(`
      SELECT m.*, 
        t1.TeamName as Team1Name,
        t2.TeamName as Team2Name,
        l.LeagueName, 
        tour.TournamentName, 
        v.VenueName, 
        r.RefereeName
      FROM \`MATCH\` m
      LEFT JOIN TEAM t1 ON m.Team1ID = t1.TeamID
      LEFT JOIN TEAM t2 ON m.Team2ID = t2.TeamID
      LEFT JOIN LEAGUE l ON m.LeagueID = l.LeagueID
      LEFT JOIN TOURNAMENT tour ON m.TournamentID = tour.TournamentID
      LEFT JOIN VENUE v ON m.VenueID = v.VenueID
      LEFT JOIN REFEREE r ON m.RefereeID = r.RefereeID
      ORDER BY m.MatchDate DESC, m.MatchTime DESC
    `);
    res.json(matches);
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: { message: 'Failed to fetch matches', status: 500 } });
  }
});

router.get('/upcoming', async (req, res) => {
  try {
    const [matches] = await db.query(`
      SELECT m.*, 
        t1.TeamName as Team1Name,
        t2.TeamName as Team2Name,
        v.VenueName
      FROM \`MATCH\` m
      LEFT JOIN TEAM t1 ON m.Team1ID = t1.TeamID
      LEFT JOIN TEAM t2 ON m.Team2ID = t2.TeamID
      LEFT JOIN VENUE v ON m.VenueID = v.VenueID
      WHERE m.Status = 'Scheduled' AND m.MatchDate >= CURDATE()
      ORDER BY m.MatchDate ASC, m.MatchTime ASC
      LIMIT 5
    `);

    // Format matches for frontend
    const formattedMatches = matches.map(match => ({
      id: match.MatchID,
      homeTeamName: match.Team1Name,
      awayTeamName: match.Team2Name,
      date: new Date(match.MatchDate).toLocaleDateString(),
      time: match.MatchTime,
      venue: match.VenueName || 'TBD'
    }));

    res.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    res.status(500).json({ error: { message: 'Failed to fetch upcoming matches', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [matches] = await db.query('SELECT * FROM \`MATCH\` WHERE MatchID = ?', [req.params.id]);
    if (matches.length === 0) {
      return res.status(404).json({ error: { message: 'Match not found', status: 404 } });
    }
    res.json(matches[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch match', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { team1Id, team2Id, leagueId, tournamentId, venueId, refereeId, matchDate, matchTime, status } = req.body;

    console.log('Received match data:', { team1Id, team2Id, leagueId, tournamentId, venueId, refereeId, matchDate, matchTime, status });

    if (!team1Id || !team2Id) {
      return res.status(400).json({ error: { message: 'Team1 and Team2 are required', status: 400 } });
    }

    // Validate that match has either leagueId OR tournamentId (not both, not neither)
    if ((leagueId && tournamentId) || (!leagueId && !tournamentId)) {
      return res.status(400).json({
        error: {
          message: 'A match must be either a League match OR a Tournament match (not both, not neither). Please select either a league or a tournament.',
          status: 400
        }
      });
    }

    // Check if both teams have coaches assigned
    const [team1Coach] = await db.query(
      'SELECT t.TeamName, tl.CoachID FROM TEAM t LEFT JOIN TEAMLEAGUE tl ON t.TeamID = tl.TeamID WHERE t.TeamID = ?',
      [team1Id]
    );
    const [team2Coach] = await db.query(
      'SELECT t.TeamName, tl.CoachID FROM TEAM t LEFT JOIN TEAMLEAGUE tl ON t.TeamID = tl.TeamID WHERE t.TeamID = ?',
      [team2Id]
    );

    const teamsWithoutCoach = [];
    if (!team1Coach[0] || !team1Coach[0].CoachID) {
      teamsWithoutCoach.push(team1Coach[0]?.TeamName || 'Team 1');
    }
    if (!team2Coach[0] || !team2Coach[0].CoachID) {
      teamsWithoutCoach.push(team2Coach[0]?.TeamName || 'Team 2');
    }

    if (teamsWithoutCoach.length > 0) {
      const teamsList = teamsWithoutCoach.join(' and ');
      return res.status(400).json({
        error: {
          message: `Cannot create match. The following team(s) do not have a coach assigned: ${teamsList}. Please assign a coach to the team(s) before scheduling a match.`,
          status: 400
        }
      });
    }

    // Check if both teams have at least 11 players
    const [team1Players] = await db.query(
      'SELECT COUNT(*) as playerCount FROM PLAYERTEAM WHERE TeamID = ? AND IsCurrent = TRUE',
      [team1Id]
    );
    const [team2Players] = await db.query(
      'SELECT COUNT(*) as playerCount FROM PLAYERTEAM WHERE TeamID = ? AND IsCurrent = TRUE',
      [team2Id]
    );

    const teamsWithInsufficientPlayers = [];
    if (team1Players[0].playerCount < 11) {
      teamsWithInsufficientPlayers.push(`${team1Coach[0]?.TeamName || 'Team 1'} (${team1Players[0].playerCount} players)`);
    }
    if (team2Players[0].playerCount < 11) {
      teamsWithInsufficientPlayers.push(`${team2Coach[0]?.TeamName || 'Team 2'} (${team2Players[0].playerCount} players)`);
    }

    if (teamsWithInsufficientPlayers.length > 0) {
      const teamsList = teamsWithInsufficientPlayers.join(' and ');
      return res.status(400).json({
        error: {
          message: `Cannot create match. The following team(s) do not have at least 11 players: ${teamsList}. Please add more players to the team(s) before scheduling a match.`,
          status: 400
        }
      });
    }

    // Check if league has started (if leagueId is provided)
    if (leagueId) {
      const [league] = await db.query(
        'SELECT LeagueName, StartDate FROM LEAGUE WHERE LeagueID = ?',
        [leagueId]
      );

      if (league.length > 0 && league[0].StartDate) {
        const leagueStartDate = new Date(league[0].StartDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (leagueStartDate > today) {
          return res.status(400).json({
            error: {
              message: `Cannot schedule match. The league "${league[0].LeagueName}" has not started yet. League starts on ${leagueStartDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Please wait until the league begins.`,
              status: 400
            }
          });
        }
      }
    }

    // Check if tournament has started (if tournamentId is provided)
    if (tournamentId) {
      const [tournament] = await db.query(
        'SELECT TournamentName, StartDate, Status FROM TOURNAMENT WHERE TournamentID = ?',
        [tournamentId]
      );

      if (tournament.length > 0) {
        // Check if tournament status is 'upcoming'
        if (tournament[0].Status === 'upcoming') {
          return res.status(400).json({
            error: {
              message: `Cannot schedule match. The tournament "${tournament[0].TournamentName}" has not started yet. Tournament status is currently "Upcoming". Please update the tournament status to "Ongoing" first.`,
              status: 400
            }
          });
        }

        // Additionally check the start date if available
        if (tournament[0].StartDate) {
          const tournamentStartDate = new Date(tournament[0].StartDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (tournamentStartDate > today) {
            return res.status(400).json({
              error: {
                message: `Cannot schedule match. The tournament "${tournament[0].TournamentName}" has not started yet. Tournament starts on ${tournamentStartDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. Please wait until the tournament begins.`,
                status: 400
              }
            });
          }
        }
      }
    }

    // Check if venue is already booked for this date/time
    if (venueId && matchDate && matchTime) {
      const [venueConflicts] = await db.query(
        'SELECT MatchID FROM \`MATCH\` WHERE VenueID = ? AND MatchDate = ? AND MatchTime = ? AND Status != "Cancelled"',
        [venueId, matchDate, matchTime]
      );
      if (venueConflicts.length > 0) {
        return res.status(409).json({ error: { message: 'This venue is already booked for the selected date and time', status: 409 } });
      }
    }

    // Check if referee is already assigned for this date/time
    if (refereeId && matchDate && matchTime) {
      const [refereeConflicts] = await db.query(
        'SELECT MatchID FROM \`MATCH\` WHERE RefereeID = ? AND MatchDate = ? AND MatchTime = ? AND Status != "Cancelled"',
        [refereeId, matchDate, matchTime]
      );
      if (refereeConflicts.length > 0) {
        return res.status(409).json({ error: { message: 'This referee is already assigned to another match at this time', status: 409 } });
      }
    }

    // Check if either team already has a match on the same date
    if (matchDate) {
      const [team1Conflicts] = await db.query(
        'SELECT MatchID, t1.TeamName as OpponentTeam FROM \`MATCH\` m JOIN TEAM t1 ON (m.Team1ID = t1.TeamID OR m.Team2ID = t1.TeamID) WHERE (m.Team1ID = ? OR m.Team2ID = ?) AND m.MatchDate = ? AND m.Status != "Cancelled" AND t1.TeamID != ?',
        [team1Id, team1Id, matchDate, team1Id]
      );

      if (team1Conflicts.length > 0) {
        return res.status(409).json({
          error: {
            message: `Cannot schedule match. ${team1Coach[0]?.TeamName || 'Team 1'} already has a match scheduled on ${new Date(matchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. A team cannot play more than one match on the same day.`,
            status: 409
          }
        });
      }

      const [team2Conflicts] = await db.query(
        'SELECT MatchID, t2.TeamName as OpponentTeam FROM \`MATCH\` m JOIN TEAM t2 ON (m.Team1ID = t2.TeamID OR m.Team2ID = t2.TeamID) WHERE (m.Team1ID = ? OR m.Team2ID = ?) AND m.MatchDate = ? AND m.Status != "Cancelled" AND t2.TeamID != ?',
        [team2Id, team2Id, matchDate, team2Id]
      );

      if (team2Conflicts.length > 0) {
        return res.status(409).json({
          error: {
            message: `Cannot schedule match. ${team2Coach[0]?.TeamName || 'Team 2'} already has a match scheduled on ${new Date(matchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. A team cannot play more than one match on the same day.`,
            status: 409
          }
        });
      }
    }

    const [result] = await db.query(
      'INSERT INTO \`MATCH\` (Team1ID, Team2ID, LeagueID, TournamentID, VenueID, RefereeID, MatchDate, MatchTime, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [team1Id, team2Id, leagueId || null, tournamentId || null, venueId || null, refereeId || null, matchDate, matchTime, status || 'Scheduled']
    );
    res.status(201).json({ message: 'Match created successfully', matchId: result.insertId });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({ error: { message: 'Failed to create match', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { leagueId, tournamentId, matchDate, matchTime, team1Score, team2Score, status, winnerTeamId, highlights, team1Possession, team2Possession } = req.body;

    // Validate that match has either leagueId OR tournamentId if both are provided (not both)
    if (leagueId !== undefined && tournamentId !== undefined) {
      if ((leagueId && tournamentId) || (!leagueId && !tournamentId)) {
        return res.status(400).json({
          error: {
            message: 'A match must be either a League match OR a Tournament match (not both, not neither). Please select either a league or a tournament.',
            status: 400
          }
        });
      }
    }

    // Get match details to know which teams are playing
    const [matchDetails] = await db.query('SELECT Team1ID, Team2ID, MatchDate FROM \`MATCH\` WHERE MatchID = ?', [req.params.id]);

    if (matchDetails.length === 0) {
      return res.status(404).json({ error: { message: 'Match not found', status: 404 } });
    }

    const { Team1ID, Team2ID, MatchDate: currentMatchDate } = matchDetails[0];

    // Check if date is being changed and if teams already have matches on new date
    if (matchDate && matchDate !== currentMatchDate) {
      // Check if Team1 already has a match on the new date
      const [team1Conflicts] = await db.query(
        'SELECT MatchID FROM \`MATCH\` WHERE (Team1ID = ? OR Team2ID = ?) AND MatchDate = ? AND Status != "Cancelled" AND MatchID != ?',
        [Team1ID, Team1ID, matchDate, req.params.id]
      );

      if (team1Conflicts.length > 0) {
        const [team1Name] = await db.query('SELECT TeamName FROM TEAM WHERE TeamID = ?', [Team1ID]);
        return res.status(409).json({
          error: {
            message: `Cannot update match date. ${team1Name[0]?.TeamName || 'Team 1'} already has a match scheduled on ${new Date(matchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. A team cannot play more than one match on the same day.`,
            status: 409
          }
        });
      }

      // Check if Team2 already has a match on the new date
      const [team2Conflicts] = await db.query(
        'SELECT MatchID FROM \`MATCH\` WHERE (Team1ID = ? OR Team2ID = ?) AND MatchDate = ? AND Status != "Cancelled" AND MatchID != ?',
        [Team2ID, Team2ID, matchDate, req.params.id]
      );

      if (team2Conflicts.length > 0) {
        const [team2Name] = await db.query('SELECT TeamName FROM TEAM WHERE TeamID = ?', [Team2ID]);
        return res.status(409).json({
          error: {
            message: `Cannot update match date. ${team2Name[0]?.TeamName || 'Team 2'} already has a match scheduled on ${new Date(matchDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. A team cannot play more than one match on the same day.`,
            status: 409
          }
        });
      }
    }

    // Update match (use !== undefined to allow 0 as valid score)
    await db.query(
      'UPDATE \`MATCH\` SET MatchDate = ?, MatchTime = ?, Team1Score = ?, Team2Score = ?, Status = ?, WinnerTeamID = ?, Highlights = ? WHERE MatchID = ?',
      [
        matchDate,
        matchTime,
        team1Score !== undefined ? team1Score : null,
        team2Score !== undefined ? team2Score : null,
        status || 'Scheduled',
        winnerTeamId || null,
        highlights || null,
        req.params.id
      ]
    );

    // If match is completed and has scores, insert/update MATCHSTATS
    if (status === 'Completed' && team1Score !== undefined && team1Score !== null && team2Score !== undefined && team2Score !== null) {
      // Insert or update Team1 match stats
      await db.query(
        `INSERT INTO MATCHSTATS (MatchID, TeamID, Score, Possession) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE Score = ?, Possession = ?`,
        [req.params.id, Team1ID, team1Score, team1Possession || 0, team1Score, team1Possession || 0]
      );

      // Insert or update Team2 match stats
      await db.query(
        `INSERT INTO MATCHSTATS (MatchID, TeamID, Score, Possession) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE Score = ?, Possession = ?`,
        [req.params.id, Team2ID, team2Score, team2Possession || 0, team2Score, team2Possession || 0]
      );
    }

    res.json({ message: 'Match updated successfully' });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: { message: 'Failed to update match', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM \`MATCH\` WHERE MatchID = ?', [req.params.id]);
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete match', status: 500 } });
  }
});

// Get available venues for a specific date/time
router.get('/available/venues', async (req, res) => {
  try {
    const { matchDate, matchTime, excludeMatchId } = req.query;

    if (!matchDate || !matchTime) {
      // Return all available venues if no date/time specified
      const [venues] = await db.query(
        'SELECT * FROM VENUE WHERE IsAvailable = TRUE ORDER BY VenueName'
      );
      return res.json(venues);
    }

    // Get venues that are not booked for this date/time
    let query = `
      SELECT v.* FROM VENUE v
      WHERE v.IsAvailable = TRUE
      AND v.VenueID NOT IN (
        SELECT VenueID FROM \`MATCH\`
        WHERE MatchDate = ? AND MatchTime = ? AND Status != 'Cancelled'
        ${excludeMatchId ? 'AND MatchID != ?' : ''}
      )
      ORDER BY v.VenueName
    `;

    const params = excludeMatchId ? [matchDate, matchTime, excludeMatchId] : [matchDate, matchTime];
    const [venues] = await db.query(query, params);
    res.json(venues);
  } catch (error) {
    console.error('Error fetching available venues:', error);
    res.status(500).json({ error: { message: 'Failed to fetch available venues', status: 500 } });
  }
});

// Get available referees for a specific date/time
router.get('/available/referees', async (req, res) => {
  try {
    const { matchDate, matchTime, excludeMatchId } = req.query;

    if (!matchDate || !matchTime) {
      // Return all available referees if no date/time specified
      const [referees] = await db.query(
        'SELECT * FROM REFEREE WHERE AvailabilityStatus = "Available" ORDER BY RefereeName'
      );
      return res.json(referees);
    }

    // Get referees that are not assigned for this date/time
    let query = `
      SELECT r.* FROM REFEREE r
      WHERE r.AvailabilityStatus = 'Available'
      AND r.RefereeID NOT IN (
        SELECT RefereeID FROM \`MATCH\`
        WHERE MatchDate = ? AND MatchTime = ? AND Status != 'Cancelled' AND RefereeID IS NOT NULL
        ${excludeMatchId ? 'AND MatchID != ?' : ''}
      )
      ORDER BY r.RefereeName
    `;

    const params = excludeMatchId ? [matchDate, matchTime, excludeMatchId] : [matchDate, matchTime];
    const [referees] = await db.query(query, params);
    res.json(referees);
  } catch (error) {
    console.error('Error fetching available referees:', error);
    res.status(500).json({ error: { message: 'Failed to fetch available referees', status: 500 } });
  }
});

module.exports = router;
