import { setContext } from "apollo-link-context";
import * as SecureStore from "expo-secure-store";

/**
The setContext function takes a function that returns either an object or a promise that returns an object to set the new context of a request.
It receives two arguments: the GraphQL request being executed, and the previous context. 
This link makes it easy to perform async look up of things like authentication tokens and more!
 */
const authLink = setContext(async (request, previousContext) => {
  // get the authentication token from storage if it exists
  // Login should place the token in SecureStore // https://docs.expo.io/versions/latest/sdk/securestore/
  // So here should be logic that goes into SecureStore and gets the Token back out, then returns it.
  const token = await SecureStore.getItemAsync("token"); // "DUMMY TOKEN" // await SecureStore.getItemAsync("token")
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...previousContext.headers,
      authorization: token ? token : "",
    },
  };
});

export default authLink;
