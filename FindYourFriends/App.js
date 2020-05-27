import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloProvider } from "@apollo/react-hooks";
import client from "./utils/ApolloClientProvider";
import { backendUri } from "./settings";

export default function App() {
  // USE SCREENS LIKE THIS
  const [test, setTest] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

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
