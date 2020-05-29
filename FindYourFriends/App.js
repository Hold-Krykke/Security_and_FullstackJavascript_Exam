import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";
import Header from "./components/Header";
import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import CreateUserScreen from "./screens/CreateUserScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloProvider } from "@apollo/react-hooks";
import client from "./utils/ApolloClientProvider";
import { backendUri } from "./settings";
import UserScreen from "./screens/UserScreen";

export default function App() {
  const [test, setTest] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [firstLogin, setFirstLogin] = useState(false);
  const [user, setUser] = useState({ email: "", username: "" });
  const [username, setUsername] = useState("");

  let content = <HomeScreen setTest={setTest} />;
  // let content = <CreateUserScreen />;
  if (test) {
    //content = <MapScreen test={test} />
    content = (
      <LoginScreen
        backendURL={backendUri}
        setSignedIn={setSignedIn}
        setTest={setTest}
        user={user}
        setUser={setUser}
        setFirstLogin={setFirstLogin}
      />
    );
  }
  if (signedIn) {
    content = (
      <UserScreen
        setSignedIn={setSignedIn}
        visible={firstLogin}
        user={user}
        setUser={setUser}
        username={username}
        setUsername={setUsername}
        showModal={setFirstLogin}
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
