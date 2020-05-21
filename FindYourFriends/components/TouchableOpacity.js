import React from 'react';
import {StyleSheet, Text, TouchableOpacity as _TouchableOpacity} from 'react-native';
import colors from '../constants/colors';

/**
 *
 * To style the TouchableOpacity, pass style.Touchable
 *
 * To style the Text inside the TouchableOpacity, pass style.TouchableText
 *
 * # Example
 * Pass style like this if declared in stylesheet:
 *
 * style={{Touchable: styles.button, TouchableText: styles.TouchableText}}
 * @param {*} props
 */
const TouchableOpacity = (props) => {
	//console.log(props);
	return (
		<_TouchableOpacity {...props} style={{...styles.TouchableOpacity, ...props.style.Touchable}}>
			<Text style={{...styles.Text, ...props.style.TouchableText}}>{props.text}</Text>
		</_TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	TouchableOpacity: {
		color: 'black',
		alignItems: 'center',
		backgroundColor: colors.buttons,
		padding: 5,
		borderRadius: 5,
	},
	Text: {
		fontWeight: 'bold',
	},
});

export default TouchableOpacity;
