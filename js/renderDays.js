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
  const MAX_TRIP_DAY = Math.max(...tripsByDay.values());
  const MIN_TRIP_DAY = Math.min(...tripsByDay.values());
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
  for (let i = 1; i < 31; i++) {
    let numericalDayOfWeek = i + 3;
    svg
      .append("rect")
      .attr("x", (numericalDayOfWeek % 7) * 50)
      .attr("y", Math.floor(numericalDayOfWeek / 7) * 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(tripsByDay.get(i)))
      .on("click", () => {
        if (!selectedDays.includes(i)) selectedDays.push(i);
        selectDay();
      });
  }
};

export default renderDays;
