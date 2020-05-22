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
import colors from "../constants/colors";
import Input from "../components/Input";
import facade from "../facade";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";

const HomeScreen = (props) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.screen}>
        <Card style={styles.container}>
          <Text style={styles.title}>This is HomeScreen</Text>
          <Input style={styles.input} placeholder="Placeholder" />
          <UserInfo />
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
};

const UserInfo = () => {
  const [username, setUsername] = useState("");
  const [User, { loading, error, data }] = useLazyQuery(facade.GET_USER);

  if (loading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  if (error)
    return (
      <View>
        <Text>Error! {JSON.stringify(error, null, 4)}</Text>
      </View>
    );
  if (data) {
    console.log(JSON.stringify({ data }, null, 4));
    setUsername(data.getUser.username);
  }
  return (
    <View>
      <Text>{username && JSON.stringify(username, null, 4)}</Text>
      <Button
        title="Click me!"
        onPress={() => {
          User({ variables: { username: "Johnny" } });
        }}
      ></Button>
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
});

export default HomeScreen;
