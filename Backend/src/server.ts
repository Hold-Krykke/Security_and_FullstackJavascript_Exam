import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import bodyParser from "body-parser";

const app = express();

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)], // see import
});

// Additional middleware can be mounted at this point to run before Apollo.
// Body-parser https://www.npmjs.com/package/body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// CORS MIDDLEWARE
app.use("*", cors());
// COMPRESSION MIDDLEWARE
app.use(compression()); // see import

server.applyMiddleware({ app, path: "/graphql" }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.

app.listen({ port: 3000 }, (): void =>
  console.log(`\n\nGraphQL is now running on http://localhost:3000/graphql\n`)
);
