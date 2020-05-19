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
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";

const backendURL = "https://87a26532.ngrok.io";
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
  const [redirectData, setRedirectData] = useState();
  const [result, setResult] = useState();

  const handleGoogleLogin = async () => {
    try {
      let result = await WebBrowser.openAuthSessionAsync(
        `${backendURL}/auth/google`, //?authToken=${Linking.makeUrl("/")
        "exp://192.168.1.10:19000"
      );
      if (result.url) {
        const redirectData_ = Linking.parse(result.url);
        setRedirectData({ redirectData_ });
      }
      console.log({ result, redirectData });
      setResult({ result });
      setSignedIn(true);
    } catch (error) {
      console.log(error);
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
              name={user.name}
              photoUrl={user.photoUrl}
              data={redirectData}
              result={result}
            />
          ) : (
            <LoginPage googleLoginHandler={handleGoogleLogin} />
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
      <Button title="Sign in with Google" onPress={props.googleLoginHandler} />
    </View>
  );
};

const LoggedInPage = (props) => {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Welcome:{props.name}</Text>
      <Image style={styles.image} source={{ uri: props.photoUrl }} /> */}
      <Image
        style={styles.image}
        source={{ uri: "https://i.imgur.com/x9XtMsh.jpg" }}
      />
      <Text>data: {JSON.stringify(props.data, null, 4)}</Text>
      <Text>Result: {JSON.stringify(props.result, null, 4)}</Text>
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
