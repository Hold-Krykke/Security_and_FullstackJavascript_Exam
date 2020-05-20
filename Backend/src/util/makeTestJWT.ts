import jwt from "jsonwebtoken"; // https://www.npmjs.com/package/jsonwebtoken
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

const JWT_SECRET = "" + process.env.JWT_SECRET;

const payload = {
  name: "Test Name",
  email: "Unique Test email",
  photoUrl: "https://i.imgur.com/x9XtMsh.jpg",
};

const settings = {
  /**
   * Eg: 60, "2 days", "10h", "7d".
   * A numeric value is interpreted as a seconds count.
   * If you use a string be sure you provide the time units (days, hours, etc),
   * otherwise milliseconds unit is used by default ("120" is equal to "120ms").
   *
   * Don't make this too long, in case token is stolen.
   */
  expiresIn: "1h",
};

const token = jwt.sign(payload, JWT_SECRET, { ...settings });

export default token;
