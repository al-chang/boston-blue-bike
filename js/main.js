import { projectCoordinates } from "./dataTransformation.js";
import { geoJson, blueBikeStations } from "./dataLoad.js";
import { debounce, scaleZoom } from "./utils.js";

// --------------- Constants ---------------
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

// --------------- Event handlers ---------------
const debouncedStationRender = debounce((zoomScale) => {
  clearBlueBikeStations();
  renderBlueBikeStations(zoomScale, 3, 1);
}, 400);

const zoomHandler = (e) => {
  g.attr("transform", e.transform);
  debouncedStationRender(e.transform.k);
};

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
  .scale(90000)
  .translate([WIDTH / 2, HEIGHT / 2]);

const projectedStations = projectCoordinates(blueBikeStations, projection);

// Prepare svg
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeSet3);

function renderMassachusettsBorder() {
  g.append("g")
    .selectAll("path")
    .data(massMapJson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", LAND_COLOR);
}

function renderMasschusettsWater() {
  g.append("g")
    .selectAll("path")
    .data(massWaterJson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", WATER_COLOR);
}

function renderBostonRegions() {
  let resetColor = null;

  // Draw regions of Boston area
  g.append("g")
    .selectAll("path")
    .data(geoJson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (_d, i) => color(i))
    .attr("stroke", "#FFF")
    .attr("stroke-width", 0.5)
    .on("mouseover", (e, _d) => {
      const region = e.target;
      resetColor = region.getAttribute("fill");
      region.setAttribute("fill", HOVER_COLOR);
    })
    .on("mouseleave", (e, _d) => {
      const region = e.target;
      region.setAttribute("fill", resetColor);
    });
}

function renderBlueBikeStations(scaleValue) {
  // Draw the BlueBike stations
  g.append("g")
    .attr("data-container", "stations")
    .selectAll("circle")
    .data(projectedStations)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.projectedLongitude)
    .attr("cy", (d) => d.projectedLatitude)
    .attr("r", scaleZoom(scaleValue, 3, 1))
    .attr("fill", "red")
    .on("mouseenter", mouseEnterStationHandler);
}

function clearBlueBikeStations() {
  const container = document.querySelector('g[data-container="stations"]');
  if (container) {
    container.remove();
  }
}

// Draw neighborhoods of Boston
const renderMap = () => {
  renderBostonRegions();
  renderBlueBikeStations(1);
};

// Plot geojson
renderMap();
