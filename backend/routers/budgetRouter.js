const express = require('express');
const router = express.Router();
const db = require('../db'); // your configured PostgreSQL client

// GET /api/budget
router.get('/', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.session.user.id;

  try {
    const result = await db.query(
      'SELECT category, amount FROM budget_tracking WHERE user_id = $1 ORDER BY id',
      [userId]
    );

    res.json({ budget: result.rows }); // [{category: 'Food', amount: 30}, ...]
  } catch (err) {
    console.error('GET budget error:', err);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// POST /api/budget
router.post('/', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.session.user.id;
  const { budget } = req.body;

  if (!Array.isArray(budget)) {
    console.log("here");
    return res.status(400).json({ error: 'Invalid budget format' });
  }

  try {
    await db.query('BEGIN');

    // Delete existing budget categories for this user
    await db.query('DELETE FROM budget_tracking WHERE user_id = $1', [userId]);

    // Insert new budget categories
    const insertText = 'INSERT INTO budget_tracking (user_id, category, amount) VALUES ($1, $2, $3)';
    for (const item of budget) {
      if (!item.category || isNaN(item.amount) || item.amount < 0) {
        console.log('❌ Rejected item:', item);
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid budget item' });
      }
      await db.query(insertText, [userId, item.category, item.amount]);
    }

    await db.query('COMMIT');
    res.json({ message: 'Budget saved' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('POST budget error:', err);
    res.status(500).json({ error: 'Failed to save budget' });
  }
});

module.exports = router;
