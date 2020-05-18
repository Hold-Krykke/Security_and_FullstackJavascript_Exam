import passport from 'passport';
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


const initPassport = () => {
    const GoogleTokenStrategyCallback = (accessToken: String, refreshToken: String, profile: any, done: Function) => {
        console.log('\nACCESS TOKEN \n', accessToken);
        console.log('\nREFRESH TOKEN\n', refreshToken);
        console.log('\nPROFILE\n', profile);
        // Calls for logic or simply logic for storing these tokens goes here
        done(null, {
            accessToken,
            refreshToken,
            profile,
        })
    };

    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/auth/google/callback',
    }, GoogleTokenStrategyCallback));


    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};


export default initPassport;
