import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Button,
} from "react-native";
import Card from "../components/Card";
import colors from "../constants/colors";
import Input from "../components/Input";
import facade from "../facade";
import * as Linking from "expo-linking";

const backendURL = "http://85270f5f.ngrok.io";
/**
 * Google Login SSO - IMPLICIT FLOW
 *
 * What we want to eventually implement is a SERVER FLOW. https://developers.google.com/identity/protocols/oauth2/openid-connect
 *
 * Documentation for Google Login https://docs.expo.io/versions/latest/sdk/google/
 * When we want to add backend, read here: https://docs.expo.io/versions/latest/sdk/google/#server-side-apis
 */

const ClientID =
  "848374281346-g9rmruc01l44mj46q2ftgtvm0e5ol7t1.apps.googleUsercontent.com";

const LoginScreen = (props) => {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState({
    id: "",
    name: "",
    givenName: "",
    familyName: "",
    photoUrl: "",
    email: "",
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.screen}>
        <Card style={styles.container}>
          {signedIn ? (
            <LoggedInPage name={user.name} photoUrl={user.photoUrl} />
          ) : (
            <LoginPage />
          )}
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
};

const LoginPage = (props) => {
  return (
    <View>
      <Text style={styles.title}>Sign In With Google</Text>
      <Button
        title="Sign in with Google"
        onPress={() => {
          Linking.openURL(`${backendURL}/auth/google`);
        }}
      />
    </View>
  );
};

const LoggedInPage = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome:{props.name}</Text>
      <Image style={styles.image} source={{ uri: props.photoUrl }} />
    </View>
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
  image: {
    marginTop: 15,
    width: 150,
    height: 150,
    borderColor: "rgba(0,0,0,0.2)",
    borderWidth: 3,
    borderRadius: 150,
  },
});

export default LoginScreen;
