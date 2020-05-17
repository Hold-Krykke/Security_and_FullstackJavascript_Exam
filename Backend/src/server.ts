import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import session from "express-session";
import uuid from "uuid/v4";

const app = express();

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)], // see import
});

// Additional middleware can be mounted at this point to run before Apollo.
// CORS MIDDLEWARE
app.use("*", cors());
// COMPRESSION MIDDLEWARE
app.use(compression()); // see import

server.applyMiddleware({ app, path: "/graphql" }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.

const PORT = 3000;
app.listen({ port: PORT }, (): void =>
  console.log(
    `\n\nGraphQL is now running on http://localhost:${PORT}/graphql\n`
  )
);
