
const express = require('express');
const router = express.Router();
const Threshold = require('../models/threshold');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { drinkId, daily_limit } = req.body;
  const threshold = await Threshold.create({
    drinkId,
    daily_limit,
    UserId: req.userId
  });
  res.status(201).json(threshold);
});

router.get('/', auth, async (req, res) => {
  const thresholds = await Threshold.findAll({ where: { UserId: req.userId } });
  res.json(thresholds);
});

module.exports = router;
