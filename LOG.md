# Development log

Purpose of this file is to log the work and effort that went into developing the final product. This project requires a lot of learning for me, so I want to remember the steps it took to get me to the end.

This also serves as a place to credit resources that I used to create this project (and for me to reference them if I need them again in the future).

## 2/23/2023 - Data Collection

The goal of this project is initially to create an interactive map of Boston. Since Blue Bike stations span all across the greater Boston area I needed to create a map file that would represent the region. Through research, I learned the easiest way to do this would be using the geojson file format. However I quickly ran into obstacles when I could not easily find existing geoJSONs for Boston's neighboring cities. Enter the OpenStreetMaps API.

Following advice found in [this stackoverflow post](https://gis.stackexchange.com/questions/183248/getting-polygon-boundaries-of-city-in-json-from-google-maps-api), it is possible to extract a geoJSON from OpenStreetMaps for any city that they have defined boundaries of. This made it very easy to collect geoJSONs.

## 2/24/2023 - Map Data Cleaning

After acquiring individual geoJSONs I needed to combine them into one large geoJSON for the greater Boston area. The online tool I found to do this, ([findthatpostcode.co.uk](https://findthatpostcode.uk/tools/merge-geojson)) only accepted geoJSONs that were of the type `FeatureCollection`, but OpenStreetMaps gives geoJSONs in the `GeometryCollection` format. It is actually a simple manual process to convert between the two types (allowed by the fact that OpenStreetMaps geoJSONs are very simple in structure). So I manually converted them to the desired format and created my combined file.

Using [this medium post](https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78) as a basis for my code and the help of ChatGPT to upgrade the code from `d3 v4` to `d3 v6` I was able to create a simple rendering of my greater Boston area geoJSON. The only problem was that some of the neighborhoods were inverted, resulting in the entire map being covered in a single color rather than just the neighborhood.

This problem had me stumped for quite some time. I entered my geoJSON into several online resources and it appeared to render correctly in all of them. I dug a little deeper and found out that d3 actually cares about the ordering of the coordinates, whereas standard geoJSON processors do not. To fix the issue it was as simple as reversing the coordinate ordering in the geoJSON, which I could accomplish using [this online tool](https://observablehq.com/@bumbeishvili/rewind-geojson).

I also acquired Blue Bike station data from the Blue Bike official website and added the information to the repository. ([System data source](https://www.bluebikes.com/system-data))
