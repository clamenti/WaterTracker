
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

router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const threshold = await Threshold.findByPk(id);

    if (!threshold) {
      return res.status(404).json({ error: 'Threshold not found' });
    }

    await threshold.destroy();
    res.json({ message: 'Threshold deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete threshold' });
  }
});

module.exports = router;
