import React, {useState, useEffect, useRef} from 'react';
import {Dimensions, StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as Location from 'expo-location';
import MapView, {AnimatedRegion, Animated} from 'react-native-maps';
import Card from '../components/Card';
import colors from '../constants/colors';
import Input from '../components/Input';
import facade from '../facade';
import MapScreenSettings from '../components/MapScreenSettings';
import * as TaskManager from 'expo-task-manager';

const INITIAL_REGION = {
	//Milan, Italy - start location
	latitude: 45.464664,
	longitude: 9.18854,
	latitudeDelta: 30,
	longitudeDelta: 30,
};
const TASKMANAGER_TASK_NAME = 'FindYourFriends-background-location';
const {width, height} = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.2;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MARKER_COLORS = [
	'red',
	'tomato',
	'orange',
	'yellow',
	'gold',
	'wheat',
	'tan',
	'linen',
	'green',
	'aqua',
	'teal',
	'turquoise',
	'violet',
	'purple',
	'plum',
	'indigo',
];

const MapScreen = (props) => {
	let mapRef = useRef(null);
	const DEBUG = true; //use to display settings on screen
	const [settings, setSettings] = useState({
		username: 'Johnny',
		distance: 1000,
		longitude: null,
		latitude: null,
	});
	const [errorMsg, setErrorMsg] = useState(null);
	const [changeRegion, setChangeRegion] = useState(false);
	const [region, setRegion] = useState(null);
	const [nearbyUsers, setNearbyUsers] = useState([]);
	//grab all users from facade and map to screen. Update every so often? streams, subscriptions, taskManager?
	//pass userInfo as props

	TaskManager.defineTask(TASKMANAGER_TASK_NAME, async ({data: {locations}, error}) => {
		if (error) {
			console.log('taskError', error);
			// check `error.message` for more details.
			return;
		}
		console.log('Received new locations', locations);
		await locations;
		setSettings({
			...settings,
			longitude: locations[0].coords.longitude,
			latitude: locations[0].coords.latitude,
		});
		console.log('Not supposed to be in task manager');
	});

	async () => {
		let result = await Location.startLocationUpdatesAsync(TASKMANAGER_TASK_NAME, {
			accuracy: 4,
			timeInterval: 1000,
			showsBackgroundLocationIndicator: true,
			foregroundService: {
				notificationTitle: 'FindYourFriends is running',
				notificationBody: 'Updating location in background',
				notificationColor: '#1DA1F2',
			},
		});
		console.log('resultHERE', result);
	};

	useEffect(() => {
		//set MapView region close to user only on startup
		if (settings.latitude && settings.longitude) {
			setRegion({
				latitude: settings.latitude,
				longitude: settings.longitude,
				latitudeDelta: LATITUDE_DELTA,
				longitudeDelta: LONGITUDE_DELTA,
			});
			setChangeRegion(true);
			console.log('regionHere', region);
		}
	}, [settings]);

	// const doStuff = () => {
	// 	if (changeRegion && settings.latitude && settings.longitude) {
	// 		setRegion({
	// 			latitude: settings.latitude,
	// 			longitude: settings.longitude,
	// 			latitudeDelta: LATITUDE_DELTA,
	// 			longitudeDelta: LONGITUDE_DELTA,
	// 		});
	// 		setChangeRegion(false)
	// 		//mapRef.current.animateToRegion(region, 1000);
	// 	}
	// }
	useEffect(() => {
		let timeout;
		console.log('in useeffect outer, changeRegion:', changeRegion);
		if (changeRegion && region) {
			console.log('in useeffect inner', region);
			//timeout = setTimeout(() => mapRef.current.animateToRegion(region, 1000), 5);
			setTimeout(() => mapRef.current.animateToRegion(region, 1000), 5);
			//https://github.com/react-native-community/react-native-maps/issues/1717
			//timeout()
		}
		// return () => {
		if (timeout) clearTimeout(timeout)
		// 	setChangeRegion(false)
		// }
		//console.log('in useeffect mapRef', mapRef);
	}, [changeRegion]);
	useEffect(() => {
		// setTimeout(() => {
		(async () => {
			let {status} = await Location.requestPermissionsAsync();
			if (status !== 'granted') {
				setErrorMsg('Permission to access location was denied');
			}
			let location = await Location.getCurrentPositionAsync({});
			setSettings({
				...settings,
				longitude: location.coords.longitude,
				latitude: location.coords.latitude,
			});
			//setChangeRegion(true);
			// setRegion({
			// 	latitude: location.coords.latitude,
			// 	longitude: location.coords.longitude,
			// 	latitudeDelta: LATITUDE_DELTA,
			// 	longitudeDelta: LONGITUDE_DELTA,
			// });
			//setRegion(INITIAL_REGION)
			console.log('happened ' + new Date(Date.now()).toLocaleTimeString());
		})();
		//No return as we want user to update in the background
		// }, 1000);
	}, []); //will replicate between reloads of component, ffs

	// let userMessage = 'Waiting for location...';
	// if (errorMsg) {
	// 	userMessage = errorMsg;
	// } else if (settings.latitude && settings.longitude) {
	// 	userMessage = "";
	// }

	return (
		<>
			<MapScreenSettings settings={settings} setSettings={setSettings} />
			{<Text>{DEBUG && JSON.stringify(settings, null, 4)}</Text>}

			<TouchableWithoutFeedback
				touchSoundDisabled={true}
				onPress={() => {
					Keyboard.dismiss();
				}}>
				<View style={styles.screen}>
					{/* <Text style={styles.text}>{userMessage}</Text> */}

					<View style={styles.container}>
						{/* {!region && (<MapView
								ref={mapRef}
								style={styles.mapStyle}
								region={INITIAL_REGION}
								showsUserLocation
								loadingEnabled>
								{settings.latitude && settings.longitude && (
									<MapView.Marker
										title={settings.username + ' (YOU)'}
										pinColor="blue"
										key={settings.username}
										coordinate={{
											longitude: settings.longitude,
											latitude: settings.latitude,
										}}
									/>
								)}
							</MapView>
						)} */}
						{region && (
							<MapView
								//onLayout={() => doStuff}
								//initialRegion={INITIAL_REGION} //probably not needed
								//onMapReady={() => doStuff}
								//onMapReady={() => setChangeRegion(false)}
								ref={mapRef}
								style={styles.mapStyle}
								//region={INITIAL_REGION}
								//region={region}
								//onRegionChangeComplete={(region) => mapRef.current.animateToRegion(region, 1000)}
								showsUserLocation
								loadingEnabled
								//followsUserLocation={true}
							>
								{/* {settings.latitude && settings.longitude && (
									<MapView.Marker
										title={settings.username + ' (YOU)'}
										pinColor="blue"
										key={settings.username}
										coordinate={{
											longitude: settings.longitude,
											latitude: settings.latitude,
										}}
									/>
								)} */}
							</MapView>
						)}
					</View>
				</View>
			</TouchableWithoutFeedback>
		</>
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
