import { setContext } from "apollo-link-context";
import * as SecureStore from "expo-secure-store";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { SERVER_URL } from "../constants/settings";
import { Observable } from "apollo-link";

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
  try {
    const expiredToken = await SecureStore.getItemAsync("token");

    const request = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: expiredToken }),
    };
    const token = await fetch(`${SERVER_URL}/refresh`, request)
      .then((response) => response.json())
      .then((data) => data.token);

    console.log("TOKEN in GetNewToken: " + JSON.stringify(token, null, 4));
    await SecureStore.setItemAsync("token", token);

    return token;
  } catch (err) {
    console.log("ERROR IN getNewToken: ", err);
    // Log user out, because token couldn't be refreshed.
    // await SecureStore.deleteItemAsync("token")
    // setSignedIn(false)
  }
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      // console.log("ALL THE ERRORS: ", JSON.stringify(graphQLErrors, null, 4));
      const { message, locations, path, extensions } = graphQLErrors[0];
      console.log(
        `[GraphQL error]:
          Message: ${message},
          Location: ${JSON.stringify(locations, null, 4)},
          Path: ${path}`
        // \nFull Error: ${JSON.stringify(err, null, 4)}\n\n
      );
      console.log("extensions.code", JSON.stringify(extensions.code, null, 4));
      switch (extensions.code) {
        case "UNAUTHENTICATED":
          console.log("entered unauthenticated switch case");
          /*
            One caveat is that the errors from the new response from retrying the request does not get passed into the error handler again. 
            This helps to avoid being trapped in an endless request loop when you call forward() in your error handler.
            */
          // error code is set to UNAUTHENTICATED
          // when AuthenticationError thrown in resolver
          
          const promiseToObservable = (promise) => {
            return new Observable((subscriber) => {
              promise.then(
                (token) => {
                  if (subscriber.closed) {
                    return;
                  }
                  subscriber.next(token);
                  subscriber.complete();
                },
                (err) => {
                  subscriber.error(err);
                }
              );
            });
          };
          // modify the operation context with a new token
          const oldHeaders = operation.getContext().headers;
          return promiseToObservable(getNewToken()).flatMap((newToken) => {
            console.log("Refreshed Google Token");
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: newToken,
              },
            });
            // retry the request, returning the new observable https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-error#callback
            return forward(operation);
          });
      }
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  }
);
// the URI key is a string endpoint or function resolving to an endpoint -- will default to "/graphql" if not specified
const httpLink = createHttpLink({ uri: SERVER_URL + "/graphql" });
/** httpLink and cache are requirements as of Apollo 2 https://www.apollographql.com/docs/react/api/apollo-client/#required-fields
 * - Error link - https://www.apollographql.com/docs/link/links/error/
 * - In Memory Cache - https://www.apollographql.com/docs/angular/basics/caching/
 * Whenever Apollo Client fetches query results from your server,
 * it automatically caches those results locally.
 * This makes subsequent executions of the same query extremely fast.
 */
const client = new ApolloClient({
  uri: SERVER_URL,
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(), // automatic caching
});
export default client;
