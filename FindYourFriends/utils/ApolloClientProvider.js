import { setContext } from "apollo-link-context";
import * as SecureStore from "expo-secure-store";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { backendUri } from "../settings";
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

const getNewToken = async () => {
  const request = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: await SecureStore.getItemAsync("token") }),
  };
  try{
  const token = await fetch(`${backendUri}/refresh`, request)
    .then((response) => response.json())
    .then((data) => data.token);

    await SecureStore.setItemAsync("token", token);
    
  return token;
  }catch(err){
    // Log user out, because token couldn't be refreshed. 
    await SecureStore.deleteItemAsync("token")
    // setSignedIn(false)
  }
  

};

const errorLink = onError(
  async ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      // console.log("ALL THE ERRORS: ", JSON.stringify(graphQLErrors, null, 4));
      graphQLErrors.map((err) => {
        const { message, locations, path, extensions } = err;
        console.log(
          `[GraphQL error]:
          Message: ${message},
          Location: ${JSON.stringify(locations, null, 4)},
          Path: ${path}`
          // \nFull Error: ${JSON.stringify(err, null, 4)}\n\n
        );
        switch (extensions.code) {
          case "UNAUTHENTICATED":
            // error code is set to UNAUTHENTICATED
            // when AuthenticationError thrown in resolver

            // modify the operation context with a new token
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: await getNewToken(),
              },
            });
            // retry the request, returning the new observable
            return forward(operation);
        }

        
      });
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }
);
// the URI key is a string endpoint or function resolving to an endpoint -- will default to "/graphql" if not specified
const httpLink = createHttpLink({ uri: backendUri + "/graphql" });
/** httpLink and cache are requirements as of Apollo 2 https://www.apollographql.com/docs/react/api/apollo-client/#required-fields
 * - Error link - https://www.apollographql.com/docs/link/links/error/
 * - In Memory Cache - https://www.apollographql.com/docs/angular/basics/caching/
 * Whenever Apollo Client fetches query results from your server,
 * it automatically caches those results locally.
 * This makes subsequent executions of the same query extremely fast.
 */
const client = new ApolloClient({
  uri: backendUri,
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(), // automatic caching
});
export default client;
