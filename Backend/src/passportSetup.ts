import passport from "passport";
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

/*
The GitHub authentication strategy authenticates users using a GitHub account and OAuth 2.0 tokens. 
The strategy requires a verify callback, which accepts these credentials and calls done providing a user, 
as well as options specifying a client ID, client secret, and callback URL.
*/
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      User.findOrCreate({ githubId: profile.id }, function (err, user) {
        return done(err, user);
      });
    }
  )
);
