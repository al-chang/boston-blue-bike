import { projectCoordinates } from "./dataTransformation.js";

// Constants

const MAP_FINAL_URL = "data/map-final/greaterboston.geojson";
const MASS_MAP_URL = "data/maps/massachusetts.geojson";
const WATER_URL = "data/maps/water.geojson";
const BLUE_BIKE_STATION_URL = "data/bluebike/bluebike_station.csv";

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [1, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;

const HOVER_COLOR = "#d36f80";
const WATER_COLOR = "#d4f1f9";
const LAND_COLOR = "#34A56F";

// Load data
const geoJsonResponse = await fetch(MAP_FINAL_URL);
const geoJson = await geoJsonResponse.json();

const massMapResponse = await fetch(MASS_MAP_URL);
const massMapJson = await massMapResponse.json();

const massWaterResponse = await fetch(WATER_URL);
const massWaterJson = await massWaterResponse.json();

const blueBikeStations = await d3.csv(BLUE_BIKE_STATION_URL);

// --------------- Event handler ---------------
const zoomHandler = (e) => g.attr("transform", e.transform);

const zoom = d3.zoom().scaleExtent(ZOOM_THRESHOLD).on("zoom", zoomHandler);

const mouseEnterStationHandler = (_e, d) => {
  const stationName = d["Name"];
  const stationNameConatiner = document.querySelector("#station-name");
  stationNameConatiner.innerHTML = `Selected Station: ${stationName}`;
};

// Prep svg
const svg = d3
  .select("#boston-map")
  .append("svg")
  .attr("fill", WATER_COLOR)
  .attr("width", "100%")
  .attr("height", "100%");

const g = svg.call(zoom).append("g");

// Align projection
const projection = d3
  .geoMercator()
  .center([-71.0589, 42.3601])
  .scale(80000)
  .translate([WIDTH / 2, HEIGHT / 2]);

// Prepare svg
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeSet3);

// Plot geojson
renderMap();

function renderMap() {
  // Draw neighborshoods of Boston
  const projectedStations = projectCoordinates(blueBikeStations, projection);

  // g.append("g")
  //   .selectAll("path")
  //   .data(massMapJson.features)
  //   .enter()
  //   .append("path")
  //   .attr("d", path)
  //   .attr("fill", LAND_COLOR);

  // g.append("g")
  //   .selectAll("path")
  //   .data(massWaterJson.features)
  //   .enter()
  //   .append("path")
  //   .attr("d", path)
  //   .attr("fill", WATER_COLOR);

  let resetColor = null;

  g.append("g")
    .selectAll("path")
    .data(geoJson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (_d, i) => color(i))
    .attr("stroke", "#FFF")
    .attr("stroke-width", 0.5)
    .on("mouseover", (e, d) => {
      const region = e.target;
      resetColor = region.getAttribute("fill");
      region.setAttribute("fill", HOVER_COLOR);
    })
    .on("mouseleave", (e, d) => {
      const region = e.target;
      region.setAttribute("fill", resetColor);
    });

  g.append("g")
    .selectAll("circle")
    .data(projectedStations)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.projectedLongitude)
    .attr("cy", (d) => d.projectedLatitude)
    .attr("r", 2)
    .attr("fill", "red")
    .on("mouseenter", mouseEnterStationHandler);
}
