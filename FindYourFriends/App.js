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

  const backendUri = "http://f94dc486.ngrok.io";
  const httpLink = createHttpLink({ uri: backendUri + "/graphql" });
  const client = new ApolloClient({
    uri: backendUri,
    // httpLink and cache are requirements as of Apollo 2
    link: errorLink.concat(authLink.concat(httpLink)), // Add in when links are made properly // Some kinda apollo middleware. See ./utils/links // https://www.apollographql.com/docs/link/links/error/
    cache: new InMemoryCache(), // automatic caching of requests of the same data // https://www.apollographql.com/docs/angular/basics/caching/
  });

  let content = <HomeScreen setTest={setTest} />;
  if (!test) {
    //content = <MapScreen test={test} />
    content = <LoginScreen signedIn={signedIn} setSignedIn={setSignedIn} />;
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
