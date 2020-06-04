import React, { useState, useEffect } from "react";
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  Button
} from "react-native";
import Card from "../components/Card";
import colors from "../constants/colors";
import Input from "../components/Input";
import facade from "../facade";
import useMutation from "@apollo/react-hooks";

const MapScreen = (props) => {

  const [updatePosition, { loading, error, data, called }] = useMutation(
    facade.UPDATE_POSITION
  );

  // Example of how to use the hook
  async function updateMyPosition(){
    await updatePosition({
      variables: {
        username: "name",
        coordinates: {
          lon: 12.57,
          lat: 55.66
        }
      }
    });
  }

  // Will return data with the following structure:
  /*
    {
      "data": {
        "updatePosition": {
          "lastUpdated": "2020-06-04T16:17:31.656Z",
          "username": "name",
          "location": {
            "coordinates": [
              12.55,
              55.55
            ]
          }
        }
      }
    }
    So to access the username, you should be able to use: data.updatePosition.username
    To access longitude: data.updatePosition.location.coordinates[0]
  */

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.screen}>
        <Card style={styles.container}>
          <Text style={styles.title}>This is MapScreen</Text>
        </Card>
        <Card style={styles.container}>
          <Text style={styles.text}>This should be a map</Text>
        </Card>
        <Button
          color={colors.secondary}
          title="TAKE ME BACK"
          onPress={() => props.navigation.goBack()}
        />
      </View>
    </TouchableWithoutFeedback>
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
    color: colors.primary,
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  text: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 20,
  },
  container: {
    width: 300,
    maxWidth: "80%",
    alignItems: "center",
  },
  mapStyle: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});

export default MapScreen;
