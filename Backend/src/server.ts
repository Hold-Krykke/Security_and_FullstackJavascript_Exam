import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { ApiError } from "./customErrors/apiError";
import authMiddleware from "./middlewares/basicAuth";
import faketoken from "./util/makeTestJWT";
import initPassport from './middlewares/passportSetup';
import passport from 'passport';
import { requestLogger, errorLogger } from './middlewares/logger'
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const app = express();
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })


initPassport();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

app.use(requestLogger)
//The regular logger needs to be before the router
app.post('/auth/jwt', (req, res) => {
    passport.authenticate(
        'local',
        { session: false },
        (error: Error, user: any) => {
            if (error || !user) {
                res.status(400).json({ error });
                return
            }

            const payload = {
                useremail: user.email,
                expires: Date.now() + 3600000,
            };

            req.login(payload, { session: false }, (error) => {
                if (error) {
                    res.status(400).send({ error });
                }
                const token = jwt.sign(JSON.stringify(payload), process.env.SECRET);
                res.cookie('jwt', jwt, { httpOnly: true, secure: true });
                res.status(200).send({ username: user.username, email: user.email });
            });
        },
    )(req, res);
});

// Kept out because typeScript is angry
const params = { scope: 'openid email', accessType: 'offline', prompt: 'consent' }
app.get('/auth/google', passport.authenticate('google', params));

app.get("/auth/google/callback", (req, res) => {
    passport.authenticate("google", { failureRedirect: "/login" },
        (error: Error, user: any) => {
            if (error || !user) {
                res.status(400).json({ error });
                return
            }
            const payload = {
                useremail: user.profile.emails[0].value,
                expires: Date.now() + 3600000,
            };

            req.login(payload, { session: false }, (error) => {
                if (error) {
                    res.status(400).send({ error });
                }
                const token = jwt.sign(JSON.stringify(payload), process.env.SECRET);
                res.cookie('jwt', jwt, { httpOnly: true, secure: false });
                res.redirect(`https://localhost:3000/graphql`);
            });
        })
        (req, res)
    //{
    //     //console.log('\nPROFILE', res.user.profile)
    //     const authToken = faketoken;
    //     res.redirect(`http://localhost:3000/graphql`); // exp://192.168.1.10:19000/?token=${authToken} This should point to the Mobile App. Should include info like /?authToken=23xbdbb21b3
    //}
});

//The errorlogger needs to be added AFTER the express router and BEFORE any custom error handlers.
app.use(errorLogger)

const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)], // see import
});

app.use("*", cors());
app.use(compression()); // see import

//app.use(authMiddleware) //***** Needs fixing *****

server.applyMiddleware({ app, path: "/graphql" }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.

app.use(function (err: any, req: any, res: any, next: Function) {
    if (err instanceof ApiError) {
        const e = <ApiError>err;
        return res
            .status(e.errorCode)
            .send({ code: e.errorCode, message: e.message });
    }
    next(err);
});

app.listen({ port: 3000 }, (): void =>
    console.log(`\n\nGraphQL is now running on http://localhost:3000/graphql\n`)
);
