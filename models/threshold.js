
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Drink = require('./drink');

const Threshold = sequelize.define('Threshold', {
  daily_limit: DataTypes.FLOAT
});

User.hasMany(Threshold);
Threshold.belongsTo(User);

Drink.hasMany(Threshold);
Threshold.belongsTo(Drink);

module.exports = Threshold;
