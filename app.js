if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const router = require('./routes/index');
const errorHandler = require('./utils/errorHandler');
const morgan = require('morgan');
const cors = require('cors');
const schedule = require('node-schedule');
const Job = require('./utils/cronJob');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(router);
app.use(errorHandler);


const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

schedule.scheduleJob('0,30 * * * *', Job.checkPayment);

module.exports = { app, server };