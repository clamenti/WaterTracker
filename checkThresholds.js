require('dotenv').config();
const { Op } = require('sequelize');
const { sequelize } = require('./config/database');
const User = require('./models/user');
const Consumption = require('./models/consumption');
const Threshold = require('./models/threshold');
const Drink = require('./models/drink');
const nodemailer = require('nodemailer');
require('./models/consumption');
require('./models/threshold');

async function checkThresholdsAndNotify() {
    await sequelize.sync();

    const users = await User.findAll();

    for (const user of users) {
        const thresholds = await Threshold.findAll({
            where: { UserId: user.id },
            include: [
                {
                    model: Drink,
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    attributes: ['email']
                }
            ]
        });

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const start = new Date(yesterday.setHours(0, 0, 0, 0));
        const end = new Date(yesterday.setHours(23, 59, 59, 999));

        const consumptions = await Consumption.findAll({
            where: {
                UserId: user.id,
                date: {
                    [Op.between]: [start, end]
                }
            }
        });

        const totalConsumed = consumptions.reduce((sum, c) => sum + c.quantity, 0);

        for (const threshold of thresholds) {
            if (totalConsumed < threshold.daily_limit) {
                await sendEmail(user.email, totalConsumed / 1000, threshold.daily_limit / 1000);
            }
        }
    }
}

async function sendEmail(to, consumed, limit) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'projetwatertracker@gmail.com',
            pass: 'zjrx ftyr iiny axuv'
        }
    });

    let mailOptions = {
        from: 'projetwatertracker@gmail.com',
        to,
        subject: 'Hydration Reminder',
        text: `You only drank ${consumed.toFixed(2)}L yesterday, below your threshold of ${limit.toFixed(2)}L. Stay hydrated!`
    };

    await transporter.sendMail(mailOptions);
}

checkThresholdsAndNotify().then(() => {
    console.log('Threshold check complete.');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
