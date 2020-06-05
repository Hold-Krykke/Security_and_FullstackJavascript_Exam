import UserFacade from "../facades/userFacade";
import { ApiError } from "../customErrors/apiError";
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");

// import jwt from "jsonwebtoken"

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
  console.log("entered refreshtoken path")

  const expiredToken = req.body.token;
  // Check if it is valid
  try {
    console.log("Entered try")

    const decryptedToken = jwt.verify(expiredToken, process.env.SECRET, {
      ignoreExpiration: true,
    });
    console.log(JSON.stringify({ decryptedToken }, null, 4))
    if (decryptedToken.isOAuth) {
      // If google user, check with google
      // https://developers.google.com/identity/protocols/oauth2/web-server#offline
      const username = decryptedToken.username;
      const useremail = decryptedToken.useremail;
      // Asger talked about making one instance of userFacade and passing it around, to avoid this. 
      const schema: string = process.env.DATABASE_SCHEMA || "";
      const userFacade: UserFacade = new UserFacade(schema);
      console.log("Right before get Refresh Token")
      try {
        const refresh_token = await userFacade.getUserRefreshToken(useremail);
        console.log("Right before Google POST for checking refresh token.",
          JSON.stringify({ refresh_token }, null, 4))
        const urlencodedParams = new URLSearchParams()
        // const myBody = {
        //   client_id: process.env.CLIENT_ID || "",
        //   client_secret: process.env.CLIENT_SECRET || "",
        //   refresh_token,
        //   grant_type: "refresh_token",
        // }
        urlencodedParams.append("client_id", process.env.CLIENT_ID || "")
        urlencodedParams.append("client_secret", process.env.CLIENT_SECRET || "")
        urlencodedParams.append("refresh_token", refresh_token)
        urlencodedParams.append("grant_type", "refresh_token")
        console.log("application/x-www-form-urlencoded",
          urlencodedParams.toString()
        )
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: urlencodedParams.toString(),
        }
        console.log("OPTIONS: ", JSON.stringify(options, null, 4))
        const googleResponse: any = await fetch(
          `https://oauth2.googleapis.com/token`,
          options
        )
        const googleObject = await googleResponse.json()


        /*
        Sample response
          {
            "access_token": "1/fFAGRNJru1FTz70BzhT3Zg",
            "expires_in": 3920,
            "scope": "https://www.googleapis.com/auth/drive.metadata.readonly",
            "token_type": "Bearer"
          }
        */
        console.log("Right after google response.", JSON.stringify({ googleObject }, null, 4))
        if (!googleObject.access_token) {
          console.log("entered if not access_token")
          throw new ApiError("Google didn't accept");
        }

      } catch (err) {
        // Google didn't accept
        // Should it just be next(err)?
        // next(err)
        // throw new ApiError("Google didn't accept");
        // Should log user out in frontend.
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
      // throw new ApiError("You have to be an OAuth user to get your token refreshed.")
      // throw err
    }
  } catch (err) {
    next(err);
    // Not valid
    // throw new ApiError("Token wasn't valid.");
    // Should probably at this point, somehow, log user out?
  }
}
