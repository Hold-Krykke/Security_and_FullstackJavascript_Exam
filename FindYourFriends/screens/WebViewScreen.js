import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Card from '../components/Card';
import colors from '../constants/colors';
import Input from '../components/Input';
import facade from "../facade";
import { WebView } from 'react-native-webview';


const WebViewScreen = props => {
    const [navigation, setnavigation] = useState('')

    const printme = async (input) => {
        console.log(input.url)
    }
    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
            <View style={styles.screen}>
                <WebView
                    source={{ uri: 'http://e1e92de2.ngrok.io/auth/google/' }}
                    style={{ marginTop: 20, width: 350 }}
                    onNavigationStateChange={printme.bind(this)}

                />
            </View>
        </TouchableWithoutFeedback>)
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    title: {
        color: colors.secondary,
        fontSize: 22,
        fontWeight: "bold",
        marginVertical: 10

    },
    container: {
        width: 300,
        maxWidth: '80%',
        alignItems: 'center'
    },
    input: {
        width: 100,
        textAlign: 'center'
    }
});

export default WebViewScreen;