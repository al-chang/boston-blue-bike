import { projectCoordinates } from "./dataTransformation.js";
import {
  geoJson,
  blueBikeStations,
  getStationMatrix,
  getManyStationsMatrices,
} from "./dataLoad.js";
import {
  debounce,
  scaleZoom,
  calcOffset,
  maxColumn,
  findMaxX,
} from "./utils.js";
import { blueScale, coolScale } from "./colorScheme.js";

// --------------- Constants ---------------
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [1, 7];
const MAX_STATION_SIZE = 3;
const MIN_STATION_SIZE = 1.25;

const HOVER_COLOR = "#d36f80";

let GLOBAL_K = 1;

// --------------- Event handlers ---------------
const debouncedStationResize = debounce((zoomScale) => {
  d3.select('g[data-container="stations"]')
    .selectAll("circle")
    .transition()
    .duration(300)
    .attr("r", scaleZoom(zoomScale, MAX_STATION_SIZE, MIN_STATION_SIZE));
}, 400);

const zoomHandler = (e) => {
  g.attr("transform", e.transform);
  GLOBAL_K = e.transform.k;
  debouncedStationResize(GLOBAL_K);
};

const zoom = d3.zoom().scaleExtent(ZOOM_THRESHOLD).on("zoom", zoomHandler);

// --------------- Prep Map container ---------------
d3.select("#boston-map").on("selectday", async (e) => {
  await clearBlueBikeStations();
  renderBlueBikeStations(GLOBAL_K, e.detail.days);
});

// --------------- Prep SVG ---------------
const svg = d3
  .select("#boston-map")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

const g = svg.call(zoom).append("g");

// Align projection
const projection = d3
  .geoMercator()
  .center([-71.0589, 42.3601])
  .scale(90000)
  .translate([WIDTH / 4, HEIGHT / 2]);

const projectedStations = projectCoordinates(
  blueBikeStations,
  projection,
  "latitude",
  "longitude"
);

// Prepare svg
const path = d3.geoPath().projection(projection);

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
    .attr("stroke-width", 0.5);
}

function renderBlueBikeStationsContainer() {
  g.append("g").attr("data-container", "stations");
  g.append("g").attr("data-container", "connections");
}

async function renderBlueBikeStations(scaleValue, days) {
  const matrix =
    !!days && days.length > 0
      ? await getManyStationsMatrices(days)
      : await getStationMatrix("total");
  // Event handlers
  const mouseEnterStationHandler = (_e, d) => {
    const stationIndex = matrix.findIndex(
      (_station) => _station["from_station"] === d.name
    );
    const stationRow = matrix[stationIndex];
    const mostTripStations = findMaxX(stationRow, 5, d.name);

    const connectionContainer = d3.select('g[data-container="connections"]');

    mostTripStations.forEach((station) => {
      if (station === "") return;
      const c = d3.select(`circle[data-station-name="${station}"]`).data()[0];
      const { offsetX, offsetY } = calcOffset(
        d.projectedLongitude,
        d.projectedLatitude,
        c.projectedLongitude,
        c.projectedLatitude,
        d3.select("circle").attr("r")
      );
      connectionContainer
        .append("line")
        .style("stroke", "black")
        .attr("x1", d.projectedLongitude + offsetX)
        .attr("y1", d.projectedLatitude + offsetY)
        .attr("x2", d.projectedLongitude + offsetX)
        .attr("y2", d.projectedLatitude + offsetY)
        .transition()
        .duration(200)
        .attr("x2", c.projectedLongitude - offsetX)
        .attr("y2", c.projectedLatitude - offsetY);
    });
  };

  const mouseLeaveStationHandler = (_e, _d) => {
    const connectionContainer = d3.select('g[data-container="connections"]');
    connectionContainer.selectAll("line").remove();
  };

  const MAX_TRIPS =
    !!days && days.length > 0
      ? maxColumn(projectedStations, days)
      : d3.max(projectedStations, (d) => parseInt(d["total_trips"]));

  const color = d3.scaleQuantize().domain([0, MAX_TRIPS]).range(coolScale);

  const stationContainer = d3.select('g[data-container="stations"]');
  stationContainer
    .selectAll("circle")
    .data(projectedStations)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.projectedLongitude)
    .attr("cy", (d) => d.projectedLatitude)
    .attr("data-station-name", (d) => d.name)
    .attr("fill", (d) => {
      if (!!days && days.length > 0) {
        return color(
          days.reduce(
            (total, day) => total + parseInt(d[`${day}_total_trips`]),
            0
          )
        );
      } else {
        return color(d.total_trips);
      }
    })
    .on("mouseenter", mouseEnterStationHandler)
    .on("mouseleave", mouseLeaveStationHandler)
    .transition()
    .duration(300)
    .attr("r", scaleZoom(scaleValue, MAX_STATION_SIZE, MIN_STATION_SIZE));
}

function clearBlueBikeStations() {
  const p = new Promise((resolve) => {
    d3.select('g[data-container="stations"]')
      .selectAll("circle")
      .transition()
      .duration(150)
      .attr("r", 0)
      .transition()
      .remove()
      .on("end", () => resolve());
  });
  return p;
}

// Draw neighborhoods of Boston
const renderMap = () => {
  renderBostonRegions();
  renderBlueBikeStationsContainer();
  renderBlueBikeStations(GLOBAL_K, []);
};

export default renderMap;
