const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:3000/callback'
}, (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);
        console.log('Profile:', profile);
         accessType: 'offline'
        return done(null, profile);
    } catch (err) {
        console.error('Error in Google Strategy:', err);
        return done(err, null);
    }
}));


//prisma update or insert

module.exports = { passport };