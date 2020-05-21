import React, {useState, useEffect, useRef} from 'react';
import {
	Dimensions,
	StyleSheet,
	View,
	Text,
	TouchableWithoutFeedback,
	Keyboard,
	Animated,
} from 'react-native';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
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
	const [region, setRegion] = useState(INITIAL_REGION);
	const [nearbyUsers, setNearbyUsers] = useState([]);
	//grab all users from facade and map to screen. Update every so often? streams, subscriptions?
	//pass userInfo as props
	useEffect(() => {
		//set MapView region close to user only on startup
		if (settings.latitude && settings.longitude) {
			setRegion({
				...region,
				latitude: settings.latitude,
				longitude: settings.longitude,
				latitudeDelta: LATITUDE_DELTA,
				longitudeDelta: LONGITUDE_DELTA,
			});
		}
	}, [changeRegion]);

	useEffect(() => {
		if (region) mapRef.current.animateToRegion(region, 1000);
	}, [region]);
	useEffect(() => {
		setTimeout(() => {
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
				setChangeRegion(true);
				console.log('happened ' + new Date(Date.now()).toLocaleTimeString());
			})();
			//No return as we want user to update in the background
		}, 1000);
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
						<MapView
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
