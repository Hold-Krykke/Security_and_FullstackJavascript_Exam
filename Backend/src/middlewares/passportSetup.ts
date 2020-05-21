import passport from 'passport';
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
import UserFacade from '../facades/userFacade'
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const schema: string = process.env.DATABASE_SCHEMA || '';
const userFacade: UserFacade = new UserFacade(schema);

const initPassport = () => {
    const GoogleTokenStrategyCallback = (accessToken: String, refreshToken: String, profile: any, done: Function) => {
        console.log('\nREFRESH TOKEN\n', refreshToken);
        // Calls for logic or simply logic for storing these tokens goes here
        done(null, { accessToken, refreshToken, profile, })
    };
    passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/auth/google/callback` // skal skiftes til deployet url i .env
    }, GoogleTokenStrategyCallback));

    passport.use(new LocalStrategy({ usernameField: 'useremail', passwordField: 'password' },
        async function (useremail: string, password: string, done: any) {
            try {
                if (useremail && password && await userFacade.checkUser(useremail, password)) {
                    const user = await userFacade.getUserByEmail(useremail)
                    return done(null, user);
                } else {
                    return done('Incorrect useremail / Password');
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
