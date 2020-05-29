import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";
import Header from "./components/Header";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import CreateUserScreen from "./screens/CreateUserScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloProvider } from "@apollo/react-hooks";
import client from "./utils/ApolloClientProvider";
import { backendUri } from "./settings";
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

export default function App() {
    // USE SCREENS LIKE THIS
    //const [test, setTest] = useState(false);
    const [signedIn, setSignedIn] = useState(false);
    const [create, setCreate] = useState(false);

    const Stack = createStackNavigator();

    useEffect(() => {

    }, []);


    let content = <LoginScreen
        backendURL={backendUri}
        signedIn={signedIn}
        setSignedIn={setSignedIn}
    // create={create}
    // setCreate={setCreate}
    />;
    if (create) {
        //content = <MapScreen test={test} />
        // content = <CreateUserScreen setCreate={setCreate} />;
    }

    return (
        <ApolloProvider client={client}>
            <View style={styles.screen}>
                <Header title="Find Your Friends" />
                <NavigationContainer>
                    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Login">
                            {props => <LoginScreen {...props}
                                backendURL={backendUri}
                                signedIn={signedIn}
                                setSignedIn={setSignedIn}
                                create={create}
                                setCreate={setCreate}
                            />}
                        </Stack.Screen>
                        <Stack.Screen name="CreateUser">{props => <CreateUserScreen {...props} setCreate={setCreate} />}</Stack.Screen>
                    </Stack.Navigator>
                    {/* <View style={styles.screen}>
                    <Header title="Find Your Friends" />
                    {content} */}
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
