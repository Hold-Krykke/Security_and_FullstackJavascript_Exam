import IPosition from "../interfaces/IPosition"
function positionCreator(lon: number, lat: number, username: string, dateInFuture: boolean): IPosition {
  let date = new Date()
  if (dateInFuture) {
    date = new Date("2022-09-25T20:40:21.899Z")
  }
  var position: IPosition = {
    username, lastUpdated: date,
    location: {
      type: "Point",
      coordinates: [lon, lat]
    }
  };

  return position;
}

export {positionCreator};