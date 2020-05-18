import jwt from "jsonwebtoken";
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });

// Middleware for auth
const ass = async ({ req, res, next }: { req: any; res: any; next: any }) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1]; // Authorization: Bearer tokenvalueasssnfasnfasnflnf
  if (!token || token === "") {
    req.isAuth = false;
    return next();
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "holdkrykkesupersecretkey"); // process.env.JWT_SECRET // didnt work
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.isAuth = true;
  req.userName = decodedToken.userName;
  next();
};

export default ass;
