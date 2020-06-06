import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";
import Header from "./components/Header";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import CreateUserScreen from "./screens/CreateUserScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloProvider } from "@apollo/react-hooks";
import client from "./utils/ApolloClientProvider";
import { SERVER_URL, TOKEN_KEY } from "./constants/settings";
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UserScreen from "./screens/UserScreen";
import * as SecureStore from "expo-secure-store";

export default function App() {
  const [signedIn, setSignedIn] = useState(false);
  const [firstLogin, setFirstLogin] = useState(false);
  const [user, setUser] = useState({ email: "", username: "", location: {lat: 0, lon: 0}});
  const [distance, setDistance] = useState(100000)
  const [username, setUsername] = useState("");

  /**
   * Call this, to log user out. 
   * @params navigation
   */
  const logout = async (navigation) => {
    Promise.all([client.clearStore(), SecureStore.deleteItemAsync(TOKEN_KEY),
    ]).then(() => {
      console.log("User has logged out");
      setUsername("")
      setSignedIn(false);
      navigation.navigate("LoginScreen");
    });
  };

  const Stack = createStackNavigator();
  //console.log('User in app', user);

  return (
    <ApolloProvider client={client}>
      <View style={styles.screen}>
        <Header title="Find Your Friends" />
        <NavigationContainer>
          <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LoginScreen">
              {props => <LoginScreen {...props}
                user={user}
                setUser={setUser}
                backendURL={SERVER_URL}
                setSignedIn={setSignedIn}
                setFirstLogin={setFirstLogin}
                logout={logout}
              />}
            </Stack.Screen>
            <Stack.Screen name="UserScreen">
              {(props) => (<UserScreen {...props}
                logout={logout}
                setSignedIn={setSignedIn}
                user={user}
                setUser={setUser}
                username={username}
                setUsername={setUsername}
                visible={firstLogin}
                showModal={setFirstLogin}
              />
              )}
            </Stack.Screen>
            <Stack.Screen name="CreateUserScreen">{props => <CreateUserScreen {...props} />}</Stack.Screen>
            <Stack.Screen name="MapScreen">{props => <MapScreen {...props} user={user} setUser={setUser} distance={distance} setDistance={setDistance} />}</Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
});
