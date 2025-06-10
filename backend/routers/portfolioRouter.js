const express = require('express');
const router = express.Router();
const db = require('../db'); // your configured PostgreSQL client

// GET /api/portfolio
router.get('/', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.session.user.id;

  try {
    const result = await db.query(
      'SELECT asset, percent FROM portfolio_assets WHERE user_id = $1 ORDER BY id',
      [userId]
    );

    res.json({ portfolio: result.rows }); // [{asset: 'stocks', percent: 50}, ...]
  } catch (err) {
    console.error('GET portfolio error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// POST /api/portfolio
router.post('/', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
  const userId = req.session.user.id;
  const { portfolio } = req.body;

  if (!Array.isArray(portfolio)) {
    return res.status(400).json({ error: 'Invalid portfolio format' });
  }

  // Begin transaction: delete old, insert new
  try {
    await db.query('BEGIN');

    // Delete existing portfolio assets for this user
    await db.query('DELETE FROM portfolio_assets WHERE user_id = $1', [userId]);

    // Insert new portfolio rows
    const insertText = 'INSERT INTO portfolio_assets (user_id, asset, percent) VALUES ($1, $2, $3)';
    for (const item of portfolio) {
      // Validate item shape and values as needed
      if (!item.asset || typeof item.percent !== 'number' || item.percent < 0 || item.percent > 100) {
        await db.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid portfolio item' });
      }
      await db.query(insertText, [userId, item.asset, item.percent]);
    }

    await db.query('COMMIT');
    res.json({ message: 'Portfolio saved' });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('POST portfolio error:', err);
    res.status(500).json({ error: 'Failed to save portfolio' });
  }
});

module.exports = router;
