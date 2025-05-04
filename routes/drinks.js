
const express = require('express');
const router = express.Router();
const Drink = require('../models/drink');

const drinkOptions = {
    "Water or Milk": ["Water", "Milk", "Electrolyte-Rich Water"],
    "Soda": ["Soda", "Sparkling Water", "Sugar-Free Soda"],
    "Alcohol": ["0 to 35%", "35 to 60%", "more than 60%"]
};

router.get('/options', (req, res) => {
    const category = req.query.category;
    if (!category) return res.json({ categories: Object.keys(drinkOptions) });

    const subtypes = drinkOptions[category];
    if (!subtypes) return res.status(400).json({ error: 'Unknown category' });

    res.json({ category, options: subtypes });
});

router.post('/init', async (req, res) => {
    const drinksToInsert = [
        { name: "Water", category: "Water or Milk", default_unit: "L", parent_category: "Water or Milk" },
        { name: "Milk", category: "Water or Milk", default_unit: "L", parent_category: "Water or Milk" },
        { name: "Electrolyte-Rich Water", category: "Water or Milk", default_unit: "L", parent_category: "Water or Milk" },
        { name: "Soda", category: "Soda", default_unit: "L", parent_category: "Soda" },
        { name: "Sparkling Water", category: "Soda", default_unit: "L", parent_category: "Soda" },
        { name: "Sugar-Free Soda", category: "Soda", default_unit: "L", parent_category: "Soda" },
        { name: "0 to 35%", category: "Alcohol", default_unit: "L", parent_category: "Alcohol" },
        { name: "35 to 60%", category: "Alcohol", default_unit: "L", parent_category: "Alcohol" },
        { name: "more than 60%", category: "Alcohol", default_unit: "L", parent_category: "Alcohol" }
    ];

    await Drink.bulkCreate(drinksToInsert);
    res.json({ message: "Drinks successfully inserted." });
});

module.exports = router;
