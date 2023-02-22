// Constants
const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 500;
const MARGINS = { left: 70, right: 50, top: 50, bottom: 50 };

// Variables for testing
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
// End variables for testing

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;

const ZOOM_THRESHOLD = [0.3, 7];

// const ROOT = JSON.parse(boston);

// Event handlers
const zoomHandler = () => g.attr("transform", d3.event.transform);

const zoom = d3.zoom().scaleExtent(ZOOM_THRESHOLD).on("zoom", zoomHandler);

const BOSTON_MAP = d3
  .select("#boston-map")
  .append("svg")
  .attr("height", "100%")
  .attr("width", "100%")
  .attr("class", "frame");

const g = BOSTON_MAP.call(zoom).append("g");
g.append("rect")
  .attr("width", WIDTH * OVERLAY_MULTIPLIER)
  .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
  .attr(
    "transform",
    `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
  )
  .style("fill", "none")
  .style("pointer-events", "all");

const projection = d3
  .geoMercator()
  .center([42.3601, -71.0589])
  .scale(80000)
  .translate([WIDTH / 2, HEIGHT / 2]);

const path = d3.geoPath().projection(projection);
// const color = d3.scaleOrdinal(d3.schemeCategory10.slice(1, 4));
console.log(boston);
g.append("g")
  .selectAll("path")
  .data(boston.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("fill", (d, i) => "blue")
  .attr("stroke", "#FFF")
  .attr("stroke-width", 0.5);
