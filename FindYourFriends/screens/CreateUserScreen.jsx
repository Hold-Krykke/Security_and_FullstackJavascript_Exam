import React, { useState } from "react";
import { View, Button, StyleSheet, Modal, Text } from "react-native";
import Input from "../components/Input";
import { ADD_USER } from "../facade";
import { useMutation } from "@apollo/react-hooks";

const CreateUser = (props) => {
  const [newUser, setNewUser] = useState({username: "createTest", email: "create@test.com", password: "create"});
  const [addUser, {data}] = useMutation(ADD_USER);

  function handleInput() {
      
  }

  function confirmCreate() {
    addUser(newUser);
    console.log("Created new user");
  }

  return (
    <View style={styles.inputContainer}>
      <Text>USERNAME</Text>
      <Input style={{ width: "60%" }}></Input>
      <Text>EMAIL</Text>
      <Input style={{ width: "60%" }}></Input>
      <Text>PASSWORD</Text>
      <Input style={{ width: "60%" }}></Input>
      <Text>RETYPE PASSWORD</Text>
      <Input style={{ width: "60%" }}></Input>
  <Button onPress={confirmCreate} title="CREATE"/>
    </View>
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
