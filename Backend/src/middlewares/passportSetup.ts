import passport from 'passport';
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
import UserFacade from '../facades/userFacade'
import IUser from "../interfaces/IUser";
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const schema: string = process.env.DATABASE_SCHEMA || '';
const userFacade: UserFacade = new UserFacade(schema);

const initPassport = () => {
    async function GoogleTokenStrategyCallback(accessToken: string, refreshToken: string, profile: any, done: Function) {
        // console.log('\nREFRESH TOKEN\n', refreshToken);
        const email: string = profile.emails[0].value;
        let user = null;
        // First we try to get a user
        try {
            user = await userFacade.getUserByEmail(email);
        } catch (err) { }
        // If the user is null we create a new OAuth user
        if (!user) {
            try {
                let newOAuthUser: IUser = {
                    username: null,
                    password: null,
                    email: email,
                    isOAuth: true,
                    refreshToken: null
                }
                await userFacade.addOAuthUser(newOAuthUser);
            } catch (err) {
                console.log(err.message);
            }
        }
        // Then we update the refresh token of the user
        try {
            const success = await userFacade.updateUserRefreshToken(email, refreshToken, true);
            if (!success) {
                console.log("FAILED TO UPDATE REFRESH TOKEN FOR OAUTH USER");
            }
        } catch (err) {
        }
        // We're adding the username to the profile so we can access it in server.ts
        profile.username = user?.username;

        // Calls for logic or simply logic for storing these tokens goes here
        done(null, { accessToken, refreshToken, profile })
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
                    return done('Incorrect useremail / password');
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
