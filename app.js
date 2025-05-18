
const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const consumptionRoutes = require('./routes/consumptions');
const thresholdRoutes = require('./routes/thresholds');
const drinkOptionsRoute = require('./routes/drinks');

app.use('/api/auth', authRoutes);
app.use('/api/consumptions', consumptionRoutes);
app.use('/api/thresholds', thresholdRoutes);
app.use('/api/drinks', drinkOptionsRoute);

const { sequelize } = require('./config/database');
sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
});
