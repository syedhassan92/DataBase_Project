const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { unassigned } = req.query;
    
    if (unassigned === 'true') {
      // Get coaches not assigned to any team
      const [coaches] = await db.query(`
        SELECT c.* FROM COACH c
        WHERE c.CoachID NOT IN (
          SELECT CoachID FROM TEAMLEAGUE WHERE CoachID IS NOT NULL
        )
        ORDER BY c.CreatedAt DESC
      `);
      return res.json(coaches);
    }
    
    const [coaches] = await db.query('SELECT * FROM COACH ORDER BY CreatedAt DESC');
    res.json(coaches);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch coaches', status: 500 } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [coaches] = await db.query('SELECT * FROM COACH WHERE CoachID = ?', [req.params.id]);
    if (coaches.length === 0) {
      return res.status(404).json({ error: { message: 'Coach not found', status: 404 } });
    }
    res.json(coaches[0]);
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to fetch coach', status: 500 } });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { coachName, phoneNumber, email, experience } = req.body;
    const [result] = await db.query(
      'INSERT INTO COACH (CoachName, PhoneNumber, Email, Experience) VALUES (?, ?, ?, ?)',
      [coachName, phoneNumber || null, email || null, experience || 0]
    );
    res.status(201).json({ message: 'Coach created successfully', coachId: result.insertId });
  } catch (error) {
    console.error('Error creating coach:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('unique_phone') || error.message.includes('PhoneNumber')) {
        return res.status(400).json({ error: { message: 'This phone number is already registered to another coach.', status: 400 } });
      } else if (error.message.includes('unique_email') || error.message.includes('Email')) {
        return res.status(400).json({ error: { message: 'This email is already registered to another coach.', status: 400 } });
      }
      return res.status(400).json({ error: { message: 'Duplicate entry. Phone number and email must be unique.', status: 400 } });
    }
    res.status(500).json({ error: { message: 'Failed to create coach', status: 500 } });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { coachName, phoneNumber, email, experience } = req.body;
    await db.query(
      'UPDATE COACH SET CoachName = ?, PhoneNumber = ?, Email = ?, Experience = ? WHERE CoachID = ?',
      [coachName, phoneNumber || null, email || null, experience || 0, req.params.id]
    );
    res.json({ message: 'Coach updated successfully' });
  } catch (error) {
    console.error('Error updating coach:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('unique_phone') || error.message.includes('PhoneNumber')) {
        return res.status(400).json({ error: { message: 'This phone number is already registered to another coach.', status: 400 } });
      } else if (error.message.includes('unique_email') || error.message.includes('Email')) {
        return res.status(400).json({ error: { message: 'This email is already registered to another coach.', status: 400 } });
      }
      return res.status(400).json({ error: { message: 'Duplicate entry. Phone number and email must be unique.', status: 400 } });
    }
    res.status(500).json({ error: { message: 'Failed to update coach', status: 500 } });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM COACH WHERE CoachID = ?', [req.params.id]);
    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: 'Failed to delete coach', status: 500 } });
  }
});

module.exports = router;
