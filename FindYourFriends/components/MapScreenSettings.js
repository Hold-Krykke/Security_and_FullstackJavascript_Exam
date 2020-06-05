import React, {useState} from 'react';
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

const MapScreenSettings = ({settings, setSettings}) => {
	console.log("MapScreenSettigns printing settings", settings);
	const [modalVisible, setModalVisible] = useState(false);
	const [distanceInput, setDistanceInput] = useState(settings.distance | 1000);
	const [inputMsg, setInputMsg] = useState('');

	const inputHandler = (distance) => {
		setInputMsg('');
		distance = distance.replace(',', '.');
		setDistanceInput(distance);
		distance = parseFloat(distance); //converts pretty much any flawed string to our demands. "abc105.5abc" would be parsed 105.5
		if (distance) {
			setSettings({...settings, distance});
		} else {
			setInputMsg('Input must be a decimal number');
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
						Alert.alert('Settings Modal has been closed.');
					}}>
					<View style={styles.modal} onPress={() => Keyboard.dismiss()}>
						<Card style={styles.cardStyle}>
							<Text style={styles.text}>Search radius</Text>
							<View style={styles.settingsContainer}>
								<Input
									value={distanceInput.toString()}
									onChangeText={inputHandler}
									keyboardType="numeric"
									autoFocus={true}
								/>
								<Text style={styles.text}> m</Text>
							</View>
							<View style={styles.button}>
								<Button
									onPress={() => setModalVisible(false)}
									color={colors.secondary}
									title="Return"
									disabled={!!inputMsg}
								/>
							</View>
							{inputMsg ? <Text style={{...styles.text, color: 'red'}}>{inputMsg}</Text> : null}
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
							onPress={() => props.navigation.goBack()}
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
		//marginTop: '20%',
		width: Dimensions.get('window').width * 0.7,
		height: Dimensions.get('window').height * 0.4,
		backgroundColor: '#fff',
		padding: 20,
	},
	screen: {
		flex: 0,
		padding: 10,
		//alignItems: 'center',
		justifyContent: 'center',
	},
	mapButtons: {
		flex: 0,
		//padding: 10,
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
		//marginBottom: 20,
	},
	tipText: {
		color: colors.primary,
		fontSize: 11,
		marginTop: '5%',
		fontStyle: 'italic',
	},
	innerModal: {
		//width: 300,
		//maxWidth: '80%',
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
		//justifyContent:'center',
		justifyContent: 'space-around',
		//alignItems: 'center'
	},
	touchableEnabled: {},
	touchableText: {
		letterSpacing: 0.5,
	},
	modal: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 22,
		backgroundColor: 'rgba(80,80,80,0.1)',
	},
	button: {
		//backgroundColor: 'white',
		width: 110,
		marginVertical: 10,
	},
});

export default MapScreenSettings;
