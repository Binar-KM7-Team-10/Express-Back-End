if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const router = require('./routes/index');
const errorHandler = require('./utils/errorHandler');

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});