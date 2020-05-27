import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "@apollo/react-hooks";
import authLink from "./utils/links";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";

export default function App() {
  // USE SCREENS LIKE THIS
  const [test, setTest] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState({
    message: null,
    title: "An Error Occurred",
  });

  const backendUri = "http://cdccc558.ngrok.io";
  /**
   * Put logic here, on how to handle errors.
   * This handles all GraphQL errors.
   * It was not my intention to put this here. I wanted it to be in utils/links.
   * But I couldn't figure out how to get setError to utils/links.
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
          // Unauthenticated Error from backend.
          // Add logic here like "If not authenticated, send to login-page"
          // And set errorMessage to user via setError,
          // that they tried something that required login, but they weren't logged in
          setError({ message, title: "Unauthenticated." });
        } else if (err.extensions.code == "FORBIDDEN") {
          // ForbiddenError from backend.
          // Should probably also send to login.
          setError({
            message: `You have to be logged in to do that.\n${message}`,
            title: "Unauthorized action.",
          });
        } else {
          // Open Alert box with message.
          setError({ ...error, message });
        }
      });
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });
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

  /**
   * Errorhandling Alert.
   * Tapping any button will fire the respective onPress callback and dismiss the alert.
   * @param {string} error Text describing the error that occurred.
   * @param {string} title The Title for the Error Alert. Default "An Error Occurred"
   * @param {string} buttonText The text on the button. Default "OK"
   */
  const MyAlert = (error, title = "An Error Occurred", buttonText = "OK") =>
    // static alert(title, message?, buttons?, options?)
    Alert.alert(
      title,
      error,
      [
        {
          text: buttonText,
          onPress: () => {
            console.log(JSON.stringify({ error }, null, 4));
            setError({ message: null, title: "An Error Occurred" });
            console.log(`${buttonText} pressed on Error Alert.`);
          },
        },
      ],
      { cancelable: false } // If false, you can only dismiss via the onPress. If True, you can dismiss by pressing outside the alert.
    );

  let content = <HomeScreen setTest={setTest} />;
  if (test) {
    //content = <MapScreen test={test} />
    content = (
      <LoginScreen
        setError={setError}
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
        {error.message && MyAlert(error.message, error.title)}
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
