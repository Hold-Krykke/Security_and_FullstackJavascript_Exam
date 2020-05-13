import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Header from './components/Header';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import LoginScreen from './screens/LoginScreen';
import ChatScreen from './screens/ChatScreen';

export default function App() {

    // USE SCREENS LIKE THIS
    const [test, setTest] = useState(false);

    let content = <HomeScreen setTest={setTest} />;
    if (test) {
        content = <MapScreen test={test} />
    }

    return (
        <View style={styles.screen}>
            <Header title="Find Your Friends" />
            {content}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1
    }
});
