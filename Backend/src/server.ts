import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { AuthenticationError } from 'apollo-server-express'


const app = express();
app.use(passport.initialize());
app.use(passport.session());

const apollo = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)], // see import
  // add request and response to graphQL context
  context: ({ req, res }) => {
    user: req.user,
    /* Add User to the Context here. 
      The context object is one that gets passed to every single resolver at every level, so we can access it anywhere in our schema code. It’s where we can store things like data fetchers, database connections, and (conveniently) information about the user making the request.
      Since the context is generated again with every new request, we don’t have to worry about cleaning up user data at the end of execution.
  */
  },
});

// Additional middleware can be mounted at this point to run before Apollo.
// CORS MIDDLEWARE
app.use("*", cors());
// COMPRESSION MIDDLEWARE
app.use(compression()); // see import

apollo.applyMiddleware({ app, path: "/graphql" }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.

app.listen({ port: 3000 }, (): void =>
  console.log(`\n\nGraphQL is now running on http://localhost:3000/graphql\n`)
);
