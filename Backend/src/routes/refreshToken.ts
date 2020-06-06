import UserFacade from "../facades/userFacade";
import { ApiError } from "../customErrors/apiError";
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

/**
 * If an error is thrown from this, frontend should log user out, and delete stored token
 * @param req
 * @param res
 * @param next
 * @param tokenExpirationInSeconds
 */
export default async function refreshToken(
  req: any,
  res: any,
  next: any,
  tokenExpirationInSeconds: number
) {
  const expiredToken = req.body.token;
  // Check if it is valid
  try {
    const decryptedToken = jwt.verify(expiredToken, process.env.SECRET, {
      ignoreExpiration: true,
    });
    if (decryptedToken.isOAuth) {
      // If google user, check with google
      // https://developers.google.com/identity/protocols/oauth2/web-server#offline
      const username = decryptedToken.username;
      const useremail = decryptedToken.useremail;
      // Asger talked about making one instance of userFacade and passing it around, to avoid this. 
      const schema: string = process.env.DATABASE_SCHEMA || "";
      const userFacade: UserFacade = new UserFacade(schema);
      try {
        const refresh_token = await userFacade.getUserRefreshToken(useremail);

        const urlencodedParams = new URLSearchParams()
        urlencodedParams.append("client_id", process.env.CLIENT_ID || "")
        urlencodedParams.append("client_secret", process.env.CLIENT_SECRET || "")
        urlencodedParams.append("refresh_token", refresh_token)
        urlencodedParams.append("grant_type", "refresh_token")

        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: urlencodedParams.toString(),
        }

        const googleResponse: any = await fetch(
          `https://oauth2.googleapis.com/token`,
          options
        )
        const googleObject = await googleResponse.json()

        if (!googleObject.access_token) {
          throw new ApiError("Google didn't accept");
        }
      } catch (err) {
        throw err
      }

      const payload = {
        useremail,
        username,
        isOAuth: true
      };
      const newToken = jwt.sign(payload, process.env.SECRET, {
        expiresIn: tokenExpirationInSeconds,
      });
      res.status(200).send({
        token: newToken,
      });
    } else {
    }
  } catch (err) {
    next(err);
  }
}
