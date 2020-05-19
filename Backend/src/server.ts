import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit'; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from 'compression';
import cors from 'cors';
import schema from './schema';
import { ApiError } from './customErrors/apiError';
import authMiddleware from "./middlewares/basicAuth";
import initPassport from './middlewares/passportOauth';
import passport from 'passport';
import { requestLogger, errorLogger } from './middlewares/logger'

initPassport();
const app = express();

app.use(passport.initialize());

//The regular logger needs to be before the router
app.use(requestLogger)

// Keept out because typeScript is angry
const params = { scope: 'openid email', accessType: 'offline', prompt: 'consent' }

app.get('/auth/google', passport.authenticate('google', params));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        res.redirect('/graphql');
    });

//The errorlogger needs to be added AFTER the express router and BEFORE any custom error handlers.
app.use(errorLogger)

const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)], // see import
});

app.use("*", cors());
app.use(compression()); // see import

//app.use(authMiddleware) ***** Needs fixing *****

server.applyMiddleware({ app, path: '/graphql' }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.

app.use(function (err: any, req: any, res: any, next: Function) {
    if (err instanceof (ApiError)) {
        const e = <ApiError>err;
        return res.status(e.errorCode).send({ code: e.errorCode, message: e.message })
    }
    next(err)
})

app.listen({ port: 3000 }, (): void =>
    console.log(`\n\nGraphQL is now running on http://localhost:3000/graphql\n`)
);
