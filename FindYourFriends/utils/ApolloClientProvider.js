import { setContext } from "apollo-link-context";
import * as SecureStore from "expo-secure-store";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { SERVER_URL } from "../constants/settings";

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

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        // console.log("ALL THE ERRORS: ", JSON.stringify(graphQLErrors, null, 4));
        graphQLErrors.map((err) => {
            const { message, locations, path } = err;
            console.log(
                `[GraphQL error]:
          Message: ${message},
          Location: ${JSON.stringify(locations, null, 4)},
          Path: ${path}`
                // \nFull Error: ${JSON.stringify(err, null, 4)}\n\n
            );
        });
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
});
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
