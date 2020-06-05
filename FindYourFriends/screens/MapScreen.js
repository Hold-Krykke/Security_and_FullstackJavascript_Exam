import React, {useState, useEffect, useRef} from 'react';
import {Dimensions, StyleSheet, View, Text, TouchableWithoutFeedback, Keyboard} from 'react-native';
import * as Location from 'expo-location';
import MapView, {Marker} from 'react-native-maps';
import Card from '../components/Card';
import colors from '../constants/colors';
import Input from '../components/Input';
import facade from '../facade';
import MapScreenSettings from '../components/MapScreenSettings';

const INITIAL_REGION = {
	//Milan, Italy - start location
	latitude: 45.464664,
	longitude: 9.18854,
	latitudeDelta: 30,
	longitudeDelta: 30,
};
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
	const [nearbyUsers, setNearbyUsers] = useState([]);
	//grab all users from facade and map to screen.
	//pass userInfo as props

	/**
	 * Uses @region and mapRef (useRef) from state to animateToRegion on the mapview.
	 * @param {*} animationTime
	 */
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
					//TODO Handle error with new system | go to settings would be cool
					return; 
				}

				let location = await Location.getCurrentPositionAsync({});
				setSettings({
					...settings,
					longitude: location.coords.longitude,
					latitude: location.coords.latitude,
				});

				console.log('happened ' + new Date(Date.now()).toLocaleTimeString()); //Debug TODO REMOVE
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
								{/* mapview tag ends here. Map players below, before closing tag. 
								https://github.com/react-native-community/react-native-maps#rendering-a-list-of-markers-on-a-map */}
								
								{/* {settings.latitude && settings.longitude && ( //use similar for mapping nearbyPlayers. Legacy from own user, modify to currently-mapped player
									<MapView.Marker
										title={settings.username}
										pinColor="blue" //use MARKER_COLORS
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
		width: WIDTH,
		height: '100%',
	},
});

export default MapScreen;
