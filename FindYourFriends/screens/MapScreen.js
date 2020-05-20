import React, {useState, useEffect} from 'react';
import {Dimensions, StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import Card from '../components/Card';
import colors from '../constants/colors';
import Input from '../components/Input';
import facade from '../facade';

const LATITUDE = 45.464664;
const LONGITUDE = 9.18854; //Milan, Italy
const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.1;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapScreen = (props) => {
	const [location, setLocation] = useState(null);
	const [errorMsg, setErrorMsg] = useState(null);
	const [changeRegion, setChangeRegion] = useState(false);
	const [region, setRegion] = useState({
		latitude: LATITUDE,
		longitude: LONGITUDE,
		latitudeDelta: 30,
		longitudeDelta: 30,
	});
	//pass all users as props and map to screen as markers. Update every so often? streams, subscriptions?

	useEffect(() => {
		if (location) {
			setRegion({
				...region,
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				latitudeDelta: LATITUDE_DELTA,
				longitudeDelta: LONGITUDE_DELTA,
			});
		}
	}, [changeRegion]);
	useEffect(() => {
		setTimeout(() => {
			(async () => {
				let {status} = await Location.requestPermissionsAsync();
				if (status !== 'granted') {
					setErrorMsg('Permission to access location was denied');
				}

				let location = await Location.getCurrentPositionAsync({});
				setLocation(location);
				setChangeRegion(true);
				console.log('happened ' + new Date(Date.now()).toLocaleTimeString());
			})();
			//No return as we want user to update in the background
		}, 1000);
		//console.log(location.latitude | 'no', location.longitude | 'no', 'yeet');
		// setRegion({
		// 	...region,
		// 	latitude: location.latitude,
		// 	longitude: location.longitude,
		// 	latitudeDelta: LATITUDE_DELTA,
		// 	longitudeDelta: LONGITUDE_DELTA,
		// });
	}, []); //will replicate between reloads of component, ffs

	let userMessage = 'Waiting for location...';
	if (errorMsg) {
		userMessage = errorMsg;
	} else if (location) {
		userMessage = JSON.stringify(location);
	}
	// const handleRegion = () => {
	// 	setRegion({
	// 		...region,
	// 		latitude: location.latitude | LATITUDE,
	// 		longitude: location.longitude | LONGITUDE,
	// 		latitudeDelta: LATITUDE_DELTA,
	// 		longitudeDelta: LONGITUDE_DELTA,
	// 	});
	// };

	return (
		<TouchableWithoutFeedback
			touchSoundDisabled={true}
			onPress={() => {
				Keyboard.dismiss();
			}}>
			<View style={styles.screen}>
				<Text style={styles.text}>{userMessage}</Text>
				<Text> {location && location.coords.longitude}</Text>
				<View style={styles.container}>
					<MapView
						style={styles.mapStyle}
						region={region}
						showsUserLocation
						loadingEnabled
						// onMapReady={() => handleRegion()}
					/>
				</View>
			</View>
		</TouchableWithoutFeedback>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		//padding: 10,
		alignItems: 'center',
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
		marginBottom: 20,
	},
	container: {
		width: 300,
		maxWidth: '80%',
		alignItems: 'center',
	},
	mapStyle: {
		width: Dimensions.get('window').width,
		height: Dimensions.get('window').height,
	},
});

export default MapScreen;
