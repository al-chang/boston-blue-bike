export const projectCoordinates = (
  locations,
  projection,
  latitudeKey = "Latitude",
  longitudeKey = "Longitude"
) => {
  return locations.map((location) => {
    const [x, y] = projection([location[longitudeKey], location[latitudeKey]]);
    return { ...location, projectedLongitude: x, projectedLatitude: y };
  });
};
