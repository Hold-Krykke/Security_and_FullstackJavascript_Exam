import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "@apollo/react-hooks";
import { onError } from "apollo-link-error";

export default function App() {
  // USE SCREENS LIKE THIS
  const [test, setTest] = useState(true);

  const backendUri = "https://localhost:3000/graphql";

  const getToken = () => {
    return "FAKE TOKEN";
  };

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

  const client = new ApolloClient({
    uri: backendUri,
    link: errorLink.concat(authLink),
  });

  let content = <HomeScreen setTest={setTest} />;
  if (test) {
    content = <LoginScreen />;
    //content = <MapScreen test={test} />
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
