

// Size function
function markerSize(mag) {
  let radius = 1;
  if (mag > 0) {
    radius = mag ** 7;
  }
  return radius
}

// Color function
function chooseColor(depth) {
  let color = "black";
  if (depth <= 10) {
    color = "#98EE00";
  } else if (depth <= 30) {
    color = "#D4EE00";
  } else if (depth <= 50) {
    color = "#EECC00";
  } else if (depth <= 70) {
    color = "#EE9C00";
  } else if (depth <= 90) {
    color = "#EA822C";
  } else {
    color = "#EA2C2C";
  }
  return (color);
}

// Map Function
function createMap(data, geo_data) {
  
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Overlay layers
  let c_array = [];

  for (let i = 0; i < data.length; i++){
    let row = data[i];
    let location = row.geometry;

    if (location) {
      let point = [location.coordinates[1], location.coordinates[0]];
      let popup = `
        <h1>Magnitude: ${row.properties.mag}</h1>
        <p>Location: ${row.properties.place}</p>
        <p>Depth: ${location.coordinates[2]}</p>
     `;  
      let c_marker = L.circle(point, {
        fillOpacity: 0.75,
        color: chooseColor(location.coordinates[2]),
        fillColor: chooseColor(location.coordinates[2]),
        radius: markerSize(row.properties.mag)
      }).bindPopup(popup);

      c_array.push(c_marker);
    }
  }

  let c_layer = L.layerGroup(c_array);

  let tp_layer = L.geoJSON(geo_data, {
    style: {
      "color": "orange",
      "weight": 3
    }
  });

  let baseLayers = {
    Street: street,
    Topography: topo
  };

  let overlayLayers = {
    "Earthquakes": c_layer,
    "Tectonic Plates": tp_layer
  }

  // Init Map
  let myMap = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3,
    layers: [street, tp_layer]
  });

  // Layer Controls
  L.control.layers(baseLayers, overlayLayers).addTo(myMap);

  // Legend
  let legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");

    let legendInfo = "<h4>Legend</h4>"
    legendInfo += "<i style='background: #98EE00'></i>-10-10<br/>";
    legendInfo += "<i style='background: #D4EE00'></i>10-30<br/>";
    legendInfo += "<i style='background: #EECC00'></i>30-50<br/>";
    legendInfo += "<i style='background: #EE9C00'></i>50-70<br/>";
    legendInfo += "<i style='background: #EA822C'></i>70-90<br/>";
    legendInfo += "<i style='background: #EA2C2C'></i>90+";

    div.innerHTML = legendInfo;
    return div;
  };

  legend.addTo(myMap);
}

function doWork() {

  let eq_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson";
  let tp_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

  d3.json(eq_url).then(function (data) {
    d3.json(tp_url).then(function (geo_data) {
      let datarows = data.features;
      createMap(datarows, geo_data);
    });
  });
}

doWork();
