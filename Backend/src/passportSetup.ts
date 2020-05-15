import passport from "passport";
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

passport.use(
  new GoogleStrategy(
    {
      clientId: process.env.GOOGLE_CLIENT_ID, // "<GOOGLE_CLIENT_ID>", // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, //"<GOOGLE_CLIENT_SECRET>", // e.g. _ASDFA%DFASDFASDFASD#FAD-
      // redirect: "https://your-website.com/google-auth", // this must match your google api settings
      callbackURL: "http://www.example.com/auth/google/callback",
    },
    function (accessToken: any, refreshToken: any, profile: any, done: any) {
      User.findOrCreate({ googleId: profile.id }, function (
        err: any,
        user: any
      ) {
        return done(err, user);
      });
    }
  )
);
