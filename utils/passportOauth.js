const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const { id, displayName, emails } = profile;
                const email = emails?.[0]?.value || null;
                const fullName = displayName || 'Unknown User';

                const user = await prisma.user.upsert({
                    where: { email },
                    update: {
                        googleId: id,
                        fullName,
                        isVerified: true,
                    },
                    create: {
                        googleId: id,
                        email,
                        fullName,
                        isVerified: true,
                        role: 'Buyer',
                    },
                });

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);



//prisma update or insert

module.exports = passport;