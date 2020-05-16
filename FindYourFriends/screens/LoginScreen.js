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

const ClientID =
  "848374281346-g9rmruc01l44mj46q2ftgtvm0e5ol7t1.apps.googleusercontent.com";

const LoginScreen = (props) => {
  const [signedIn, setSignedIn] = useState(false);
  const [user, setUser] = useState({});

  const signIn = async () => {
    try {
      const config = {
        clientId: ClientID,
        scopes: ["profile", "email"],
      };
      // First- obtain access token from Expo's Google API
      const result = await Google.logInAsync(config);
      const { type, accessToken, user } = result;

      if (type === "success") {
        // Then you can use the Google REST API
        let userInfoResponse = await fetch(
          "https://www.googleapis.com/userinfo/v2/me",
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log("User Info Response: ", userInfoResponse);
        console.log();
        console.log("User: ", user);
        console.log();

        setSignedIn(true);
        setUser({
          ...user,
        });
      } else {
        console.log("cancelled");
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
            <LoggedInPage name={user.name} photoUrl={user.photoUrl} />
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
