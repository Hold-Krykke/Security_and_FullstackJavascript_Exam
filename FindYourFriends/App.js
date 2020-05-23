import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "@apollo/react-hooks";
import { authLink, errorLink, httpLink } from "./utils/links";
import { createHttpLink } from "apollo-link-http";

export default function App() {
  // USE SCREENS LIKE THIS
  const [test, setTest] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  const backendUri = "http://c4c25ff2.ngrok.io";
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

  let content = <HomeScreen setTest={setTest} />;
  if (test) {
    //content = <MapScreen test={test} />
    content = (
      <LoginScreen
        backendURL={backendUri}
        signedIn={signedIn}
        setSignedIn={setSignedIn}
        setTest={setTest}
      />
    );
  }

  return (
    <ApolloProvider client={client}>
      <View style={styles.screen}>
        <Header title="Find Your Friends" />
        {content}
      </View>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
