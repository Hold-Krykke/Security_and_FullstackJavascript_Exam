import passport from 'passport';
import { GraphQLLocalStrategy } from 'graphql-passport';
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;


const initPassport = () => {
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    const GoogleTokenStrategyCallback = (accessToken: String, refreshToken: String, profile: any, done: Function) => {
        console.log('\nACCESS TOKEN \n', accessToken);
        console.log('\nREFRESH TOKEN\n', refreshToken);
        console.log('\nPROFILE\n', profile);


        done(null, {
            accessToken,
            refreshToken,
            profile,
        })
    };

    passport.use(new GoogleStrategy({
        clientID: '848374281346-dsdvalpdbid45inil3kvu438ico0ssjr.apps.googleusercontent.com',
        clientSecret: '6iNQ8mwdBjJwUe-TRL-aKHq9',
        callbackURL: 'http://localhost:3000/auth/google/callback',
    }, GoogleTokenStrategyCallback));

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};


export default initPassport;
