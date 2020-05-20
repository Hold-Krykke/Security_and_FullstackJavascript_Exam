import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, Image, Button } from "react-native";
import Card from "../components/Card";
import colors from "../constants/colors";
import Input from "../components/Input";
import facade from "../facade";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";
import jwt_decode from "jwt-decode"; // https://www.npmjs.com/package/jwt-decode
import WebViewScreen from "../screens/WebViewScreen";
/*
  We dont verify token here. 
  We have to verify it on the backend on every request. 
*/

const backendURL = 'http://e1e92de2.ngrok.io';
/**
 * Google Login SSO - IMPLICIT FLOW
 *
 * What we want to eventually implement is a SERVER FLOW. https://developers.google.com/identity/protocols/oauth2/openid-connect
 *
 * Documentation for Google Login https://docs.expo.io/versions/latest/sdk/google/
 * When we want to add backend, read here: https://docs.expo.io/versions/latest/sdk/google/#server-side-apis
 */

const LoginScreen = (props) => {
    const [signedIn, setSignedIn] = useState(false);
    const [user, setUser] = useState({
        id: "",
        name: "",
        givenName: "",
        familyName: "",
        photoUrl: "",
        email: "",
    });
    const [loginPressed, setLoginPressed] = useState(false);

    let webview;

    useEffect(() => {
        if (loginPressed) {
            webview = <WebViewScreen />;
        }
    }, [loginPressed]);

    const handleGoogleLogin = async () => {
        try {
            let result = await WebBrowser.openAuthSessionAsync(
                `${backendURL}/auth/google`,
                `https://dr.dk`
            );
            console.log('RESULT', result)
            if ((result.type = "success")) {
                const url = result.url;
                const token = url.split("token=")[1];
                const decoded = jwt_decode(token);
                console.log(decoded);
                setUser({
                    ...user,
                    name: decoded.name,
                    photoUrl: decoded.photoUrl,
                    email: decoded.email,
                });
                setSignedIn(true);
            } else {
                console.log("User Cancelled.");
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleLogin = async () => {
        setLoginPressed(true)
    }

    return (
        <TouchableWithoutFeedback
            onPress={() => {
                Keyboard.dismiss();
            }}
        >
            <View style={styles.screen}>
                <Card style={styles.container}>
                    {signedIn ? (
                        <LoggedInPage name={user.name} photoUrl={user.photoUrl} />
                    ) : (
                            <LoginPage googleLoginHandler={handleLogin} />
                        )}
                </Card>
                {loginPressed && (<WebViewScreen />)}
            </View>
        </TouchableWithoutFeedback >
    );
};

const LoginPage = (props) => {
    return (
        <View>
            <Text style={styles.title}>Sign In With Google</Text>
            <Button title="Sign in with Google" onPress={props.googleLoginHandler} />
        </View>
    );
};

const LoggedInPage = (props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome:{props.name}</Text>
            <Image style={styles.image} source={{ uri: props.photoUrl }} />
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
    image: {
        marginTop: 15,
        width: 150,
        height: 150,
        borderColor: "rgba(0,0,0,0.2)",
        borderWidth: 3,
        borderRadius: 150,
    },
});

export default LoginScreen;
