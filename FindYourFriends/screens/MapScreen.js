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
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import handleError from "../utils/ErrorHandler"
import MyAlert from "../utils/MakeAlert"

const MapScreen = (props) => {

  const [updatePosition, { loading, error, data, called }] = useMutation(
    facade.UPDATE_POSITION
  );
  // Bad names, should be changed
  const [nearbyUsers, { loading2, error2, data2, called2 }] = useMutation(facade.NEARBY_USERS);

  // Example of how to use nearbyUsers
  async function getNearbyUsers() {
    await nearbyUsers({
      variables: {
        username: "name",
        coordinates: {
          lon: 12.57,
          lat: 55.66
        },
        distance: 5000
      }
    });
  }

  // Will give an array that looks like this:
  /*
  {
    "data": {
      "getNearbyUsers": [
        {
          "username": "Johnny",
          "lon": 12.13,
          "lat": 55.75
        },
        {
          "username": "George",
          "lon": 12.13,
          "lat": 55.7677
        },
        {
          "username": "Jenny",
          "lon": 12.13,
          "lat": 55.77
        }
      ]
    }
  }
  */


  // Example of how to use updatePosition
  async function updateMyPosition() {
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
          <UserInfo />
        </Card>
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

const UserInfo = () => {
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
