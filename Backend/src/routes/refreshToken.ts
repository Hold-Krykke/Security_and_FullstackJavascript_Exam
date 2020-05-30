import UserFacade from "../facades/userFacade";
import { ApiError } from "../customErrors/apiError";
const jwt = require("jsonwebtoken");
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
    // If google user, check with google
    // https://developers.google.com/identity/protocols/oauth2/web-server#offline
    const username = decryptedToken.username;
    const useremail = decryptedToken.useremail;
    const schema: string = process.env.DATABASE_SCHEMA || "";
    const userFacade: UserFacade = new UserFacade(schema);
    if (await userFacade.isOAuthUser(username)) {
      try {
        const googleResponse: any = await fetch(
          "https://oauth2.googleapis.com/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: process.env.CLIENT_ID,
              client_secret: process.env.CLIENT_SECRET,
              refresh_token: await userFacade.getUserRefreshToken(useremail),
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
        const googleAccessToken = googleResponse.access_token;
        if (!googleAccessToken) {
          throw new ApiError("Google didn't accept");
        }
      } catch (err) {
        // Google didn't accept
        // Should it just be next(err)?
        // next(err)
        throw new ApiError("Google didn't accept");
        // Should log user out in frontend.
      }
    }
    const payload = { useremail, username };
    const newToken = jwt.sign(payload, process.env.SECRET, {
      expiresIn: tokenExpirationInSeconds,
    });
    res.status(200).send({
      token: newToken,
    });
  } catch (err) {
    next(err);
    // Not valid
    // throw new ApiError("Token wasn't valid.");
    // Should probably at this point, somehow, log user out?
  }
}
