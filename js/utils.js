// Credit to freeCodeCamp (https://www.freecodecamp.org/news/javascript-debounce-example/)
export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

export const scaleZoom = (k, max, min) => {
  const res = max / k;
  return min === undefined ? res : Math.max(res, min);
};
