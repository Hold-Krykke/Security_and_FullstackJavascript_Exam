import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Card from "../components/Card";
import colors from "../constants/colors";
import Input from "../components/Input";
import facade from "../facade";
import { useQuery, useLazyQuery } from "@apollo/react-hooks";
import { GET_USER } from "../facade";

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
  const [getUser, { loading, error, data }] = useLazyQuery(GET_USER);

  if (loading)
    return (
      <>
        <View>
          <Text>Loading...</Text>
        </View>
      </>
    );
  if (error) return `Error! ${error}`;
  if (data) {
    console.log(JSON.stringify({ data }, null, 4));
    setUsername(data.getUser.username);
  }
  return (
    <View>
      {username && <Text>{username}</Text>}
      <Button onPress={() => getUser({ variables: { username: "Johnny" } })}>
        Click me!
      </Button>
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
