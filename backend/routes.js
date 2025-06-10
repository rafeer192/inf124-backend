const express = require('express')
const pool = require('./db')

const router = express.Router()

// Health route for AWS ALB
router.get('/', (req, res) => {
    res.sendStatus(200)
})

module.exports = router