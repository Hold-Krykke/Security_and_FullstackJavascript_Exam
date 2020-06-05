import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import colors from '../constants/colors';

const Header = props => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{props.title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 70,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25
    },
    headerTitle: {
        color: colors.secondary,
        fontSize: 22,
        fontWeight: "bold"
    }

});

export default Header;