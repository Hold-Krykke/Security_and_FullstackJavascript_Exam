import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Button,
  Modal,
  ActivityIndicator,
} from "react-native";
import Card from "../components/Card";
import Input from "../components/Input";
import colors from "../constants/colors";
import handleError from "../utils/ErrorHandler";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";
import jwt_decode from "jwt-decode"; // https://www.npmjs.com/package/jwt-decode
import * as SecureStore from "expo-secure-store";
import Alert from "../utils/MakeAlert";
import facade from "../facade";
import { useMutation } from "@apollo/react-hooks";

const secureStoreKey = "token";

const UserScreen = ({
  visible,
  user,
  setUser,
  username,
  setUsername,
  showModal,
  setSignedIn,
  navigation,
}) => {
  const [registerOAuthUser, { loading, error, data, called }] = useMutation(
    facade.UPDATE_USERNAME_OF_OAUTHUSER
  );

  const userInputHandler = (inputText) => {
    setUsername(inputText);
  };

  if (called && error) {
    const errorMsg = handleError(error);
    Alert(errorMsg.message, errorMsg.title);
  }

  const confirmUsername = async () => {
    if (!username) {
      Alert("Please type a valid username", "Missing input");
      return;
    }
    await registerOAuthUser({
      variables: {
        username: username,
      },
    });
    user.username = username;
    setUser({ ...user });
    showModal(false);
  };

  const skipUsername = async () => {
    await registerOAuthUser({
      variables: {
        username: user.email,
      },
    });
    user.username = user.email;
    setUser({ ...user });
    showModal(false);
  };

  return (
    <View style={styles.screen}>
      <Card style={styles.container}>
        <Modal visible={visible} animationType="slide">
          <View style={styles.screen}>
            <View style={{ paddingTop: "12%" }}></View>
            <Card style={styles.container}>
              <View style={{ height: "10%" }}>
                {loading && <ActivityIndicator />}
              </View>
              <Text style={styles.title}>Please provide a username</Text>
              <Input
                style={styles.usernameInput}
                value={username}
                onChangeText={(input) => {
                  userInputHandler(input);
                }}
              ></Input>
              <View style={styles.buttonContainer}>
                <Button
                  title="Confirm"
                  color={colors.primary}
                  style={styles.button}
                  onPress={confirmUsername}
                />
                <Button
                  title="Skip"
                  color={colors.grey}
                  style={styles.button}
                  onPress={skipUsername}
                />
              </View>
              <View style={{ height: "20%" }}></View>
              <Text style={styles.text}>
                Your username will be shown in the application. If you skip this
                then your email will be used as your username.
              </Text>
            </Card>
          </View>
        </Modal>
        <View style={styles.container}>
          {/* 
        Upon Logout, be sure to set both the SignedIn state
        but also remove the Token from the SecureStore. 
      */}
          <Button
            title="Log out"
            style={styles.button}
            color={colors.primary}
            onPress={async () => {
              await SecureStore.deleteItemAsync(secureStoreKey);
              setSignedIn(false);
              // setUser({ username: "", email: "" });
              setUsername("");
              navigation.navigate("LoginScreen");
            }}
          />
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.text}>{user.username}</Text>
          <Button
            title="Map"
            style={styles.button}
            color={colors.secondary}
            onPress={() => {
              navigation.navigate("MapScreen");
            }}
          />
        </View>
      </Card>
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
  usernameInput: {
    width: "60%",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    padding: 5,
    marginBottom: 3,
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
    width: 80,
    padding: 7,
  },
});

export default UserScreen;
