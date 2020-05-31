import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";
import Header from "./components/Header";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import CreateUserScreen from "./screens/CreateUserScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloProvider } from "@apollo/react-hooks";
import client from "./utils/ApolloClientProvider";
import { SERVER_URL } from "./constants/settings";
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export default function App() {
    const [signedIn, setSignedIn] = useState(false);

    const Stack = createStackNavigator();

    return (
        <ApolloProvider client={client}>
            <View style={styles.screen}>
                <Header title="Find Your Friends" />
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="LoginScreen">
                            {props => <LoginScreen {...props}
                                backendURL={SERVER_URL}
                                signedIn={signedIn}
                                setSignedIn={setSignedIn}
                            />}
                        </Stack.Screen>
                        <Stack.Screen name="CreateUserScreen">{props => <CreateUserScreen {...props} />}</Stack.Screen>
                        <Stack.Screen name="MapScreen">{props => <CreateUserScreen {...props} />}</Stack.Screen>
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
