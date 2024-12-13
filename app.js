if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const router = require('./routes/index');
const errorHandler = require('./utils/errorHandler');
const session = require('express-session');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
    session({
        secret: process.env.secret, // Ganti dengan secret key yang aman
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

// Inisialisasi Passport
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});