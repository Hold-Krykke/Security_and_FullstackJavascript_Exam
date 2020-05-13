// Just to show usage of the .env, taken from: https://medium.com/@jackrobertscott/how-to-use-google-auth-api-with-node-js-888304f7e3a0
// Can be extended way further, if you follow guide above. This is just to show.
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID, // "<GOOGLE_CLIENT_ID>", // e.g. asdfghjkljhgfdsghjk.apps.googleusercontent.com
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, //"<GOOGLE_CLIENT_SECRET>", // e.g. _ASDFA%DFASDFASDFASD#FAD-
  redirect: "https://your-website.com/google-auth", // this must match your google api settings
};

export default googleConfig;
