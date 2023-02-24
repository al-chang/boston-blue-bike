const MAP_FINAL_URL =
  "https://raw.githubusercontent.com/al-chang/boston-blue-bike/main/data/map-final/greaterboston.geojson";

const geoJsonResponse = await fetch(MAP_FINAL_URL);
const geoJson = await geoJsonResponse.json();
console.log(geoJson);

/**
 * SVG structure:
 *   <svg> - container for entire map
 *     <g> - handle zoom and drag position
 *       <rect> - overlay a transparent layer for smooth zoom and drag
 *       <g> of <path> - each `path` is a district in the map
 *       <g> of <text> - districts' name
 *     </g>
 *   </svg>
 *
 * Reference:
 *   http://www.ourd3js.com/wordpress/296/
 *   https://bl.ocks.org/mbostock/4e3925cdc804db257a86fdef3a032a45
 *   https://stackoverflow.com/questions/35443768/how-do-i-fix-zooming-and-panning-in-my-cluster-bundle-graph
 *   https://groups.google.com/forum/#!topic/d3-js/OAJgdKtn1TE
 *   https://groups.google.com/forum/#!topic/d3-js/sg4pnuzWZUU
 */

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

function zoomHandler() {
  g.attr("transform", d3.event.transform);
}

function clickToZoom(zoomStep) {
  svg.transition().duration(ZOOM_DURATION).call(zoom.scaleBy, zoomStep);
}

d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP));
d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP));

//  --------------- Step 1 ---------------
// Prepare SVG container for placing the map,
// and overlay a transparent rectangle for pan and zoom.
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

// --------------- Step 2 ---------------
// Project GeoJSON from 3D to 2D plane, and set
// projection config.
const projection = d3
  .geoMercator()
  .center([-71.0589, 42.3601])
  .scale(80000)
  .translate([WIDTH / 2, HEIGHT / 2]);

// --------------- Step 3 ---------------
// Prepare SVG path and color, import the
// effect from above projection.
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));
console.log(color);

// --------------- Step 4 ---------------
// 1. Plot the map from data source `hongkong`
// 2. Place the district name in the map
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