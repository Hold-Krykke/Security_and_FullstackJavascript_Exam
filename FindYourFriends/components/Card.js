import React from 'react';
import { StyleSheet, View } from 'react-native';


const Card = props => {
    return (
        <View style={{ ...styles.card, ...props.style }}>{props.children}</View>
    );
};

const styles = StyleSheet.create({
    card: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        shadowOpacity: 0.26,
        backgroundColor: 'white',
        elevation: 8,
        padding: 10,
        borderRadius: 10,
        marginTop: 25
    }
});

export default Card;