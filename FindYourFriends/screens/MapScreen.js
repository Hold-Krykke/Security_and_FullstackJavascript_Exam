import React, {useState, useEffect, useRef} from 'react';
import {Dimensions, StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import colors from '../constants/colors';
import facade from '../facade';
import MapScreenSettings from '../components/MapScreenSettings';
import {useMutation} from '@apollo/react-hooks';


const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');
const ASPECT_RATIO = WIDTH / HEIGHT;
const LATITUDE_DELTA = 0.06;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

//Select random color from here for nearbyPlayers
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
	const DEBUG = true; //use to display settings on screen | debug TODO remove
	const [settings, setSettings] = useState({
		username: 'Johnny',
		distance: 1000,
		longitude: null,
		latitude: null,
	});
	const [changeRegion, setChangeRegion] = useState(false);
	const [region, setRegion] = useState(null);
	const [users, setUsers] = useState([]);
	//pass userInfo as props instead of bogus "settings" object

	const [
		updatePosition,
		{loadingPosition, errorPosition, dataPosition, calledPosition},
	] = useMutation(facade.UPDATE_POSITION);

	const [nearbyUsers, {loadingUsers, errorUsers, dataUsers, calledUsers}] = useMutation(
		facade.NEARBY_USERS
	);

	const getNearbyUsers = async () => {
		try {
			const result = await nearbyUsers({
				variables: {
					username: settings.username,
					coordinates: {
						lon: settings.longitude,
						lat: settings.latitude,
					},
					distance: settings.distance,
				},
			});
			console.log('getNearbyUsers', result);
			setUsers(result.dataUsers.getNearbyUsers); //experiemental, can't test because no login. may be "data" or "dataUsers"
		} catch (err) {
			console.log('getNearbyUsers error:', err);
			//todo proper error handling
		}
	};

	const updateMyPosition = async () => {
		//experiemental, can't test because no login
		try {
			const result = await updatePosition({
				variables: {
					username: settings.username,
					coordinates: {
						lon: 12.57,
						lat: 55.66,
					},
				},
			});
			console.log('updateMyPosition', result);
			//Do anything?
		} catch (err) {
			console.log('updateMyPosition error:', err);
			//todo proper error handling
		}
	};

	const animateRegionMapView = (animationTime = 1000) => {
		mapRef.current.animateToRegion(region, animationTime);
	};

	useEffect(() => {
		//Always change MapView region based on new location
		if (settings.latitude && settings.longitude) {
			setRegion({
				latitude: settings.latitude,
				longitude: settings.longitude,
				latitudeDelta: LATITUDE_DELTA,
				longitudeDelta: LONGITUDE_DELTA,
			});
			//On first run, trigger next useEffect
			setChangeRegion(true);
		}
		//getNearbyUsers() //todo activate when testing can be done. currently tells "need to be logged in".
		//^This might be too often. Should maybe be chained with updateMyPosition
		//updateMyPosition()
	}, [settings]);

	useEffect(() => {
		//set MapView camera region close to user ONLY on startup
		let timeout;
		if (changeRegion && region) {
			setTimeout(() => animateRegionMapView(), 5);
			//https://github.com/react-native-community/react-native-maps/issues/1717
		}
		if (timeout) clearTimeout(timeout);
	}, [changeRegion]);

	useEffect(() => {
		//Every second ask for location permission and update location state.
		const interval = setInterval(() => {
			(async () => {
				let {status} = await Location.requestPermissionsAsync();
				if (status !== 'granted') {
					//setErrorMsg('Permission to access location was denied');
					//TODO Handle error with new system
					//go to settings would be cool: https://docs.expo.io/versions/latest/sdk/intent-launcher/
					return;
				}

				let location = await Location.getCurrentPositionAsync({});
				setSettings({
					...settings,
					longitude: location.coords.longitude,
					latitude: location.coords.latitude,
				});

				if (DEBUG) {
					console.log('MapScreen: Update happened ' + new Date(Date.now()).toLocaleTimeString()); //Debug TODO REMOVE
				}
			})();
		}, 1000);
		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<>
			<MapScreenSettings settings={settings} setSettings={setSettings} />
			{DEBUG && settings && <Text>{JSON.stringify(settings, null, 4)}</Text>}

			<TouchableWithoutFeedback
				touchSoundDisabled={true}
				onPress={() => {
					Keyboard.dismiss();
				}}>
				<View style={styles.screen}>
					<View style={styles.container}>
						{region && (
							<MapView
								ref={mapRef}
								style={styles.mapStyle}
								showsUserLocation
								loadingEnabled={true}
								onLongPress={() => animateRegionMapView()}>
								{users && //experiemental, can't test because no login
									users.map((user) => {
										<MapView.Marker
											title={user.username}
											pinColor={MARKER_COLORS[Math.floor(Math.random() * array.length)]} //random color from possible ones
											key={user.username}
											coordinate={{
												longitude: user.lon,
												latitude: user.lat,
											}}
										/>;
									})}
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
		width: WIDTH,
		height: '100%',
	},
});

export default MapScreen;
