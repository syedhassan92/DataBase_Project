const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [referees] = await db.query('SELECT * FROM REFEREE ORDER BY CreatedAt DESC');
    res.json(referees);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch referees', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [referees] = await db.query('SELECT * FROM REFEREE WHERE RefereeID = ?', [req.params.id]);
    if (referees.length === 0) {
      return res.status(404).json({ error: { message: 'Referee not found', status: 404 } });
    }
    res.json(referees[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch referee', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { refereeName, phoneNumber, email, availabilityStatus } = req.body;
    const [result] = await db.query(
      'INSERT INTO REFEREE (RefereeName, PhoneNumber, Email, AvailabilityStatus) VALUES (?, ?, ?, ?)',
      [refereeName, phoneNumber || null, email || null, availabilityStatus || 'Available']
    );
    res.status(201).json({ message: 'Referee created successfully', refereeId: result.insertId });
  } catch (error) {
    console.error('Error creating referee:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('PhoneNumber')) {
        return res.status(400).json({ error: { message: 'This phone number is already registered to another referee.', status: 400 } });
      } else if (error.message.includes('Email')) {
        return res.status(400).json({ error: { message: 'This email is already registered to another referee.', status: 400 } });
      }
      return res.status(400).json({ error: { message: 'Duplicate entry. Phone number and email must be unique.', status: 400 } });
    }
    res.status(500).json({ error: { message: 'Failed to create referee', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { refereeName, phoneNumber, email, availabilityStatus } = req.body;
    await db.query(
      'UPDATE REFEREE SET RefereeName = ?, PhoneNumber = ?, Email = ?, AvailabilityStatus = ? WHERE RefereeID = ?',
      [refereeName, phoneNumber || null, email || null, availabilityStatus || 'Available', req.params.id]
    );
    res.json({ message: 'Referee updated successfully' });
  } catch (error) {
    console.error('Error updating referee:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('PhoneNumber')) {
        return res.status(400).json({ error: { message: 'This phone number is already registered to another referee.', status: 400 } });
      } else if (error.message.includes('Email')) {
        return res.status(400).json({ error: { message: 'This email is already registered to another referee.', status: 400 } });
      }
      return res.status(400).json({ error: { message: 'Duplicate entry. Phone number and email must be unique.', status: 400 } });
    }
    res.status(500).json({ error: { message: 'Failed to update referee', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM REFEREE WHERE RefereeID = ?', [req.params.id]);
    res.json({ message: 'Referee deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete referee', status: 500 } });
  }
});

module.exports = router;
