import React, { useState, useEffect } from "react";
import { StyleSheet, View, Alert, Button } from "react-native";
import Header from "./components/Header";
//import HomeScreen from "./screens/HomeScreen";
import MapScreen from "./screens/MapScreen";
import LoginScreen from "./screens/LoginScreen";
import CreateUserScreen from "./screens/CreateUserScreen";
import ChatScreen from "./screens/ChatScreen";
import { ApolloProvider } from "@apollo/react-hooks";
import client from "./utils/ApolloClientProvider";
import { backendUri } from "./settings";

export default function App() {
    // USE SCREENS LIKE THIS
    //const [test, setTest] = useState(false);
    const [signedIn, setSignedIn] = useState(false);
    const [create, setCreate] = useState(false);

    let content = <LoginScreen
        backendURL={backendUri}
        signedIn={signedIn}
        setSignedIn={setSignedIn}
        create={create}
        setCreate={setCreate}
    />;
    if (create) {
        //content = <MapScreen test={test} />
        content = <CreateUserScreen />;
    }

    return (
        <ApolloProvider client={client}>
            <View style={styles.screen}>
                <Header title="Find Your Friends" />
                {content}
            </View>
        </ApolloProvider>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
});
