import React, { useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  Text,
  Alert,
  ScrollView
} from "react-native";
import Input from "../components/Input";
import facade from "../facade";
import { useMutation } from "@apollo/react-hooks";
import badPasswords from "../utils/badPasswords";
let badPasswordsArray = badPasswords.split("\n");

const CreateUser = (props) => {
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [addUser, { }] = useMutation(facade.ADD_USER);

  // Sadly the value passed to the function in onChangeText is only the value of the element (what the user typed)
  // and not an event with more data than just a string. This means that you can't a generic handler
  // that can handle the input of all the input fields since we can't access any id or anything from the event
  // If you find a smarter way to do this, please do optimize it!
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

  // Thanks to this dude for the regex: https://stackoverflow.com/questions/7844359/password-regex-with-min-6-chars-at-least-one-letter-and-one-number-and-may-cont
  function checkPwd(str) {
    if (str.length < 10) {
      return "Your password is too short";
    } else if (str.length > 30) {
      return "Your password is too long";
    } else if (str.search(/\d/) == -1) {
      return "Your password must contain a number";
    } else if (str.search(/[a-zA-Z]/) == -1) {
      return "Your password must contain a letter";
    } else if (str.search(/[\!\@\#\$\%\^\=\&\*\(\)\_\+\-]/) == -1) {
      return "Your password must contain a symbol";
    } else if (str.search(/[^a-zA-Z0-9\!\@\#\$\%\^\=\&\*\(\)\_\+\-]/) != -1) {
      return "Your password has invalid characters in it";
    }
    return "ok";
  }
  
  async function confirmCreate() {
    // Check if user has provided a username
    if (newUser.username == "") {
      Alert.alert("Please provide a username");
      return;
    }
    // Check if user has provided an email
    if (newUser.email == "") {
      Alert.alert("Please provide an email");
      return;
    }
    // Check if password is empty
    if (newUser.password == "") {
      Alert.alert("Please type a password");
      return;
    }
    // Check if password follows the basic rules
    const passwordCheck = checkPwd(newUser.password);
    if (passwordCheck != "ok") {
      Alert.alert(passwordCheck);
      return;
    }
    // Check if user has typed the same password twice
    if (newUser.password != newUser.password2) {
      Alert.alert("The passwords don't match");
      // We reset the passwords after failed attempts of creating a user
      // One is set to null and one is set to an empty string so the password input fields get cleared
      // but still don't have the same value
      newUser.password = "";
      newUser.password2 = null;
      setNewUser({ ...newUser });
      return;
    }
    // Check if password is on the list of well known bad passwords
    let isBadPassword = false;
    for (let index = 0; index < badPasswordsArray.length; index++) {
      const password = badPasswordsArray[index];
      if (newUser.password.includes(password)) {
        isBadPassword = true;
        break;
      }
    }
    if (isBadPassword) {
      Alert.alert("Your password is too weak");
      return;
    }
    // If everything is okay then we add the user
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
    Alert.alert("User successfully created");
  }

  return (
    <ScrollView>
      <View style={styles.inputContainer}>
        <View style={{ paddingBottom: "7%" }}></View>
        <Text style={{ fontSize: 24 }}>Create User</Text>
        <View style={{ paddingBottom: "17%" }}></View>
        <Text>USERNAME</Text>
        <Input
          style={{ width: "60%" }}
          onChangeText={handleUsernameInput}
          name="username"
          value={newUser.username}
        ></Input>
        <Text>EMAIL</Text>
        <Input
          style={{ width: "60%" }}
          onChangeText={handleEmailInput}
          name="email"
          keyboardType="email-address"
          value={newUser.email}
        ></Input>
        <Text>PASSWORD</Text>
        <Input
          style={{ width: "60%" }}
          onChangeText={handlePasswordInput}
          name="password"
          secureTextEntry={true}
          value={newUser.password}
        ></Input>
        <Text>RETYPE PASSWORD</Text>
        <Input
          style={{ width: "60%" }}
          onChangeText={handlePassword2Input}
          name="password2"
          secureTextEntry={true}
          value={newUser.password2}
        ></Input>
        <Button onPress={confirmCreate} title="CREATE" />
        <View style={{ paddingBottom: "70%" }}></View>
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
});

export default CreateUser;
