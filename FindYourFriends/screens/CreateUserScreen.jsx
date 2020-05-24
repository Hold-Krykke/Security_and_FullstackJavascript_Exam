import React, { useState } from "react";
import { View, Button, StyleSheet, Modal, Text, Alert, ScrollView, KeyboardAvoidingView } from "react-native";
import Input from "../components/Input";
import facade from "../facade";
import { useMutation } from "@apollo/react-hooks";

const CreateUser = (props) => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [addUser, { data }] = useMutation(facade.ADD_USER);

  function handleUsernameInput(value) {
    newUser.username = value;
    setNewUser({ ...newUser });
  }
  function handleEmailInput(value) {
    newUser.email = value;
    setNewUser({ ...newUser });
  }
  function handlePasswordInput(value) {
    newUser.password = value;
    setNewUser({ ...newUser });
  }
  function handlePassword2Input(value) {
    newUser.password2 = value;
    setNewUser({ ...newUser });
  }

  async function confirmCreate() {
    if (newUser.password != newUser.password2) {
      Alert.alert("You're actually a retard");
      newUser.password = "xyz";
      newUser.password2 = "abc";
      setNewUser({ ...newUser });
      return;
    }
    await addUser({
      variables: {
        input: {
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
        },
      },
    });
    console.log("Created new user");
    setNewUser({});
  }

  return (
    <ScrollView>
      <View style={styles.inputContainer}>
        <View style={{paddingBottom: "17%"}}></View>
        <Text>USERNAME</Text>
        <Input style={{ width: "60%" }} onChangeText={handleUsernameInput} name="username" value={newUser.username}></Input>
        <Text>EMAIL</Text>
        <Input style={{ width: "60%" }} onChangeText={handleEmailInput} name="email" keyboardType="email-address" value={newUser.email}></Input>
        <Text>PASSWORD</Text>
        <Input style={{ width: "60%" }} onChangeText={handlePasswordInput} name="password" secureTextEntry={true} value={newUser.password}></Input>
        <Text>RETYPE PASSWORD</Text>
        <Input style={{ width: "60%" }} onChangeText={handlePassword2Input} name="password2" secureTextEntry={true} value={newUser.password2}></Input>
        <Button onPress={confirmCreate} title="CREATE" />
        <View style={{paddingBottom: "100%"}}></View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttons: {
    flexDirection: "row",
    padding: 5,
    justifyContent: "center",
  },
});

export default CreateUser;
