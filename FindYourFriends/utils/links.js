import { onError } from "apollo-link-error";

const getToken = () => {
  return "FAKE TOKEN";
};

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

// You can also make an "authLink" that attaches the token properly to every request here
// And then .concat it.
// Kinda like a middleware
const authLink = setContext((_, { headers }) => {
  const token = getToken(); //
  return { headers: { ...headers, cookie: token ? `qid=${token}` : "" } };
});

export { authLink, errorLink };
