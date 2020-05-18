import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import session from "express-session";
import { v4 as uuid } from "uuid";
import passport from "passport";
import User from "./passport_test/dummyUser";
import typeDefs from "./passport_test/typeDefs";
import resolvers from "./passport_test/resolvers";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser"; // However, I want to point out that express-graphql can parse request's body according to its content-type, so the body parser is unnecessary. With that gone, you can send application/graphql request using postman, and copy & paste the query/mutation directly from graphiql.
import passportJWT from "passport-jwt";
import jwt from "jsonwebtoken";
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { ApiError } from "./customErrors/apiError";
import authMiddleware from "./middlewares/basicAuth";

const SESSION_SECRECT = "bad secret";
const { Strategy, ExtractJwt } = passportJWT;

// const { GRAPHQL_PORT, JWT_SECRET } = process.env
const PORT = 3000;
const JWT_SECRET = "bad secret";

// generate a jwt token for testing purposes
// Where do we use this?
const test_jwt = jwt.sign(User.getUsers()[0], JWT_SECRET);
console.log(test_jwt);

const params = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};
const strategy = new Strategy(params, (payload, done) => {
  const user = User.getUser(payload.id);
  return done(null, user);
});
passport.use(strategy);
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, User.getUser(id));
});

const app = express();

// CORS MIDDLEWARE
//app.use("*", cors());
const corsOptions = {
  origin: [`http://localhost:${PORT}`],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use(bodyParser());
app.use("/graphql", (req, res, next) => {
  // https://dev.to/hasusozam/passport-jwt-with-graphql-3gdj
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
});

/**
 * After setting the express-session middleware
 * we initialize passport by calling passport.initialize().
 * Afterward we connect Passport and express-session by adding the
 * passport.session() middleware.
 */
const sessionOptions = {
  name: "Hold Krykke",
  secret: SESSION_SECRECT,
  resave: false, // What are these settings?
  saveUninitialized: false,
  cookie: {
    maxAge: 40000000,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
  },
};
app.use(session(sessionOptions));
// app.use(
//   // session({
//   //   //https://github.com/expressjs/session
//   //   genid: (req) => uuid(),
//   //   secret: SESSION_SECRECT,
//   //   resave: true,
//   //   saveUninitialized: false,
//   // })

// );
app.use(passport.session());

// COMPRESSION MIDDLEWARE
app.use(compression()); // see import

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //schema,
  validationRules: [depthLimit(7)], // see import
  context: ({ req }) => {
    console.log(req);
    const token = req.headers.authorization || "";
    if (token) console.log(jwt.verify(token, JWT_SECRET));
    return {
      session: req.session,
      user: req.user,
    };
  }, // buildContext copies a couple of Passport related fields like its authenticate and login functions from the request into the context and makes them usable from the resolvers.
  playground: {
    settings: {
      "request.credentials": "include",
    },
  },
});
app.use(authMiddleware);

app.use(function (err: any, req: any, res: any, next: Function) {
  if (err instanceof ApiError) {
    const e = <ApiError>err;
    return res
      .status(e.errorCode)
      .send({ code: e.errorCode, message: e.message });
  }
  next(err);
});
server.applyMiddleware({ app, cors: false, path: "/graphql" }); // Mount Apollo middleware here. If no path is specified, it defaults to `/graphql`.
app.listen({ port: PORT }, (): void =>
  console.log(
    `\n\nGraphQL is now running on http://localhost:${PORT}/graphql\n`
  )
);
