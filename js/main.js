import { projectCoordinates } from "./dataTransformation.js";
import { geoJson, blueBikeStations } from "./dataLoad.js";
import { debounce, scaleZoom } from "./utils.js";
import { blueScale } from "./colorScheme.js";

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

let GLOBAL_K = 1;

// --------------- Event handlers ---------------
const debouncedStationResize = debounce((zoomScale) => {
  d3.select('g[data-container="stations"]')
    .selectAll("circle")
    .transition()
    .duration(300)
    .attr("r", scaleZoom(zoomScale, 3, 0.75));
}, 400);

const zoomHandler = (e) => {
  g.attr("transform", e.transform);
  GLOBAL_K = e.transform.k;
  debouncedStationResize(GLOBAL_K);
};

const zoom = d3.zoom().scaleExtent(ZOOM_THRESHOLD).on("zoom", zoomHandler);

// --------------- Intersection Observers ---------------
const observer = new IntersectionObserver(
  (entries) => {
    const entry = entries.pop();
    console.log(entries, entry, entry.isIntersecting);
    if (entry.isIntersecting) {
      clearBlueBikeStations();
    } else {
      renderBlueBikeStations(GLOBAL_K);
    }
  },
  {
    rootMargin: "0px",
    threshold: 0,
  }
);
observer.observe(document.querySelector("#region2"));

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
  .translate([WIDTH / 4, HEIGHT / 2]);

const projectedStations = projectCoordinates(blueBikeStations, projection);

// Prepare svg
const path = d3.geoPath().projection(projection);

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
  const color = d3.scaleOrdinal(blueScale);
  // Event handlers
  let resetColor = null;
  const mouseEnterRegionHandler = (e, d) => {
    const region = e.target;
    resetColor = region.getAttribute("fill");
    region.setAttribute("fill", HOVER_COLOR);

    const regionName = d.properties.name;
    const regionNameContainer = document.querySelector("#region-name");
    regionNameContainer.innerHTML = `Selected Region: ${regionName}`;
  };

  const mouseLeaveRegionHandler = (e, _d) => {
    const region = e.target;
    region.setAttribute("fill", resetColor);
  };

  // Draw regions of Boston area
  g.append("g")
    .selectAll("path")
    .data(geoJson.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (_d, i) => color(i))
    .attr("stroke", "black")
    .attr("stroke-width", 0.5)
    .on("mouseenter", mouseEnterRegionHandler)
    .on("mouseleave", mouseLeaveRegionHandler);
}

function renderBlueBikeStationsContainer() {
  g.append("g").attr("data-container", "stations");
}

function renderBlueBikeStations(scaleValue) {
  // Event handlers
  const mouseEnterStationHandler = (_e, d) => {
    const stationName = d["Name"];
    const stationNameConatiner = document.querySelector("#station-name");
    stationNameConatiner.innerHTML = `Selected Station: ${stationName}`;
  };

  const stationContainer = d3.select('g[data-container="stations"]');
  stationContainer
    .selectAll("circle")
    .data(projectedStations)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.projectedLongitude)
    .attr("cy", (d) => d.projectedLatitude)
    .attr("fill", "red")
    .on("mouseenter", mouseEnterStationHandler)
    .transition()
    .duration(300)
    .attr("r", scaleZoom(scaleValue, 3, 0.75));
}

function clearBlueBikeStations() {
  d3.select('g[data-container="stations"]')
    .selectAll("circle")
    .transition()
    .duration(300)
    .attr("r", 0)
    .transition()
    .remove();
}

// Draw neighborhoods of Boston
const renderMap = () => {
  renderBostonRegions();
  renderBlueBikeStationsContainer();
  renderBlueBikeStations(GLOBAL_K);
};

// Plot geojson
renderMap();
