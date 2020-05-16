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
import Expo from "expo";

const ClientID =
  "848374281346-g9rmruc01l44mj46q2ftgtvm0e5ol7t1.apps.googleusercontent.com";

const LoginScreen = (props) => {
  const [user, setUser] = useState({ signedIn: false, name: "", photoUrl: "" });

  const signIn = async () => {
    try {
      const result = await Expo.Google.logInAsync({
        androidClientId: ClientID,
        //iosClientId: YOUR_CLIENT_ID_HERE,  <-- if you use iOS
        scopes: ["profile", "email"],
      });

      if (result.type === "success") {
        setUser({
          signedIn: true,
          name: result.user.name,
          photoUrl: result.user.photoUrl,
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
          {user.signedIn ? (
            <LoggedInPage name={user.name} photoUrl={user.photoUrl} />
          ) : (
            <LoginPage signIn={signIn} />
          )}
          <Text style={styles.title}>This is LoginScreen</Text>
          <Input style={styles.input} placeholder="Placeholder" />
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
};

const LoginPage = (props) => {
  return (
    <View>
      <Text style={styles.title}>Sign In With Google</Text>
      <Button title="Sign in with Google" onPress={() => props.signIn()} />
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
