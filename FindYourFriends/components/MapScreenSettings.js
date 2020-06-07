import React, { useState } from 'react';
import {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Keyboard,
	Button,
	Modal,
	Dimensions,
} from 'react-native';
import Card from './Card';
import Input from './Input';
import colors from '../constants/colors';

const MapScreenSettings = ({ navigation, distance, setDistance }) => {
	const [modalVisible, setModalVisible] = useState(false);
	const [distanceInput, setDistanceInput] = useState(distance | 100000);
	const [inputMsg, setInputMsg] = useState('');

	const inputHandler = (val) => {
		setDistanceInput(val);
	};

	const pressHandler = () => {
		let val = distanceInput.toString().replace('/,/', '.'); //Sometimes reads as number. Convert to string, replace commas
		val = parseFloat(val); //converts pretty much any flawed string to our demands. "abc105.5abc" would be parsed 105.5
		if (val) {
			setModalVisible(false);
			setDistance(val);
		} else {
			setInputMsg('Input must be a decimal number');
			setTimeout(() => setInputMsg(''), 2000);
		}

	};
	return (
		<TouchableWithoutFeedback
			touchSoundDisabled={true}
			onPress={() => {
				Keyboard.dismiss();
			}}>
			<View>
				<Modal
					animationType="none"
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						//as per the documentation, this is needed to be buildable on Android. /shrug
						// Alert.alert('Settings Modal has been closed.');
						console.log("Settings Modal has been closed.");
						setModalVisible(false);
					}}>
					<View style={styles.modal} onPress={() => Keyboard.dismiss()}>
						<Card style={styles.cardStyle}>
							<Text style={styles.text}>Search radius</Text>
							<View style={styles.settingsContainer}>
								<Input
									defaultValue={distanceInput.toString()}
									onChangeText={(input) => inputHandler(input)}
									keyboardType="numeric"
									autoFocus={true}
									style={{ width: "30%" }}
								/>
								<Text style={styles.text}> m</Text>
							</View>
							<View style={styles.button}>
								<Button
									onPress={() => pressHandler()}
									color={colors.secondary}
									title="Return"
									disabled={!!inputMsg}
								/>
							</View>
							{inputMsg ? <Text style={{ ...styles.text, color: 'red' }}>{inputMsg}</Text> : null}
							<Text style={styles.tipText}>Tip: Press the map to return to your location </Text>
						</Card>
					</View>
				</Modal>
				{/* Above is settings modal  */}
				{/* Below is settings button */}
				<View style={styles.screen}>
					<View style={styles.mapButtons}>
						<View style={styles.button}>
							<Button
								onPress={() => setModalVisible(true)}
								color={colors.primary}
								title="SETTINGS"
							/>
						</View>
						<View style={styles.button}>
							<Button
								color={colors.secondary}
								title="GO BACK"
								onPress={() => navigation.goBack()}
							/>
						</View>
					</View>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	cardStyle: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 0,
		width: Dimensions.get('window').width * 0.7,
		height: Dimensions.get('window').height * 0.4,
		backgroundColor: '#fff',
		padding: 20,
	},
	screen: {
		flex: 0,
		padding: 10,
		justifyContent: 'center',
	},
	mapButtons: {
		flex: 0,
		alignItems: 'stretch',
		justifyContent: 'flex-start',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-evenly',
	},
	title: {
		color: colors.primary,
		fontSize: 22,
		fontWeight: 'bold',
		marginVertical: 10,
	},
	text: {
		color: colors.secondary,
		fontSize: 14,
		fontWeight: 'bold',
	},
	tipText: {
		color: colors.primary,
		fontSize: 11,
		marginTop: '5%',
		fontStyle: 'italic',
	},
	innerModal: {
		justifyContent: 'center',
		alignItems: 'center',
		padding: 0,
		marginTop: 10,
		width: Dimensions.get('window').width * 0.7,
		height: Dimensions.get('window').height * 0.4,
		backgroundColor: '#fff',
		padding: 20,
	},
	settingsContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
	},
	modal: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
		backgroundColor: 'rgba(80,80,80,0.1)',
	},
	button: {
		width: 110,
		marginTop: 10,
	},
});

export default MapScreenSettings;
