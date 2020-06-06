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
  ScrollView,
  KeyboardAvoidingView,
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
  logout,
}) => {
  const [registerOAuthUser, { loading, error, data, called }] = useMutation(
    facade.UPDATE_USERNAME_OF_OAUTHUSER
  );

  useEffect(() => {
    async function saveNewToken() {
      if (data) {
        if (data.registerOAuthUser != "") {
          await SecureStore.setItemAsync(
            secureStoreKey,
            data.registerOAuthUser
          );
        } else {
          Alert("Could not save new username", "Error");
        }
      }
    }
    saveNewToken();
  }, [data]);

  const userInputHandler = (inputText) => {
    setUsername(inputText);
  };

  const confirmUsername = async () => {
    try {
      if (!username) {
        Alert("Please type a valid username", "Missing input");
        return;
      }
      await registerOAuthUser({
        variables: {
          username: username,
        },
      });
      let temp = {...user};
      temp.username = username;
      setUser({ ...temp });
      showModal(false);
    } catch (err) {
      const errorMsg = handleError(err);
      Alert(errorMsg.message, errorMsg.title);
    }
  };

  const skipUsername = async () => {
    try {
      await registerOAuthUser({
        variables: {
          username: user.email,
        },
      });
      let temp = {...user};
      temp.username = user.email;
      setUser({ ...temp });
      showModal(false);
    } catch (err) {
      const errorMsg = handleError(err);
      Alert(errorMsg.message, errorMsg.title);
    }
  };

  return (
    <ScrollView scrollToOverflowEnabled={true} style={styles.scrollView}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.screen}>
            <Card style={styles.container}>
              <Modal visible={visible} animationType="slide">
                <View style={styles.screen}>
                  <View style={{ paddingTop: "12%" }}></View>
                  <Card style={styles.container}>
                    <View style={{ height: "10%" }}>
                      {loading && <ActivityIndicator />}
                    </View>
                    <Text style={styles.title}>Choose a Username</Text>
                    <Input
                      style={styles.input}
                      value={username}
                      placeholder="USERNAME"
                      onChangeText={(input) => {
                        userInputHandler(input);
                      }}
                    ></Input>
                    <View style={styles.button}>
                      <Button
                        title="Confirm"
                        color={colors.primary}
                        style={styles.button}
                        onPress={confirmUsername}
                      />
                    </View>
                    <View style={styles.button}>
                      <Button
                        title="Skip"
                        color={colors.grey}
                        style={styles.button}
                        onPress={skipUsername}
                      />
                    </View>
                    <View style={styles.warningTextContainer}>
                      <Text style={styles.text}>
                        Your username will be shown in the application. If you
                        skip this then your email will be used as your username,
                        which is public to other users.
                      </Text>
                    </View>
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
                  onPress={async () => logout(navigation)}
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
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </ScrollView>
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
  input: {
    width: "50%",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  button: {
    width: 110,
    marginVertical: 10,
  },
  warningTextContainer: {
    width: 300,
    maxWidth: "80%",
    alignItems: "center",
    marginTop: 20,
  },
});

export default UserScreen;
