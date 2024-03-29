# Development log

Purpose of this file is to log the work and effort that went into developing the final product. This project requires a lot of learning for me, so I want to remember the steps it took to get me to the end.

This also serves as a place to credit resources that I used to create this project (and for me to reference them if I need them again in the future).

## 2/23/2023 - Data Collection

The goal of this project is initially to create an interactive map of Boston. Since Blue Bike stations span all across the greater Boston area I needed to create a map file that would represent the region. Through research, I learned the easiest way to do this would be using the geojson file format. However I quickly ran into obstacles when I could not easily find existing geoJSONs for Boston's neighboring cities. Enter the OpenStreetMaps API.

Following advice found in [this stackexchange post](https://gis.stackexchange.com/questions/183248/getting-polygon-boundaries-of-city-in-json-from-google-maps-api), it is possible to extract a geoJSON from OpenStreetMaps for any city that they have defined boundaries of. This made it very easy to collect geoJSONs.

## 2/24/2023 - Map Data Cleaning

After acquiring individual geoJSONs I needed to combine them into one large geoJSON for the greater Boston area. The online tool I found to do this, ([findthatpostcode.co.uk](https://findthatpostcode.uk/tools/merge-geojson)) only accepted geoJSONs that were of the type `FeatureCollection`, but OpenStreetMaps gives geoJSONs in the `GeometryCollection` format. It is actually a simple manual process to convert between the two types (allowed by the fact that OpenStreetMaps geoJSONs are very simple in structure). So I manually converted them to the desired format and created my combined file.

Using [this medium post](https://medium.com/@ivan.ha/using-d3-js-to-plot-an-interactive-map-34fbea76bd78) as a basis for my code and the help of ChatGPT to upgrade the code from `d3 v4` to `d3 v6` I was able to create a simple rendering of my greater Boston area geoJSON. The only problem was that some of the neighborhoods were inverted, resulting in the entire map being covered in a single color rather than just the neighborhood.

This problem had me stumped for quite some time. I entered my geoJSON into several online resources and it appeared to render correctly in all of them. I dug a little deeper and found out that d3 actually cares about the ordering of the coordinates, whereas standard geoJSON processors do not. To fix the issue it was as simple as reversing the coordinate ordering in the geoJSON, which I could accomplish using [this online tool](https://observablehq.com/@bumbeishvili/rewind-geojson).

I also acquired Blue Bike station data from the Blue Bike official website and added the information to the repository ([System data source](https://www.bluebikes.com/system-data)). I was then able to plot basic circles on the graph to represent the stations, and also add the station name to the page when one is highlighted.

This is what the map looks like after the culmination of all previous work mentioned: ![text](./images/iteration1-2-24-2023.png)

## 2/27/2023 - Reactive Reload and Code Splitting

I've come to realize that as this project grows it will become unsustainable to keep everything in `main.js`, so I am making my best effort in splitting the code into multiple files as much as possible. This is proving to be somewhat difficult to manage already because of the various event handlers and dependencies that need to be defined in particular orders. It has been fairly straightforward to move utility functions into their own files, but a lot of the data rendering and re-drawing will need to be better managed.

Something else I've been playing around with is re-rendering the visualizations. So far I've just test a simple re-rendering of the station circles sizes on zoom. I don't plan to use size of the mark as a channel to convey information to the viewer, so re-sizing the stations just makes the map more legible when a user zooms in. It works by using the `k` value provided from the `zoom` event. However, this value scales exponentially and grows larger as the user zooms further, so I created a simple function to take the multiplicative inverse to shrink the stations as the user zooms. This proved to be a fairly easy challenge to tackle, and sets up a nice paradigm for how re-rendering should be handled. I also added a debounce function that will hopefully be useful down the road as well.

My current idea for the final project is to have the map sticky on the right side of the screen as you scroll. There will be 2-3 different data visualizations on the right side that scroll into view. The map adjusts its appearance based on what visualization is currenlty most visible.

- Vis 1 would be of station usage throughout the months
- Vis 2 would be which stations see most usage between one another, a network graph and the user can control threshold for number of trips to show an edge

The hardest part of this might just be finding a way to cleanly transition the map between different states (through animation)

## 3/2/2023 - Intersection Observer

Currently experimenting with the intersection observer to see if I can make it so that the map on the right side stays pinned but reloads data when scrolling through the page.

## 3/3/2023 - Connections Between Stations

Succesfully added a way to draw lines between different stations. Currently just hardcoded to draw the line to a particular station. Also added JSDoc to the utility functions so that I don't forget what they do.

## 3/13/2023 - Data Cleaning

After a long break from working on this project, I spent all of 3/13 doing data cleaning. The explanation for the data cleaning can be better found in the final write up report for the project. The final cleaned data can be found in this repo, but the code to actually clean the data only exists on my local machine. There is a possiblity that I upload it to GitHub at some point, but I don't see much reason to.

## 3/24/2023 - Connecting the Stations

Much of my focus today was on PM-02. However, I was also able to make significant progress on code related to station connections. There were several tedious and annoying bugs to fix, mostly related to how the data is retrieved. It took a while to figure out if the bug was coming from the cleaned data (possibly prepared incorrectly) or the data retrieval. However, I am fairly confident that I finally got it working and showing the right data. It is responsive to date selection, which has been pretty fun to play around with.

As mentioned, I've been able to add the date selector. This was actually quite simple to do, but it can use quite a bit of prettying up. I am considering switching the color scheme to that of a purple -> red -> orange -> yellow scheme more similar to a heat map as I think it will be more visible than the current green option.

I am able to get the different views to react to changes in one another through events, which is a little complicated because I am splitting the code across multiple files. But I think that this is still better than having a mess of code in a single file, and using events makes for a better experience anyway.

Still considering if the network should be implemented or not. Leaning towards no because drawing the lines on the map does the exact same thing but even better in my opinion. Instead, I think I will go with a matrix that shows data about to and from trips at selected stations, reactive to the choice of day of course.

I've also come up with the idea of selecting regions of Boston and only focusing on the bike stations in those reigons. This way you can better see how stations interact with each other and their popularity relative to each other. The only problem is some regions only have 1 station, so maybe add the ability to select multiple at once? Will have to see, only going to implement this idea if I actually have the extra time.

This is what the map looks like after the culmination of all previous work mentioned: ![text](./images/iteration2-3-14-2023.png)
