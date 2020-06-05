import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView } from "react-native";
import Card from "../components/Card";
import Input from "../components/Input";
import LoginCard from "../components/LoginCard";
import colors from "../constants/colors";
import { Linking } from "expo";
import * as WebBrowser from "expo-web-browser";
import jwt_decode from "jwt-decode"; // https://www.npmjs.com/package/jwt-decode
import * as SecureStore from "expo-secure-store";
import Alert from "../utils/MakeAlert";
import facade from "../facade";
import { useQuery } from "@apollo/react-hooks";
// The key for Secure Store. Use this key, to fetch token again.
const secureStoreKey = "token";

const LoginScreen = ({ navigation, setSignedIn, backendURL, setFirstLogin, user, setUser }) => {
    const [userEmail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const { data, error } = useQuery(facade.CHECK_JWT);

    useEffect(() => {
        async function check() {
            if (data) {
                if (!data.checkToken) {
                    // We need to set the username to something that's not empty because another 
                    // useEffect checks this value and shows the username modal if this value is falsy
                    setUser({ username: "..." });
                    setFirstLogin(false);
                    setSignedIn(false);
                    await SecureStore.deleteItemAsync(secureStoreKey);
                    navigation.navigate("LoginScreen");
                    return;
                }
            }
        }
        check();
    }, [data]);

    /**
     * If there is a JWT in SecureStore from previous login and app-use.
     * Maybe implement something similar in App.js?
     * Right now this is only run on mount of LoginScreen,
     * but that's not a problem, if this is the first screen user sees.
     */
    useEffect(() => {
        const checkIfLoggedIn = async () => {
            const token = await SecureStore.getItemAsync(secureStoreKey);
            if (token) {
                const decoded = jwt_decode(token);
                const temp_user = {
                    email: decoded.useremail,
                    username: decoded.username,
                };
                setUser({ ...temp_user });
                // console.log(JSON.stringify({ temp_user }, null, 4));
                setSignedIn(true);
                navigation.navigate("UserScreen");
            }
        };
        checkIfLoggedIn();
    }, []);

    useEffect(() => {
        // Both checks are necessary
        if (!user.username) {
            setFirstLogin(true);
        }
        if (user.username) {
            setFirstLogin(false);
        }
    }, [user]);

    const handleGoogleLogin = async () => {
        try {
            let redirectUrl = await Linking.getInitialURL();
            let authUrl = `${backendURL}/auth/google?redirecturl=${redirectUrl}`;
            let result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

            if (result.type == "success") {
                // The .slice(0, -1) is to remove a false # thats at then end, for some reason.
                const token = result.url.split("token=")[1].slice(0, -1);
                //console.log("GOOGLE LOGIN TOKEN\n", JSON.stringify({ token }, null, 4));
                await SecureStore.setItemAsync(secureStoreKey, token);
                const decoded = jwt_decode(token);
                user.email = decoded.useremail;
                user.username = decoded.username;
                setUser({ ...user });
                // console.log("user", user);
                setSignedIn(true);
                navigation.navigate("UserScreen");
            } else if (result.type == "cancel") {
                // If the user closed the web browser, the Promise resolves with { type: 'cancel' }.
                // If the user does not permit the application to authenticate with the given url, the Promise resolved with { type: 'cancel' }.
                console.log("User Cancelled.");
            } else if (result.type == "dismiss") {
                // If the browser is closed using dismissBrowser, the Promise resolves with { type: 'dismiss' }.
                console.log("User dismissed the browser.");
            }
        } catch (error) {
            console.log(error);
            Alert(error); // This needs to be finetuned, to send something more specific. We do not wish to hand everything to the User.
        }
    };

    const handleUserLogin = async () => {
        const request = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ useremail: userEmail, password: password }),
        };
        const res = await fetch(`${backendURL}/auth/jwt?`, request).then((res) =>
            res.json()
        );
        if (
            res.token
            // && (typeof res.token === String || res.token instanceof String)
        ) {
            const decoded = jwt_decode(res.token);
            user.email = decoded.useremail;
            user.username = decoded.username;
            // console.log("User", user);
            await SecureStore.setItemAsync(secureStoreKey, res.token);
            setUser({ ...user });
            // console.log(JSON.stringify({ res }, null, 4));
            setSignedIn(true);
            navigation.navigate("UserScreen");
        } else {
            console.log(
                "Something went wrong while logging in:\n",
                JSON.stringify({ res }, null, 4)
            );
            Alert("Wrong username or password!", "Login Error!");
        }
    };

    return (
        <ScrollView scrollToOverflowEnabled={true} style={styles.scrollView}>
            <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }} >
                <KeyboardAvoidingView behavior="padding" >
                    <View style={styles.screen}>
                        <LoginCard
                            navigation={navigation}
                            googleLoginHandler={handleGoogleLogin}
                            userLoginHandler={handleUserLogin}
                            setPassword={setPassword}
                            setUserEmail={setUserEmail}
                            userEmail={userEmail}
                            password={password}
                        />
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </ScrollView>
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
        textAlign: "center",
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
        flexDirection: "row",
        width: "100%",
        justifyContent: "center",
        paddingHorizontal: 15,
    },
    button: {
        width: 100,
        padding: 7,
    },
});

export default LoginScreen;
