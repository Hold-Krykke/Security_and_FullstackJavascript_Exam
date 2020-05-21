import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, Image, Button, } from "react-native";
import Card from "../components/Card";
import LoginCard from "../components/LoginCard";
import colors from "../constants/colors";
import Input from "../components/Input";
import facade from "../facade";
import { AuthSession, Linking } from "expo";
import * as WebBrowser from "expo-web-browser";
import jwt_decode from "jwt-decode"; // https://www.npmjs.com/package/jwt-decode
/*
  We dont verify token here. 
  We have to verify it on the backend on every request. 
*/

const backendURL = 'http://177f1c87.ngrok.io';
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
    const [user, setUser] = useState({ email: '' });
    const [userEmail, setUserEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleGoogleLogin = async () => {
        try {
            let redirectUrl = await Linking.getInitialURL()
            let authUrl = `${backendURL}/auth/google?redirecturl=${redirectUrl}`
            let result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

            if ((result.type = "success")) {
                const token = result.url.split("token=")[1];
                const decoded = jwt_decode(token);
                user.email = decoded.useremail
                setUser(user);
                console.log('user', user)
                setSignedIn(true);
            } else {
                console.log("User Cancelled.");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleUserLogin = async () => {
        console.log(userEmail)
        console.log(password)
        //const res = await fetch(`${backendURL}/auth/jwt?`, request).then(res => res.json());

        const request = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: userEmail, password: password })
        };
        const res = await fetch(`${backendURL}/auth/jwt?`, request).then(res => res.json());
        console.log(res)
    }

    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} >
            <View style={styles.screen}>
                {signedIn ?
                    (<LoggedInPage email={user.email} />)
                    : (<LoginCard googleLoginHandler={handleGoogleLogin}
                        userLoginHandler={handleUserLogin}
                        setPassword={setPassword}
                        setUserEmail={setUserEmail}
                        userEmail={userEmail}
                        password={password} />)}
            </View>
        </TouchableWithoutFeedback>
    );
};


// This should be removed, is only temporarily here untill MapScreen is ready
const LoggedInPage = (props) => {
    return (
        <Card style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome!</Text>
                <Text style={styles.text}>{props.email}</Text>
            </View>
        </Card >
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
    text: {
        color: colors.grey,
        fontSize: 14,
        fontWeight: "bold",
        marginVertical: 10,
        textAlign: "center"

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
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    button: {
        width: 80,
    },
});

export default LoginScreen;