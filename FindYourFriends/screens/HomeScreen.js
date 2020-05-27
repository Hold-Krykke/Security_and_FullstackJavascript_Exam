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
import { useQuery, useLazyQuery } from "@apollo/react-hooks"; // https://www.apollographql.com/docs/react/api/react-hooks/
import handleError from "../utils/ErrorHandler";
import MyAlert from "../utils/MakeAlert";

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
          <UserInfo setTest={props.setTest} />
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
};

const UserInfo = ({ setTest }) => {
  // This is keeping state for us.
  // https://www.apollographql.com/docs/react/api/react-hooks/#uselazyquery
  const [User, { loading, error, data, called }] = useLazyQuery(
    facade.GET_USER,
    {
      fetchPolicy: "network-only",
    }
  ); // https://www.apollographql.com/docs/react/api/react-hooks/#uselazyquery

  let content = (
    <View>
      <Text>Buffer</Text>
    </View>
  );

  if (called && error) {
    const errorMsg = handleError(error);
    console.log(JSON.stringify({ errorMsg }, null, 4));
    MyAlert(errorMsg.message, errorMsg.title);
  }

  if (loading)
    content = (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  if (data) {
    console.log(JSON.stringify({ data }, null, 4));
    content = (
      <View>
        <Text>{JSON.stringify(data.getUser.username, null, 4)}</Text>
      </View>
    );
  }

  return (
    <View>
      <View>
        <Button title="Go to Login" onPress={() => setTest(true)} />
      </View>
      {content}
      <Button
        title="Click me to fetch Johnny!"
        onPress={() => User({ variables: { username: "Johnny" } })}
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
