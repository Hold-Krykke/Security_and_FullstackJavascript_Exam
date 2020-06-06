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

// const UserInfo = () => {

// }

const MapScreen = ({user, setUser, distance, setDistance, props}) => {
	//console.log('user', user);
	let mapRef = useRef(null);
	const DEBUG = true; //use to display settings on screen | debug TODO remove
	//const [distance, setDistance] = useState(1000);
	const [changeRegion, setChangeRegion] = useState(false);
	const [region, setRegion] = useState(null);
	const [users, setUsers] = useState([]);
	//pass userInfo as props instead of bogus "settings" object

	// const [
	// 	updatePosition,
	// 	{loadingPosition, errorPosition, dataPosition, calledPosition},
	// ] = useMutation(facade.UPDATE_POSITION);

	const [nearbyUsers, {loading, error, data, called}] = useMutation(facade.NEARBY_USERS);

	const NearbyUsersState = async () => {
		try {
			await nearbyUsers({
				variables: {
					username: user.username,
					coordinates: {
						lon: user.location.lon,
						lat: user.location.lat,
					},
					distance: 100000, //todo remove static distance
				},
			});
			//console.log('getNearbyUsers', dataUsers);
			//console.log('getNearbyUsers', result);
			//setUsers(result.dataUsers.getNearbyUsers); //experiemental, can't test because no login. may be "data" or "dataUsers"
		} catch (err) {
			console.log('getNearbyUsers error:', err);
			//todo proper error handling
		}

		if (error) {
			//todo handle error
		}
		if (data) {
			console.log(data);
			//if (users != data.getNearbyUsers)
		// 	if (data.getNearbyUsers) {
		// 		return data.getNearbyUsers.map((user) => {
		// 			return (
		// 				<MapView.Marker
		// 					title={user.username}
		// 					pinColor={MARKER_COLORS[Math.floor(Math.random() * MARKER_COLORS.length)]} //random color from possible ones
		// 					key={user.username}
		// 					coordinate={{
		// 						longitude: user.lon,
		// 						latitude: user.lat,
		// 					}}
		// 				/>
		// 			);
		// 		});
		// 	}
		// }
		if (data.getNearbyUsers) {
			setUsers(data.getNearbyUsers)
		}
	}
	};

	const getNearbyUsers = async () => {
		try {
			await nearbyUsers({
				variables: {
					username: user.username,
					coordinates: {
						lon: user.location.lon,
						lat: user.location.lat,
					},
					distance: 100000, //todo remove static distance
				},
			});
			//console.log('getNearbyUsers', dataUsers);
			//console.log('getNearbyUsers', result);
			//setUsers(result.dataUsers.getNearbyUsers); //experiemental, can't test because no login. may be "data" or "dataUsers"
		} catch (err) {
			console.log('getNearbyUsers error:', err);
			//todo proper error handling
		}
	};
	// if (error) {
	// 	//todo handle error
	// }
	if (data) {
		console.log(data);
		//if (users != data.getNearbyUsers)
		if (data.getNearbyUsers) setUsers(data.nearbyUsers); //infinite re-render
		//setUsers(data.getNearbyUsers);
	}
	 
	

	// const updateMyPosition = async () => {
	// 	//experiemental, can't test because no login
	// 	try {
	// 		const result = await updatePosition({
	// 			variables: {
	// 				username: user.username,
	// 				coordinates: {
	// 					lon: user.location.lon,
	// 					lat: user.location.lat,
	// 				},
	// 			},
	// 		});
	// 		console.log('updateMyPosition', result);
	// 		//Do anything?
	// 	} catch (err) {
	// 		console.log('updateMyPosition error:', err);
	// 		//todo proper error handling
	// 	}
	// };

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

		//getNearbyUsers(); //todo activate when testing can be done. currently tells "need to be logged in".
		//^This might be too often. Should maybe be chained with updateMyPosition
		//updateMyPosition() //this is apparently already done on getNearbyUsers..so delete.
		//return null
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
					//setErrorMsg('Permission to access location was denied');
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
			<MapScreenSettings {...props} distance={distance} setDistance={setDistance} />
			{DEBUG && user && <Text>{JSON.stringify({...user, distance: distance}, null, 4)}</Text>}
			<Button title="Fetch nearby users" onPress={() => getNearbyUsers()}></Button>
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
						{/* <NearbyUsersState/> */}
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
