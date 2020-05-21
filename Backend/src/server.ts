import express from "express";
import { ApolloServer, ApolloError } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { ApiError } from "./customErrors/apiError";
import initPassport from './middlewares/passportSetup';
import passport from 'passport';
import { requestLogger, errorLogger } from './middlewares/logger'
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser')
const app = express();
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import { requestLogger, errorLogger } from "./middlewares/logger";

initPassport();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

app.use(requestLogger)
//The regular logger needs to be before the router
app.use(requestLogger);

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
                res.status(200).send({ token: token, username: user.username, useremail: user.email });
            });
        },
    )(req, res);
});


app.get('/auth/google', (req, res) => {
    console.log('redirecturlquery', req.query.redirecturl);
    const stringState = JSON.stringify({ redirectUrl: req.query.redirecturl.toString() })
    const params = { scope: 'openid email', accessType: 'offline', prompt: 'consent', state: stringState }
    passport.authenticate('google', params)
        (req, res)
});

app.get('/auth/google/callback', (req, res) => {
    passport.authenticate('google', { failureRedirect: '/login' },
        (error: Error, user: any) => {
            if (error || !user) {
                res.status(400).json({ error });
                return
            }
            const state = JSON.parse(req.query.state.toString());
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
                res.redirect(`${state.redirectUrl}?token=${token}`);
            });
        })
        (req, res)
});

//The errorlogger needs to be added AFTER the express router and BEFORE any custom error handlers.
app.use(errorLogger);

// let debug = true;
// if (process.env.NODE_ENV !== "production") {
//   debug = false;
// }
//process.env.NODE_ENV = "production";
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)], // https://www.npmjs.com/package/graphql-depth-limit
  debug: process.env.NODE_ENV !== "production",
  formatError: (err: any) => {
    // https://www.apollographql.com/docs/apollo-server/data/errors/#for-the-client-response
    if (err.originalError instanceof ApiError) {
      return new ApolloError(
        err.originalError.msg,
        String(err.originalError.errorCode)
      );
    }

    // Otherwise return the original error.  The error can also
    // be manipulated in other ways, so long as it's returned.
    return err;
  },
});

app.use("*", cors());
app.use(compression()); // see import

server.applyMiddleware({ app, path: "/graphql" });

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


