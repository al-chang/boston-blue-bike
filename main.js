// Constants

const MAP_FINAL_URL = "data/map-final/greaterboston.geojson";

const geoJsonResponse = await fetch(MAP_FINAL_URL);
const geoJson = await geoJsonResponse.json();

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80";

// --------------- Event handler ---------------
const zoom = d3.zoom().scaleExtent(ZOOM_THRESHOLD).on("zoom", zoomHandler);

function zoomHandler(event) {
  g.attr("transform", event.transform);
}

// Prep svg
const svg = d3
  .select("#boston-map")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

const g = svg.call(zoom).append("g");

g.append("rect")
  .attr("width", WIDTH * OVERLAY_MULTIPLIER)
  .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
  .attr(
    "transform",
    `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
  )
  .style("fill", "none")
  .style("pointer-events", "all");

// Align projection
const projection = d3
  .geoMercator()
  .center([-71.0589, 42.3601])
  .scale(80000)
  .translate([WIDTH / 2, HEIGHT / 2]);

// Prepare svg
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Plot geojson
renderMap(geoJson);

function renderMap(root) {
  // Draw districts and register event listeners
  g.append("g")
    .selectAll("path")
    .data(root.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "#FFF")
    .attr("stroke-width", 0.5);
}
