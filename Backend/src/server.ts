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

const app = express();

const server = new ApolloServer({
    schema,
    validationRules: [depthLimit(7)], // see import
});

// Additional middleware can be mounted at this point to run before Apollo.
app.use("*", cors());
app.use(compression()); // see import

app.use(authMiddleware)

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
