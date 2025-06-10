// routes/stockownership.js
const express = require("express");
const router = express.Router();
const pool = require("../db.js");
const authenticate = require("../middleware/authenticate.js");

// GET all stocks owned by logged in user
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT ticker, amountowned, notes FROM stockownership WHERE userid = $1",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting stockownership:", error);
    res.status(500).json({ error: "Server error fetching stocks." });
  }
});

// POST a new stock ownership record
router.post("/", authenticate, async (req, res) => {
  const { ticker, amountowned, notes } = req.body;
  if (!ticker || amountowned == null) {
    return res.status(400).json({ error: "Ticker and amount owned are required." });
  }
  try {
    const result = await pool.query(
      `INSERT INTO stockownership(userid, ticker, amountowned, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, ticker, amountowned, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting stockownership:", error);
    res.status(500).json({ error: "Server error adding stock." });
  }
});

// PUT update stock ownership amount or notes
router.put("/:ticker", authenticate, async (req, res) => {
  const { ticker } = req.params;
  const { amountowned, notes } = req.body;

  if (amountowned == null && notes == null) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  try {
    // Build dynamic query parts
    const fields = [];
    const values = [];
    let idx = 1;

    if (amountowned != null) {
      fields.push(`amountowned = $${idx++}`);
      values.push(amountowned);
    }
    if (notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(notes);
    }

    values.push(req.user.id);
    values.push(ticker);

    const query = `UPDATE stockownership SET ${fields.join(", ")} 
                   WHERE userid = $${idx++} AND ticker = $${idx} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Stock not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating stockownership:", error);
    res.status(500).json({ error: "Server error updating stock." });
  }
});

// DELETE a stock ownership record
router.delete("/:ticker", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM stockownership WHERE userid = $1 AND ticker = $2 RETURNING *",
      [req.user.id, req.params.ticker]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Stock not found." });
    }
    res.json({ message: "Deleted successfully", deleted: result.rows[0] });
  } catch (error) {
    console.error("Error deleting stockownership:", error);
    res.status(500).json({ error: "Server error deleting stock." });
  }
});

module.exports = router;
