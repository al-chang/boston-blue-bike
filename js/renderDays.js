import { tripsByDay } from "./dataLoad.js";
import { coolScale } from "./colorScheme.js";
import { debounce } from "./utils.js";

// --------------- Prep SVG ---------------
const svg = d3
  .select("#day-container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

const renderDays = () => {
  const MAX_TRIP_DAY = Math.max(...tripsByDay);
  const MIN_TRIP_DAY = Math.min(...tripsByDay);
  const color = d3
    .scaleQuantize()
    .domain([MIN_TRIP_DAY, MAX_TRIP_DAY])
    .range(coolScale);
  const selectedDays = [];

  const selectDay = debounce(() => {
    d3.select("#boston-map").dispatch("selectday", {
      detail: { days: selectedDays },
    });
  });

  // Add rectangle to represent each day
  for (let i = 0; i < 30; i++) {
    let day = i + 4;
    svg
      .append("rect")
      .attr("x", (day % 7) * 50)
      .attr("y", Math.floor(day / 7) * 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(tripsByDay[i]))
      .on("click", () => {
        if (!selectedDays.includes(i + 1)) selectedDays.push(i + 1);
        selectDay();
      });
  }
};

export default renderDays;
