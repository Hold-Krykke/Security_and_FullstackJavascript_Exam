import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Card from '../components/Card';
import colors from '../constants/colors';
import Input from '../components/Input';
import facade from "../facade";


const ChatScreen = props => {
    return (
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>
            <View style={styles.screen}>
                <Card style={styles.container}>
                    <Text style={styles.title}>This is ChatScreen</Text>
                    <Input style={styles.input}
                        placeholder='Placeholder'
                    />
                </Card>
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

export default ChatScreen;