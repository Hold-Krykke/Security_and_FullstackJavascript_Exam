# Backend Repo

[Based on this guide](https://medium.com/@th.guibert/basic-apollo-express-graphql-api-with-typescript-2ee021dea2c)

[Google Security](https://developers.google.com/identity/sign-in/web/backend-auth)

https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred

Flow is schema/schema.graphql and resolverMap.ts goes into schema.ts
schema.ts goes into new Apolloserver in server.ts that is then hosted via express

## Make sure to make a .env file with the following contents:

Find them [here](https://console.developers.google.com/apis/credentials/oauthclient/848374281346-dsdvalpdbid45inil3kvu438ico0ssjr.apps.googleusercontent.com?project=securityexam)

### Replace the nonsense with your own ID and SECRET

JWT_SECRET=holdkrykkesupersecretkey

GOOGLE_CLIENT_ID=asdfghjkljhgfdsghjk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=\_ASDFA%DFASDFASDFASD#FAD-
