
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Drink = sequelize.define('Drink', {
  name: DataTypes.STRING,
  category: DataTypes.STRING,
  default_unit: DataTypes.STRING,
  parent_category: DataTypes.STRING
});

module.exports = Drink;
