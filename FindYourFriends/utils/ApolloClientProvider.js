import { setContext } from "apollo-link-context";
import * as SecureStore from "expo-secure-store";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { SERVER_URL, TOKEN_KEY } from "../constants/settings";
import { Observable } from "apollo-link";
import jwt_decode from "jwt-decode";

// Places auth token on every outgoing request. 
const authLink = setContext(async (request, previousContext) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
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
    const expiredToken = await SecureStore.getItemAsync(TOKEN_KEY);
    const decoded = jwt_decode(expiredToken);
    if (!decoded.isOAuth) throw Error("You need to log in again");
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

    await SecureStore.setItemAsync(TOKEN_KEY, token);

    return token;
  } catch (err) {
    throw err;
  }
};

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      const { message, locations, path, extensions } = graphQLErrors[0];
      // console.log(
      //   `[GraphQL error]:
      //     Message: ${message},
      //     Location: ${JSON.stringify(locations, null, 4)},
      //     Path: ${path}`
      //   // \nFull Error: ${JSON.stringify(err, null, 4)}\n\n
      // );
      switch (extensions.code) {
        case "UNAUTHENTICATED":
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
                  // console.log("Subscriber error");
                  // throw Error("User is not OAuth type");
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
    //if (networkError) // console.log(`[Network error]: ${networkError}`);
  }
);
// the URI key is a string endpoint or function resolving to an endpoint -- will default to "/graphql" if not specified
const httpLink = createHttpLink({ uri: SERVER_URL + "/graphql" });
/** httpLink and cache are requirements as of Apollo 2 https://www.apollographql.com/docs/react/api/apollo-client/#required-fields
 * - Error link - https://www.apollographql.com/docs/link/links/error/
 * - In Memory Cache - https://www.apollographql.com/docs/angular/basics/caching/
 * Whenever Apollo Client fetches query results from your server, it automatically caches those results locally.
 * This makes subsequent executions of the same query extremely fast.
 */
const client = new ApolloClient({
  uri: SERVER_URL,
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(), // automatic caching
});
export default client;
