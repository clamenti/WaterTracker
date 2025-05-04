
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Drink = require('./drink');
//console.log("Drink.hasMany =", typeof Drink.hasMany); test = function

const Consumption = sequelize.define('Consumption', {
  quantity: DataTypes.FLOAT,
  date: DataTypes.DATE
});

User.hasMany(Consumption);
Consumption.belongsTo(User);

Drink.hasMany(Consumption);
Consumption.belongsTo(Drink);

module.exports = Consumption;
