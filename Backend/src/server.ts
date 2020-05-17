import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import session from "express-session";
import uuid from "uuid/v4";
import passport from "passport";
import User from "./passport_test/dummyUser";

const SESSION_SECRECT = "bad secret";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const users = User.getUsers();
  const matchingUser = users.find((user) => user.id === id);
  done(null, matchingUser);
});

const app = express();
/**
 * After setting the express-session middleware
 * we initialize passport by calling passport.initialize().
 * Afterward we connect Passport and express-session by adding the
 * passport.session() middleware.
 */
app.use(
  session({
    genid: (req) => uuid(),
    secret: SESSION_SECRECT,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Additional middleware can be mounted at this point to run before Apollo.
// CORS MIDDLEWARE
app.use("*", cors());
// COMPRESSION MIDDLEWARE
app.use(compression()); // see import

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)], // see import
  context: ({ req, res }) => ({
    // Could use this to build the context https://github.com/jkettmann/graphql-passport
    getUser: () => req.user,
    logout: () => req.logout(), // Passed down through context, by passport
  }),
});
server.applyMiddleware({ app, path: "/graphql" }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.

const PORT = 3000;
app.listen({ port: PORT }, (): void =>
  console.log(
    `\n\nGraphQL is now running on http://localhost:${PORT}/graphql\n`
  )
);
