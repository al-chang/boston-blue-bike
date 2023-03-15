import { mergeMatrices } from "./dataTransformation.js";

const MAP_FINAL_URL = "data/map-final/greaterboston.geojson";
const MASS_MAP_URL = "data/maps/massachusetts.geojson";
const WATER_URL = "data/maps/water.geojson";
const BLUE_BIKE_STATION_URL = "data/bluebike/bluebike_station.csv";
const BLUE_BIKE_CLEAN_STATION_URL = "data/bluebike/stations.csv";
const STATION_MATRIX_URL = (id) =>
  `data/bluebike/station_matrix/station_matrix_${id}.csv`;

const geoJsonRequest = d3.json(MAP_FINAL_URL);
const massMapRequest = d3.json(MASS_MAP_URL);
const massWaterRequest = d3.json(WATER_URL);
const blueBikeStationsRequest = d3.csv(BLUE_BIKE_CLEAN_STATION_URL);

export const [geoJson, massMapJson, massWaterJson, blueBikeStations] =
  await Promise.all([
    geoJsonRequest,
    massMapRequest,
    massWaterRequest,
    blueBikeStationsRequest,
  ]);

// Represents the trips taken each day of the month. Index corresponds to day - 1.
export const tripsByDay = new Map();
blueBikeStations.forEach((station) => {
  for (let i = 1; i < 31; i++) {
    const currVal = tripsByDay.get(i) || 0;
    tripsByDay.set(i, currVal + parseInt(station[`${i}_total_trips`]));
  }
});

export const getStationMatrix = async (id) => {
  const _c = await d3.csv(STATION_MATRIX_URL(id));
  return _c;
};

export const getManyStationsMatrices = async (ids) => {
  const requests = [];
  ids.forEach((id) => requests.push(d3.csv(STATION_MATRIX_URL(id))));
  const matrices = await Promise.all(requests);
  return mergeMatrices(...matrices);
};
