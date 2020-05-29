import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  Modal,
  ActivityIndicator
} from "react-native";
import Card from "../components/Card";
import Input from "../components/Input";
import LoginCard from "../components/LoginCard";
import colors from "../constants/colors";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";
import jwt_decode from "jwt-decode"; // https://www.npmjs.com/package/jwt-decode
import * as SecureStore from "expo-secure-store";
import MyAlert from "../utils/MakeAlert";
import facade from "../facade";
import { useMutation } from "@apollo/react-hooks";

// The key for Secure Store. Use this key, to fetch token again.
const secureStoreKey = "token";

const LoginScreen = ({
  signedIn,
  setSignedIn,
  setTest,
  backendURL,
  setError,
}) => {
  const [user, setUser] = useState({ email: "", username: "" });
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstLogin, setFirstLogin] = useState(false);

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
        const temp_user = {
          email: decoded.useremail,
          username: decoded.username,
        };
        setUser({ ...temp_user });
        // console.log(JSON.stringify({ temp_user }, null, 4));
        setSignedIn(true);
      }
    };
    checkIfLoggedIn();
  }, []);

  useEffect(() => {
    // Both checks are necessary
    if (!user.username) {
      setFirstLogin(true);
    };
    if (user.username) {
      setFirstLogin(false);
    }
  },[user]);

  const userInputHandler = (inputText) => {
    setUsername(inputText);
  };

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
        setUser({...user});
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
      res.token
      // && (typeof res.token === String || res.token instanceof String)
    ) {
      const decoded = jwt_decode(res.token);
      user.email = decoded.useremail;
      user.username = decoded.username;
      console.log("User", user);
      await SecureStore.setItemAsync(secureStoreKey, res.token);
      setUser({...user});
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
          <LoggedInPage
            setSignedIn={setSignedIn}
            visible={firstLogin}
            userInputHandler={userInputHandler}
            user={user}
            setUser={setUser}
            username={username}
            showModal={setFirstLogin}
          />
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
  const [registerOAuthUser, { loading, error, data, called }] = useMutation(
    facade.UPDATE_USERNAME_OF_OAUTHUSER
  );
  if (called && error) {
    // const errorMsg = handleError(error);
    MyAlert(error, "Ah shit...");
  }

  const confirmUsername = async () => {
    if (!props.username) {
      MyAlert("Please type a valid username", "Missing input");
      return;
    }
    await registerOAuthUser({
      variables: {
        username: props.username,
      },
    });
    props.user.username = props.username;
    props.setUser({ ...props.user });
    props.showModal(false);
  };

  const skipUsername = async () => {
    await registerOAuthUser({
      variables: {
        username: props.user.email,
      },
    });
    props.user.username = props.user.email;
    props.setUser({ ...props.user });
    props.showModal(false);
  };

  return (
    <Card style={styles.container}>
      <Modal visible={props.visible} animationType="slide">
        <View style={styles.modal}>
          <View style={{ height: "20%" }}>
            {loading && <ActivityIndicator />}
          </View>
          <Text style={styles.title}>Please provide a username</Text>
          <Input
            style={styles.usernameInput}
            value={props.username}
            onChangeText={(input) => {
              props.userInputHandler(input);
            }}
          ></Input>
          <View style={styles.buttonContainer}>
            <Button
              title="Confirm"
              style={styles.button}
              onPress={confirmUsername}
            />
            <Button title="Skip" style={styles.button} onPress={skipUsername} />
          </View>
          <View style={{ height: "20%" }}></View>
          <Text style={{ width: "70%" }}>
            Your username will be shown in the application. If you skip this
            then your email will be used as your username.
          </Text>
        </View>
      </Modal>
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
        <Text style={styles.text}>{props.user.username}</Text>
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
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  usernameInput: {
    width: "60%",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    padding: 5,
    marginBottom: 3,
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
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  button: {
    width: 100,
    padding: 7,
  },
});

export default LoginScreen;
