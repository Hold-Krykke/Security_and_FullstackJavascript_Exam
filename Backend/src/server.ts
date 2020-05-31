import express from "express";
import { ApolloServer, ApolloError } from "apollo-server-express";
import depthLimit from "graphql-depth-limit"; // https://www.npmjs.com/package/graphql-depth-limit
// Gzip compressing can greatly decrease the size of the response body and hence increase the speed of a web app.
// https://expressjs.com/en/advanced/best-practice-performance.html
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { ApiError } from "./customErrors/apiError";
import initPassport from "./middlewares/passportSetup";
import passport from "passport";
import { requestLogger, errorLogger } from "./middlewares/logger";
import BruteForceDetector from "./util/bruteForceDetector";
import eventEmitter from "./util/CustomEmitter";
import refreshToken from "./routes/refreshToken";
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const BFD = new BruteForceDetector(1000);
// milliseconds
const banTime = 5000;
// List of temporarily banned IP addresses
const addressList = new Map();

initPassport();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

//The regular logger needs to be before the router

const tokenExpirationInSeconds = 60; //3600

app.post("/auth/jwt", (req, res) => {
  /* ---------------------------------- */
  /* DoS/BruteForce blocking code start */
  /* ---------------------------------- */
  // Check if IP is in list of banned IPs
  let time = addressList.get(req.connection.remoteAddress);
  if (time) {
    // If IP is in the list then we check the time delta
    let delta = new Date().getTime() - time;
    if (delta < banTime) {
      // If the time delta i smaller than the ban time then the client still has to wait
      console.log("Delta: ", delta);
      res
        .status(401)
        .json({ message: "Please wait before you try to log in again" });
      return;
    }
  }
  const remoteAddress: string | any = req.connection.remoteAddress;
  BFD.addUrl(remoteAddress);
  /*  --------------------------------  */
  /*  DoS/BruteForce blocking code end  */
  /*  --------------------------------  */

  passport.authenticate(
    "local",
    { session: false },
    (error: Error, user: any) => {
      if (error || !user) {
        res.status(400).json({ error });
        return;
      }

      const payload = { useremail: user.email, username: user.username, isOAuth: false };
      req.login(payload, { session: false }, (error) => {
        if (error) {
          res.status(400).send({ error });
        }
        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: tokenExpirationInSeconds,
        });
        res.status(200).send({
          token: token,
        });
      });
    }
  )(req, res);
});

// Event emitter listening for brute force warnings:
// The event passed to the function contains the properties the BFD added when emitting the event
eventEmitter.on("Brute Force Attack Detected", (event: any) => {
  console.log("\n");
  console.log("Brute Force attack detected!");
  console.log("Attacker URL:", event.url);
  console.log("Time since last request:", event.timeBetweenCalls);
  // We add the url / address of the attacker to our map to keep track of them
  addressList.set(event.url, new Date().getTime());
});

app.get("/auth/google", (req, res) => {
  console.log("redirecturlquery", req.query.redirecturl);
  const stringState = JSON.stringify({
    redirectUrl: req.query.redirecturl.toString(),
  });
  const params = {
    scope: "openid email",
    accessType: "offline",
    prompt: "consent",
    state: stringState,
  };
  passport.authenticate("google", params)(req, res);
});

app.get("/auth/google/callback", (req, res) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/login" },
    (error: Error, user: any) => {
      if (error || !user) {
        res.status(400).json({ error });
        return;
      }
      const state = JSON.parse(req.query.state.toString());
      const payload = { useremail: user.profile.emails[0].value, username: user.profile.username, isOAuth: true };

      req.login(payload, { session: false }, (error) => {
        if (error) {
          res.status(400).send({ error });
        }
        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: tokenExpirationInSeconds
        });
        res.redirect(`${state.redirectUrl}?token=${token}`);
      });
    }
  )(req, res);
});

// Refresh an expired token
app.post("/refresh", async (req, res, next) => {
  // Get token from body
  await refreshToken(req, res, next, tokenExpirationInSeconds);
});

//The errorlogger needs to be added AFTER the express router and BEFORE any custom error handlers.
app.use(errorLogger);

const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)], // https://www.npmjs.com/package/graphql-depth-limit
  debug: process.env.NODE_ENV !== "production",
  formatError: (err: any) => {
    // https://www.apollographql.com/docs/apollo-server/data/errors/#for-the-client-response
    if (err.originalError instanceof ApiError) {
      return new ApolloError(
        err.originalError.message,
        String(err.originalError.errorCode)
      );
    }

    // Otherwise return the original error.  The error can also
    // be manipulated in other ways, so long as it's returned.
    return err;
  },
  // This is run on every incoming request to the GraphQL endpoint.
  context: ({ req }) => {
    // Get the token from the headers.
    const encryptedToken = req.headers.authorization || "";

    if (encryptedToken) {
      // Validate the token, if it's on the request authorization header.
      try {
        // If token is valid and not expired
        const token = jwt.verify(encryptedToken, process.env.SECRET);
        // Add the token to the context, so resolvers can get it.
        // console.log("TOKEN WAS VALID:", JSON.stringify({ token }, null, 4));
        return { valid: true, token };
      } catch (err) {
        // Token was Expired, or signature invalid.
        console.log("TOKEN WAS INVALID");
        return { valid: false };
      }
    } else {
      console.log("NO TOKEN");
      // No token at all on header.
      return { valid: false };
    }
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
