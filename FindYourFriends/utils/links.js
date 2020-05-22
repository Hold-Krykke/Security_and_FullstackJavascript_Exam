import { onError } from "apollo-link-error";
import { setContext } from "apollo-link-context";

/**
 * Put logic here, on how to handle errors.
 */
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.map((err) => {
      const { message, locations, path } = err;
      console.log(
        `[GraphQL error]: 
          Message: ${message}, 
          Location: ${locations}, 
          Path: ${path}, 
          \n\nFull Error: ${err}`
      );

      if (err.extensions.code == "UNAUTHENTICATED") {
        // Add logic here like "If not authenticated, send to login-page"
        // And set errorMessage to user somewhere,
        // that they tried something that required login, but they weren't logged in
      }
    });
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

/**
 * The setContext function takes a function that returns either an object or a promise that returns an object to set the new context of a request.
It receives two arguments: the GraphQL request being executed, and the previous context. 
This link makes it easy to perform async look up of things like authentication tokens and more!
 */
const authLink = setContext((request, previousContext) => {
  // get the authentication token from storage if it exists
  // Login should place the token in SecureStore // https://docs.expo.io/versions/latest/sdk/securestore/
  // So here should be logic that goes into SecureStore and gets the Token back out, then returns it.
  const token = "DUMMY TOKEN"; // await SecureStore.getItemAsync("token")
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...previousContext.headers,
      authorization: token ? token : "",
    },
  };
});

export { authLink, errorLink };
