import passport from 'passport';
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
import UserFacade from '../facades/userFacade'
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
//const bcrypt = require('bcrypt');
//const bcrypt = require('bcryptjs');


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
        callbackURL: 'http://e1e92de2.ngrok.io/auth/google/callback'//'http://localhost:3000/auth/google/callback',
    }, GoogleTokenStrategyCallback));

    passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password' },
        async function (username: string, password: string, done: any) {
            try {
                if (username && password && await UserFacade.checkUser(username, password)) {
                    const user = await UserFacade.getUser(username)
                    return done(null, user);
                } else {
                    return done('Incorrect Username / Password');
                }
            } catch (error) {
                done(error);
            }
        }));

    passport.use(new JWTStrategy({
        jwtFromRequest: (req: any) => req.cookies.jwt,
        secretOrKey: process.env.SECRET,
    },
        (jwtPayload: any, done: Function) => {
            if (Date.now() > jwtPayload.expires) {
                return done('jwt expired');
            }
            return done(null, jwtPayload);
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};


export default initPassport;
