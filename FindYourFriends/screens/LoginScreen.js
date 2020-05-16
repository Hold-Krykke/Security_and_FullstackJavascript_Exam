import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Card from "../components/Card";
import colors from "../constants/colors";
import Input from "../components/Input";
import facade from "../facade";

const ClientID = "6c1763eb62e5cabb9ebe";
// Endpoint
const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint:
    "https://github.com/settings/connections/applications/<CLIENT_ID>",
};
// Request
const [request, response, promptAsync] = useAuthRequest(
  {
    clientId: "CLIENT_ID",
    scopes: ["identity"],
    // For usage in managed apps using the proxy
    redirectUri: makeRedirectUri({
      // For usage in bare and standalone
      native: "your.app://redirect",
    }),
  },
  discovery
);

const LoginScreen = (props) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.screen}>
        <Card style={styles.container}>
          <Text style={styles.title}>This is LoginScreen</Text>
          <Input style={styles.input} placeholder="Placeholder" />
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  title: {
    color: colors.secondary,
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  container: {
    width: 300,
    maxWidth: "80%",
    alignItems: "center",
  },
  input: {
    width: 100,
    textAlign: "center",
  },
});

export default LoginScreen;
