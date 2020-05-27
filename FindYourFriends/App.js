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
import client from "./utils/ApolloClientProvider";
import { createHttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import MakeAlert from "./utils/ErrorHandler";

export default function App() {
  // USE SCREENS LIKE THIS
  const [test, setTest] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState({
    message: "",
    title: "An Error Occurred",
  });

  let content = <HomeScreen setTest={setTest} setError={setError} />;
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
        <MakeAlert error={error} setError={setError} />
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
