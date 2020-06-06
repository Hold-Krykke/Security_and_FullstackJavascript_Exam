import React, {useState, useEffect, useRef} from 'react';
import {
	Dimensions,
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Keyboard,
	Button,
} from 'react-native';
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

const MapScreen = ({user, setUser, distance, setDistance, navigation}) => {
	let mapRef = useRef(null);
	const DEBUG = false; //use to display settings on screen
	const [changeRegion, setChangeRegion] = useState(false);
	const [region, setRegion] = useState(null);
	const [users, setUsers] = useState([]);

	const [nearbyUsers, {loading, error, data, called}] = useMutation(facade.NEARBY_USERS);

	const getNearbyUsers = async () => {
		try {
			await nearbyUsers({
				variables: {
					username: user.username,
					coordinates: {
						lon: user.location.lon,
						lat: user.location.lat,
					},
					distance,
				},
			});
		} catch (err) {
			console.log('getNearbyUsers error:', err);
			//todo proper error handling
		}
	};

	if (error) {
		console.log('NearbyUsersError:', error);
		//todo proper error handling
	}

	useEffect(() => {
		if (data && data.getNearbyUsers) {
			setUsers(...[data.getNearbyUsers]);
		}
	}, [data]);

	const animateRegionMapView = (animationTime = 1000) => {
		if (mapRef.current) mapRef.current.animateToRegion(region, animationTime);
	};

	useEffect(() => {
		//Always change MapView region based on new location
		if (user.location.lat && user.location.lon) {
			setRegion({
				latitude: user.location.lat,
				longitude: user.location.lon,
				latitudeDelta: LATITUDE_DELTA,
				longitudeDelta: LONGITUDE_DELTA,
			});
			//On first run, trigger next useEffect
			setChangeRegion(true);
		}
	}, [user.location]);

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
					//TODO Handle error with new system
					//go to settings would be cool: https://docs.expo.io/versions/latest/sdk/intent-launcher/
					return;
				}

				let location = await Location.getCurrentPositionAsync({});
				setUser({
					...user,
					location: {
						lon: location.coords.longitude,
						lat: location.coords.latitude,
					},
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
			<MapScreenSettings navigation={navigation} distance={distance} setDistance={setDistance} />
			{DEBUG && user && <Text>{JSON.stringify({...user, distance: distance}, null, 4)}</Text>}
			<View style={styles.button}>
			<Button title="Fetch nearby users" onPress={() => getNearbyUsers()}></Button>
			</View>
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
								{users &&
									users.map((user) => {
										return (
											<MapView.Marker
												title={user.username}
												pinColor={MARKER_COLORS[Math.floor(Math.random() * MARKER_COLORS.length)]} //random color from possible ones
												key={user.username}
												coordinate={{
													longitude: user.lon,
													latitude: user.lat,
												}}
											/>
										);
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
	button: {
		justifyContent:'center',
		alignItems: 'center',
		width: 220,
		marginVertical: 10,
		
	},
});

export default MapScreen;
