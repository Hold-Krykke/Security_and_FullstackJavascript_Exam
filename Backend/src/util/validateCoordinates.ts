const validateLongitude = (lon: number): Boolean => {
  return lon >= -180 && lon <= 180;
};
const validateLatitude = (lat: number): Boolean => {
  return lat >= -90 && lat <= 90;
};
const validateCoordinates = (lon: number, lat: number): Boolean => {
  return validateLatitude(lat) && validateLongitude(lon);
};

//console.log(validateCoordinates(-200, 60)); // false
//console.log(validateCoordinates(-100, 60)); // true

export default validateCoordinates;
// https://love2dev.com/blog/javascript-not-operator/
// https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
