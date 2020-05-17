import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import session from "express-session";
import { v4 as uuid } from "uuid";
import passport from "passport";
import User from "./passport_test/dummyUser";
import typeDefs from "./passport_test/typeDefs";
import resolvers from "./passport_test/resolvers";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const SESSION_SECRECT = "bad secret";

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const users = User.getUsers();
  const matchingUser = users.find((user) => user.id === id);
  done(null, matchingUser);
});
passport.use(
  new GraphQLLocalStrategy((email: any, password: any, done: any): any => {
    /*
    If we find a match we pass the user to the done callback. 
    Otherwise, we create an error and pass it to done.
    */
    const users = User.getUsers();
    const matchingUser = users.find(
      (user) => email === user.email && password === user.password
    );
    const error = matchingUser ? null : new Error("no matching user");
    done(error, matchingUser);
  })
);
const app = express();
// CORS MIDDLEWARE
//app.use("*", cors());
// const corsOptions = {
//   origin: ["http://localhost:3000"],
//   credentials: true,
// };
// app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser());
/**
 * After setting the express-session middleware
 * we initialize passport by calling passport.initialize().
 * Afterward we connect Passport and express-session by adding the
 * passport.session() middleware.
 */
app.use(
  session({
    //https://github.com/expressjs/session
    genid: (req) => uuid(),
    secret: SESSION_SECRECT,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// COMPRESSION MIDDLEWARE
//app.use(compression()); // see import

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //schema,
  validationRules: [depthLimit(7)], // see import
  // buildContext will add all additional fields you pass to it to the context.
  context: ({ req, res }) => buildContext({ req, res, User }), // buildContext copies a couple of Passport related fields like its authenticate and login functions from the request into the context and makes them usable from the resolvers.
  playground: {
    settings: {
      "request.credentials": "same-origin",
    },
  },
});
server.applyMiddleware({ app, cors: false, path: "/graphql" }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.

const PORT = 3000;
app.listen({ port: PORT }, (): void =>
  console.log(
    `\n\nGraphQL is now running on http://localhost:${PORT}/graphql\n`
  )
);
