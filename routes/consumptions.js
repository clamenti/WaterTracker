
const express = require('express');
const router = express.Router();
const Consumption = require('../models/consumption');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { drinkId, quantity, date } = req.body;
  const consumption = await Consumption.create({
    drinkId,
    quantity,
    date,
    UserId: req.userId
  });
  res.status(201).json(consumption);
});

router.get('/', auth, async (req, res) => {
  const consumptions = await Consumption.findAll({ where: { UserId: req.userId } });
  res.json(consumptions);
});

module.exports = router;
