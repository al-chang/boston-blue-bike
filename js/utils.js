// Credit: https://www.freecodecamp.org/news/javascript-debounce-example/
export const debounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

// Scale a value based on the zoom's k
export const scaleZoom = (k, max, min) => {
  const res = max / k;
  return min === undefined ? res : Math.max(res, min);
};

export const calcOffset = (x1, y1, x2, y2, r) => {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const offsetX = Math.cos(ang) * r;
  const offsetY = Math.sin(ang) * r;
  return { offsetX, offsetY };
};
