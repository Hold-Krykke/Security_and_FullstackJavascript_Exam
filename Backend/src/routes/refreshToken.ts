import UserFacade from "../facades/userFacade";
import { ApiError } from "../customErrors/apiError";
const jwt = require("jsonwebtoken");

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
        const googleResponse: any = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
              refresh_token,
              grant_type: "refresh_token",
            }),
          }
        ).then((res) => res.json);
        /*
        Sample response
          {
            "access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
            "expires_in": 3920,
            "scope": "https://www.googleapis.com/auth/drive.metadata.readonly",
            "token_type": "Bearer"
          }
        */
        if (!googleResponse.access_token) {
          throw new ApiError("Google didn't accept");
        }

      } catch (err) {
        // Google didn't accept
        // Should it just be next(err)?
        // next(err)
        throw new ApiError("Google didn't accept");
        // Should log user out in frontend.
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
      throw new ApiError("You have to log in again.")
    }
  } catch (err) {
    next(err);
    // Not valid
    // throw new ApiError("Token wasn't valid.");
    // Should probably at this point, somehow, log user out?
  }
}
