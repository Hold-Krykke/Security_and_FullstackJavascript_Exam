import React, { useState } from "react";
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
import LoginCard from "../components/LoginCard";
import colors from "../constants/colors";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";
import jwt_decode from "jwt-decode"; // https://www.npmjs.com/package/jwt-decode
import * as SecureStore from "expo-secure-store";

const secureStoreKey = "token";

const LoginScreen = ({ signedIn, setSignedIn, setTest, backendURL }) => {
  const [user, setUser] = useState({ email: "", token: "" });
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    try {
      let redirectUrl = await Linking.getInitialURL();
      let authUrl = `${backendURL}/auth/google?redirecturl=${redirectUrl}`;
      let result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if ((result.type = "success")) {
        const token = result.url.split("token=")[1];
        console.log("GOOGLE LOGIN TOKEN\n", JSON.stringify({ token }, null, 4));
        await SecureStore.setItemAsync(secureStoreKey, token);
        const decoded = jwt_decode(token);
        user.email = decoded.useremail;
        user.token = token;
        setUser(user);
        console.log("user", user);
        setSignedIn(true);
      } else {
        console.log("User Cancelled.");
      }
    } catch (error) {
      console.log(error);
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
    user.email = res.useremail;
    user.token = res.token;
    await SecureStore.setItemAsync(secureStoreKey, res.token);
    setUser(user);
    console.log(res);
    setSignedIn(true);
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
        <Button title="Log out" onPress={() => props.setSignedIn(false)} />
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
