import React, {useState, useEffect, useRef} from 'react';
import {
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	//TouchableHighlight,
	TouchableNativeFeedback,
	Keyboard,
	Image,
	Button,
	Modal,
	Dimensions,
} from 'react-native';
import Card from './Card';
import Input from './Input';
import TouchableOpacity from './TouchableOpacity';

import colors from '../constants/colors';

const MapScreenSettings = ({settings, setSettings}) => {
	console.log(settings);
	const [modalVisible, setModalVisible] = useState(false);
	const [distanceInput, setDistanceInput] = useState(settings.distance | 1000)
	const [inputMsg, setInputMsg] = useState('');
	let buttonRef = useRef(null);

	const inputHandler = (distance) => {
		if (Number.isFinite(distance)) {
			//setInputMsg('');
			setSettings({...settings, distance});
		} else {
			setInputMsg('Input must be a decimal number');
			setTimeout(() => setInputMsg(''), 3000);
			//if (buttonRef.current) buttonRef.current.enabled = false;
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
							{/* <View style={styles.modal} onPress={() => Keyboard.dismiss()}> */}
							{/* <View style={styles.innerModal}> */}
							<Text style={styles.text}>Search radius</Text>

							<View style={styles.settingsContainer}>
								<Input
									value={settings.distance.toString()}
									onChangeText={inputHandler}
									keyboardType="numeric"
									autoFocus={true}
								/>
								<Text style={styles.text}> m</Text>
							</View>
							<TouchableOpacity
								//ref={buttonRef}
								onPress={() => setModalVisible(false)}
								activeOpacity={0.7}
								text="Close"
								style={{Touchable: styles.touchable, TouchableText: styles.touchableText}}
								disabled={!inputMsg}
							/>
							{inputMsg ? <Text style={{...styles.text, color: 'red'}}>{inputMsg}</Text> : null}
							<Text style={styles.tipText}>Tip: Press the map to return to your location </Text>
							{/* </View> */}
							{/* </View> */}
						</Card>
					</View>
				</Modal>
				{/* Above is settings modal  */}
				{/* Below is settings button */}
				<View style={styles.screen}>
					<View style={styles.settings}>
						<TouchableOpacity
							onPress={() => setModalVisible(true)}
							activeOpacity={0.7}
							text="Settings"
							style={{Touchable: styles.touchable, TouchableText: styles.touchableText}}
						/>
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
	settings: {
		flex: 0,
		//padding: 10,
		alignItems: 'stretch',
		justifyContent: 'flex-start',
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
	touchable: {},
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
});

export default MapScreenSettings;
