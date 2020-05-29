import Card from "./Card";
import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, } from "react-native";
import colors from "../constants/colors";
import Input from "./Input";

const LoginCard = props => {

    const userInputHandler = inputText => {
        props.setUserEmail(inputText);
    };

    const passInputHandler = inputText => {
        props.setPassword(inputText);
    };

    return (
        <Card style={styles.container}>
            <View style={styles.container}>
                <Text style={styles.title}>Please Sign In </Text>
                <Input style={styles.input}
                    placeholder='E-MAIL'
                    onChangeText={userInputHandler}
                    value={props.userEmail}
                />
                <Input style={styles.input}
                    placeholder='PASSWORD'
                    onChangeText={passInputHandler}
                    value={props.password}
                    secureTextEntry={true}
                />
                <View style={styles.button}>
                    <Button color={colors.grey} title="Sign in" onPress={props.userLoginHandler} />
                </View>
                <View style={styles.button}>
                    <Button color={colors.primary} title="Sign in with Google" onPress={props.googleLoginHandler} />
                </View>
                <View style={styles.button}>
                    <Button color={colors.secondary} title="CREATE USER" onPress={() => props.navigation.navigate('CreateUserScreen')} />
                </View>
            </View >
        </Card >
    );
};

const styles = StyleSheet.create({
    title: {
        color: colors.secondary,
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 10,
    },
    text: {
        color: colors.primary,
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
        width: 110,
        marginVertical: 10
    },
});

export default LoginCard;