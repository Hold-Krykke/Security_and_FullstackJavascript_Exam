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
import * as Google from "expo-google-app-auth";

/**
 * Google Login SSO
 * Documentation for Google Login https://docs.expo.io/versions/latest/sdk/google/
 * When we want to add backend, read here: https://docs.expo.io/versions/latest/sdk/google/#server-side-apis
 */

const ClientID =
  "848374281346-g9rmruc01l44mj46q2ftgtvm0e5ol7t1.apps.googleUsercontent.com";

const LoginScreen = (props) => {
  const [signedIn, setSignedIn] = useState(false);
  const [googleUser, setgoogleUser] = useState({
    id: "",
    name: "",
    givenName: "",
    familyName: "",
    photoUrl: "",
    email: "",
  });
  const [loginResult, setLoginResult] = useState({
    type: "cancel",
    accessToken: "",
    idToken: "",
    refreshToken: "",
    googleUser: {
      id: "",
      name: "",
      givenName: "",
      familyName: "",
      photoUrl: "",
      email: "",
    },
  });

  const signIn = async () => {
    try {
      const config = {
        clientId: ClientID,
        scopes: ["profile", "email"],
        // redirectUrl: string | undefined	// Defaults to ${AppAuth.OAuthRedirect}:/oauth2redirect/google. Optionally you can define your own redirect URL, just make sure to see the note below.
        // Note on redirectUrl: If you choose to provide your own redirectUrl, it should start with the value returned by AppAuth.OAuthRedirect. This way, the method will function correctly and consistently whether you are testing in the Expo Client or as a standalone app.
      };
      // First- obtain access token from Expo's Google API
      const loginResult = await Google.logInAsync(config); // Returns Promise<LogInResult>
      const { type, accessToken, idToken, refreshToken, user } = loginResult;

      if (type === "success") {
        // Then you can use the Google REST API
        let googleUserInfoResponse = await fetch(
          "https://www.googleapis.com/googleUserinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(
          JSON.stringify({
            googleUserInfoResponse,
            "Google User": user,
            loginResult,
          })
        );
        setgoogleUser({
          ...user,
        });
        setLoginResult(loginResult);
        setSignedIn(true);
      } else {
        console.log("User cancelled login");
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.screen}>
        <Card style={styles.container}>
          {signedIn ? (
            <LoggedInPage
              name={googleUser.name}
              photoUrl={googleUser.photoUrl}
            />
          ) : (
            <LoginPage signIn={signIn} />
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
      <Button title="Sign in with Google" onPress={props.signIn} />
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
