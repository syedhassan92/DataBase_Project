const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [transfers] = await db.query(`
      SELECT t.*, p.PlayerName, l.LeagueName, fl.LeagueName as FromLeagueName,
        ft.TeamName as FromTeamName, tt.TeamName as ToTeamName
      FROM TRANSFER t
      LEFT JOIN PLAYER p ON t.PlayerID = p.PlayerID
      LEFT JOIN LEAGUE l ON t.LeagueID = l.LeagueID
      LEFT JOIN LEAGUE fl ON t.FromLeagueID = fl.LeagueID
      LEFT JOIN TEAM ft ON t.FromTeamID = ft.TeamID
      LEFT JOIN TEAM tt ON t.ToTeamID = tt.TeamID
      ORDER BY t.TransferDate DESC
    `);
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: { message: 'Failed to fetch transfers', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const { playerId, toTeamId, transferDate, transferType, contractDetails, fromLeagueId } = req.body;

    if (!playerId || !toTeamId || !transferDate) {
      throw new Error('Player, destination team, and transfer date are required');
    }

    // 1. Find current team
    const [currentTeamRows] = await connection.query(
      'SELECT * FROM PLAYERTEAM WHERE PlayerID = ? AND IsCurrent = TRUE',
      [playerId]
    );

    let fromTeamId = null;
    if (currentTeamRows.length > 0) {
      fromTeamId = currentTeamRows[0].TeamID;

      if (fromTeamId == toTeamId) {
        throw new Error('Player is already in this team');
      }

      // 2. Handle current contract
      if (transferType === 'Permanent') {
        // Delete previous contract automatically as requested
        await connection.query(
          'DELETE FROM PLAYERTEAM WHERE PlayerTeamID = ?',
          [currentTeamRows[0].PlayerTeamID]
        );
      } else {
        // For Loan or other types, just end the current status
        await connection.query(
          'UPDATE PLAYERTEAM SET IsCurrent = FALSE, EndDate = ? WHERE PlayerTeamID = ?',
          [transferDate, currentTeamRows[0].PlayerTeamID]
        );
      }
    }

    // 3. Get LeagueID for the destination team
    const [leagueRows] = await connection.query(
      'SELECT LeagueID FROM TEAMLEAGUE WHERE TeamID = ? LIMIT 1',
      [toTeamId]
    );

    const leagueId = leagueRows.length > 0 ? leagueRows[0].LeagueID : null;

    if (!leagueId) {
      // Fallback: try to get league from fromTeam if exists, or error
      // For now, allow transfer but maybe set LeagueID to something default or error
      // Schema requires LeagueID.
      throw new Error('Destination team must belong to a league to accept transfers');
    }

    // 4. Insert Transfer Record
    const [result] = await connection.query(
      'INSERT INTO TRANSFER (PlayerID, FromTeamID, ToTeamID, LeagueID, FromLeagueID, TransferDate, TransferType) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [playerId, fromTeamId, toTeamId, leagueId, fromLeagueId || null, transferDate, transferType || 'Permanent']
    );

    // 5. Create New Contract
    await connection.query(
      'INSERT INTO PLAYERTEAM (PlayerID, TeamID, StartDate, ContractDetails, IsCurrent) VALUES (?, ?, ?, ?, TRUE)',
      [playerId, toTeamId, transferDate, contractDetails || 'Transferred']
    );

    await connection.commit();
    res.status(201).json({
      message: 'Transfer completed successfully',
      transferId: result.insertId
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error processing transfer:', error);
    res.status(500).json({ error: { message: error.message || 'Failed to process transfer', status: 500 } });
  } finally {
    if (connection) connection.release();
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM TRANSFER WHERE TransferID = ?', [req.params.id]);
    res.json({ message: 'Transfer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete transfer', status: 500 } });
  }
});

module.exports = router;
