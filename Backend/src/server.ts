import express from "express";
import { ApolloServer, AuthenticationError } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import passport from "passport";
import User from "./passport_test/dummyUser";
import cookieParser from "cookie-parser";
import passportJWT from "passport-jwt";
import jwt from "jsonwebtoken";
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { ApiError } from "./customErrors/apiError";
import authMiddleware from "./middlewares/basicAuth";

const { Strategy, ExtractJwt } = passportJWT;

// const { GRAPHQL_PORT, JWT_SECRET } = process.env
const PORT = 3000;
const JWT_SECRET = "holdkrykkesupersecretkey"; //process.env.JWT_SECRET;

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

const corsOptions = {
  origin: [`http://localhost:${PORT}`],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(cookieParser());
app.use("/graphql", (req, res, next) => {
  // https://dev.to/hasusozam/passport-jwt-with-graphql-3gdj
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (user) {
      req.user = user;
    }

    next();
  })(req, res, next);
});

// COMPRESSION MIDDLEWARE
app.use(compression()); // see import

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)], // see import
  context: ({ req }) => {
    // console.log(req); // Currently its getting one every 2-3 seconds, even though nothing is happening
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

// Disabling this while testing on branch
//app.use(authMiddleware);

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
