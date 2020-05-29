import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
} from "react-native";
import Card from "../components/Card";
import LoginCard from "../components/LoginCard";
import colors from "../constants/colors";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";
import jwt_decode from "jwt-decode"; // https://www.npmjs.com/package/jwt-decode
import * as SecureStore from "expo-secure-store";
import MyAlert from "../utils/MakeAlert";

// The key for Secure Store. Use this key, to fetch token again.
const secureStoreKey = "token";

const LoginScreen = ({
  signedIn,
  setSignedIn,
  setTest,
  backendURL,
  setError,
}) => {
  const [user, setUser] = useState({ email: "" });
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * If there is a JWT in SecureStore from previous login and app-use.
   * Maybe implement something similar in App.js?
   * Right now this is only run on mount of LoginScreen,
   * but that's not a problem, if this is the first screen user sees.
   */
  useEffect(() => {
    const checkIfLoggedIn = async () => {
      const token = await SecureStore.getItemAsync(secureStoreKey);
      if (token) {
        const decoded = jwt_decode(token);
        const temp_user = { email: decoded.useremail };
        setUser({ ...temp_user });
        console.log(JSON.stringify({ temp_user }, null, 4));
        setSignedIn(true);
      }
    };
    checkIfLoggedIn();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      let redirectUrl = await Linking.getInitialURL();
      let authUrl = `${backendURL}/auth/google?redirecturl=${redirectUrl}`;
      let result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type == "success") {
        // The .slice(0, -1) is to remove a false # thats at then end, for some reason.
        const token = result.url.split("token=")[1].slice(0, -1);
        //console.log("GOOGLE LOGIN TOKEN\n", JSON.stringify({ token }, null, 4));
        await SecureStore.setItemAsync(secureStoreKey, token);
        const decoded = jwt_decode(token);
        user.email = decoded.useremail;
        user.username = decoded.username;
        setUser(user);
        console.log("user", user);
        setSignedIn(true);
      } else if (result.type == "cancel") {
        // If the user closed the web browser, the Promise resolves with { type: 'cancel' }.
        // If the user does not permit the application to authenticate with the given url, the Promise resolved with { type: 'cancel' }.
        console.log("User Cancelled.");
      } else if (result.type == "dismiss") {
        // If the browser is closed using dismissBrowser, the Promise resolves with { type: 'dismiss' }.
        console.log("User dismissed the browser.");
      }
    } catch (error) {
      console.log(error);
      MyAlert(error); // This needs to be finetuned, to send something more specific. We do not wish to hand everything to the User.
    }
  };

  const handleUserLogin = async () => {
    const request = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ useremail: userEmail, password: password }),
    };
    const res = await fetch(`${backendURL}/auth/jwt?`, request).then((res) =>
      res.json()
    );
    if (
      res.useremail &&
      res.token
      // && (typeof res.token === String || res.token instanceof String)
    ) {
      user.email = res.useremail;
      user.username = res.username;
      console.log("User", user);
      await SecureStore.setItemAsync(secureStoreKey, res.token);
      setUser(user);
      // console.log(JSON.stringify({ res }, null, 4));
      setSignedIn(true);
    } else {
      console.log(
        "Something went wrong while logging in:\n",
        JSON.stringify({ res }, null, 4)
      );
      MyAlert("Wrong username or password!", "Login Error!");
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.screen}>
        {signedIn ? (
          <LoggedInPage email={user.email} setSignedIn={setSignedIn} />
        ) : (
          <LoginCard
            googleLoginHandler={handleGoogleLogin}
            userLoginHandler={handleUserLogin}
            setPassword={setPassword}
            setUserEmail={setUserEmail}
            userEmail={userEmail}
            password={password}
          />
        )}
        <Button title="Go to HomeScreen" onPress={() => setTest(false)} />
      </View>
    </TouchableWithoutFeedback>
  );
};

// This should be removed, is only temporarily here untill MapScreen is ready
const LoggedInPage = (props) => {
  return (
    <Card style={styles.container}>
      <View style={styles.container}>
        {/* 
        Upon Logout, be sure to set both the SignedIn state, 
        But also remove the Token from the SecureStore. 
        */}
        <Button
          title="Log out"
          onPress={async () => {
            props.setSignedIn(false);
            await SecureStore.deleteItemAsync(secureStoreKey);
          }}
        />
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.text}>{props.email}</Text>
      </View>
    </Card>
  );
};
////////////////////////////////////////////////////////////////////////////

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
  text: {
    color: colors.grey,
    fontSize: 14,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
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
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  button: {
    width: 80,
  },
});

export default LoginScreen;
