const boundaries = fetch('data/boundaries.topo.json')
.then( response => response.json())

const branchesCsv = fetch('data/public_library_locations.csv')
.then( response => response.text());

const ikcCsv = fetch('data/indigenous_knowledge_centre_locations.csv')
.then( response => response.text());

const mechanics = fetch('data/mechanics_institute_locations.csv')
.then( response => response.text());

const nslaBranches = fetch('data/nsla_library_locations.csv')
.then( response => response.text());

var isSmallScreen = window.screen.availWidth < 800;

function BaseMap(id) {
  this.id = id;
  return L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
      id: id,
      tileSize: 512,
      zoomOffset: -1,
      accessToken: mapBoxToken
  })
}

function LocationsLayer(data, color) {
  this.data = data;
  this.color = color;
  return L.layerGroup([
    L.geoCsv(data, {
      firstLineTitles: true, 
      fieldSeparator: ',',
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          `<strong>${feature.properties.town}</strong>` + 
          `<p>${feature.properties.address}<br/>` +
          `phone: ${feature.properties.phone}</p>`
          )
        },
      pointToLayer: function (f, latlng) {
        return L.circle(latlng, {color: color, radius: 800}) // this is an 800m radius around the library
        }
    }),
    L.geoCsv(data, {
      firstLineTitles: true, 
      fieldSeparator: ',',
      onEachFeature: function (feature, layer) {
        layer.bindPopup(
          `<strong>${feature.properties.town}</strong>` + 
          `<p>${feature.properties.address}<br/>` +
          `phone: ${feature.properties.phone}</p>`
          )
      },
      pointToLayer: function (f, latlng) {
        return L.circleMarker(latlng, {color: color, radius: 2, fill: true})
      }
    })
  ])
}


Promise.all([boundaries, branchesCsv, ikcCsv, mechanics, nslaBranches])
.then( data => {
  // add tile layers for each base map
  const baseMap = new BaseMap('mapbox/dark-v10')
  const baseRules = new BaseMap('mapbox/light-v10')
  const baseIls = new BaseMap('mapbox/light-v10')

  // attach map to #mapid div above and centre
  const map = L.map('mapid', {
      center: [-27.00, 133.000],
      zoom: isSmallScreen ? 4 : 5,
      layers: [baseMap]
    });

  // LOCATION LAYERS
  const branches = new LocationsLayer(data[1], "#FF3961")
  const ikcs = new LocationsLayer(data[2], "#76DBA7")
  const mechsAndSoA = new LocationsLayer(data[3], "rgb(255,165,0)")
  const otherLibs = new LocationsLayer(data[4], "#75f857")
  // add to the initial map on load
  branches.addTo(map)
  ikcs.addTo(map)
  mechsAndSoA.addTo(map)
  otherLibs.addTo(map)

  // Use TopoJSON
  // -----------------------------------------------------------------
  // This snippet Copyright (c) 2013 Ryan Clark (MIT License)
  L.TopoJSON = L.GeoJSON.extend({
    addData: function (jsonData) {
      if (jsonData.type === 'Topology') {
        for (let key in jsonData.objects) {
          geojson = topojson.feature(jsonData, jsonData.objects[key]);
          L.GeoJSON.prototype.addData.call(this, geojson);
        }
      } else {
        L.GeoJSON.prototype.addData.call(this, jsonData);
      }
    },
  });
  // -----------------------------------------------------------------

  // library services fines overlay
  const fines = new L.TopoJSON(data[0], {
  style: function(feature){
      return {
        fillColor: getFinesColor(feature.properties.fines),
        weight: 3,
        color: "white",
        dashArray: "4",
        fillOpacity: 0.2
      }
    },
  onEachFeature: function onEachFeature(feature, layer) {
    layer.on({
      mouseover: e => highlightFeature(e),
      mouseout: e => resetHighlight(e, fines),
      click: e => zoomToFeature(e, feature.properties),
      })
    }
  });

  // fill patterns for loan period overlay
  const circles = new L.PatternCircle({
    color: '#000',
    weight: 1,
    radius: 2,
    x: 4,
    y: 4,
    fill: true,
    fillOpacity: 1
  });

  const loanTwo = new L.Pattern({
    width: 8,
    height: 8
  })

  loanTwo.addShape(circles);
  loanTwo.addTo(map);

  const loanThree = new L.StripePattern({
  color: '#000'
  }); 
  loanThree.addTo(map);

  const loanFour = new L.StripePattern({
  color: '#000',
  weight: 6,
  spaceWeight: 2,
  angle: 45
  }); 
  loanFour.addTo(map);

  const loanSix = new L.StripePattern({
    color: '#000',
    weight: 2,
    spaceWeight: 6,
    angle: 135
    }); 
    loanSix.addTo(map);

  function getLoanFillPattern(w) {
    return  w == '2' ? loanTwo :
            w == '3' ? loanThree :
            w == '4' ? loanFour :
            w == '6' ? loanSix : null
  }

  // loan period overlay
  const loanPeriod = new L.TopoJSON(data[0], {
    style: function(feature){
      return {
        weight: 3,
        color: "#fff",
        dashArray: "4",
        fillOpacity: 0.2,
        fillColor: "#bbb",
        fillPattern: getLoanFillPattern(feature.properties.standard_loan_weeks)
      }
    },
    onEachFeature: function onEachFeature(feature, layer) {
      layer.on({
        mouseover: e => highlightFeature(e),
        mouseout: e => resetHighlight(e, loanPeriod),
        click: zoomToFeature
      })
    }
  });

  // integrated library management software
  const ils = new L.TopoJSON(data[0], {
    style: function(feature){
        return {
          fillColor: getIlsColor(feature.properties.ILS),
          weight: 3,
          color: "white",
          dashArray: "4",
          fillOpacity: 0.2
        }
      },
    onEachFeature: function onEachFeature(feature, layer) {
      layer.on({
        mouseover: e => highlightFeature(e),
        mouseout: e => resetHighlight(e, ils),
        click: e => zoomToFeature(e, feature.properties),
        })
      }
    });


  // ++++++++++++++
  // control layers
  // ++++++++++++++
  const baseMaps = {
  "Libraries" : baseMap,
  "Rules" : baseRules,
  "Library Management Software" : baseIls
  }

  // change the branches overlay names depending on the mode.
  const modeButton = document.getElementById('mode-button');

  var overlayMaps = {}

  function setGeneral() {
    overlayMaps = {
      "Settler Knowledge Centres" : branches,
      "Indigenous Knowledge Centres" : ikcs,
      "Mechanics Institutes" : mechsAndSoA,
      "Colonial Knowledge Centres" : otherLibs
    }
    modeButton.setAttribute('class', 'visible');
    modeButton.innerText = "View in Colonial Mode";
  }

  function setColonial() {
    overlayMaps = {
      "Public Libraries" : branches,
      "Indigenous Knowledge Centres" : ikcs,
      "Mechanics Institutes" : mechsAndSoA,
      "National & State Libraries" : otherLibs
      };
      modeButton.setAttribute('class', 'visible');
      modeButton.innerText = "View in Standard Mode";
  }

  if (sessionStorage.getItem('mapMode') === 'colonial') {
    setColonial()
  } else {
    setGeneral()
  }

  // add control layers
  var mapControl = L.control.layers(
    baseMaps, 
    overlayMaps, 
    { "collapsed" : isSmallScreen }
  ).addTo(map);

  // scale
  L.control.scale().addTo(map);

  // info boxes
  const infoBoxes = {
    branches: L.control(),
    fines: L.control(),
    loanPeriod: L.control(),
    serviceInfo: L.control({position: 'topleft'})
  }

  // switching mode between standard and colonial
  function switchMode() {
    if (sessionStorage.getItem('mapMode') === 'colonial') {
      sessionStorage.setItem('mapMode', 'general');
      setGeneral()
      mapControl.remove();
      infoBoxes.branches.remove()
      mapControl = L.control.layers(baseMaps, overlayMaps, {"collapsed": isSmallScreen}).addTo(map);
      if (!isSmallScreen) {
        infoBoxes.branches.addTo(map)
      }
    } else {
      sessionStorage.setItem('mapMode', 'colonial');
      setColonial()
      mapControl.remove();
      infoBoxes.branches.remove()
      mapControl = L.control.layers(baseMaps, overlayMaps, {"collapsed": isSmallScreen}).addTo(map);
      if (!isSmallScreen) {
        infoBoxes.branches.addTo(map)
      }
    }
  }

  modeButton.addEventListener('click', switchMode, false);

  function getFinesColor(f) {
    return  f == 'no' ? '#4dac26' :
            f == 'yes' ? '#d01c8b' :
            f == 'adults' ? '#f1b6da' :
            f == 'by_lga' ? '#abd9e9' :
            f == 'no_unconfirmed' ? '#b8e186' : '#bbb';
  }

  function getIlsColor(f) {
    return  f == 'AIT Aurora' ? '#d16a6e' :
            f == 'Champ LMSi' ? '#ff00db' :
            f == 'Civica Spydus' ? '#800080' :
            f == 'DECD Bookmark' ? '#e1153e' :
            f == 'Follett Destiny' ? '#df4917' :
            f == 'Infor V-smart' ? '#e174c1' :
            f == 'Innovative Sierra' ? '#ff0000' :
            f == 'Koha ILS' ? '#2fbf2f' :
            f == 'Libero' ? '#ffa500' :
            f == 'Locally developed' ? '#bfdf17' :
            f == 'OCLC Amlib' ? '#ddb372' :
            f == 'OCLC WorldShare' ? '#2fbf97' :
            f == 'SirsiDynix Horizon' ? '#ffff00' :
            f == 'SirsiDynix Symphony' ? '#115583' :
            f == 'Softlink Liberty' ? '#00f9ff' :
            f == 'SumWare Athenaeum' ? '#ff3232' : '#bbb';
  }

  // highlight feature on mouse hover
  function highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
      weight: 6,
      color: '#FF3961',
      dashArray: "0",
      fillOpacity: 0
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
    if (!isSmallScreen) {
      infoBoxes.serviceInfo.addTo(map)
      infoBoxes.serviceInfo.update(layer.feature.properties)
    }
  }

  function zoomToFeature(e, props) {
    map.fitBounds(e.target.getBounds());
    e.target.bindPopup(`
    <strong>${props.name}</strong>` + 
    `<p>Fines: ` + 
    (
      props.fines === "no" ? "No" : 
      props.fines == "no_unconfirmed" ? "Probably no" : 
      props.fines === "yes" ? "Yes" : 
      props.fines == "adults" ? "No for children" :
      props.fines == "by_lga" ? "Varies by LGA" : "Unknown"
    ) + 
    `<br/>Loans : ` + 
    (!props.standard_loan_weeks || props.standard_loan_weeks == "?" ? `Unknown` : `${props.standard_loan_weeks} weeks`) + 
    `<br/>Software : ` + 
    (!props.ILS || props.ILS == "?" ? `Unknown` : `${props.ILS}`) + 
    `<br/>Website: ` + 
    (!props.website || props.website == "?" ? `Unknown` : `<a target="_blank" href="`+ `${props.website}` + `" >` + `${props.website}` + `</a>`) +
    `</p>`
    ).openPopup()
  }

  // clear on mouseout
  function resetHighlight(e, layer) {
    layer.resetStyle(e.target);
    infoBoxes.serviceInfo.remove()
  }

  // this is used to add general info when each layer is added
  function addLegend() {
    this._div = L.DomUtil.create('div', 'info')
    this.update();
    return this._div;
  }

  // FINES LEGEND
  infoBoxes.fines.onAdd = addLegend;
  infoBoxes.fines.update = function (props) {
  this._div.innerHTML =  
    `<p>Hover over an area for more information</p>
    <section>
      <div><div class="circle" style="background-color: #4dac26"></div>Fine free</div>
      <div><div class="circle" style="background-color: #b8e186"></div>Fine free (unconfirmed)</div>
      <div><div class="circle" style="background-color: #f1b6da"></div>Fine free for children</div>
      <div><div class="circle" style="background-color: #abd9e9"></div>Fine policy varies</div>
      <div><div class="circle" style="background-color: #d01c8b"></div>Fines for all users</div>
      <div><div class="circle" style="background-color: #bbb"></div>Unknown (help me find out!)</div>
    </section>
    `
  };

  // BRANCH LOCATIONS LEGEND
  infoBoxes.branches.onAdd = addLegend;
  infoBoxes.branches.update = function (props) {
  this._div.innerHTML = `
  <h4>Library Branches</h4>
  <p>Circles represent an 800 metre radius from the library location. This is the distance generally used by urban planners to represent "conceptually within walking distance" for most people.</p>
  `};
  if (!isSmallScreen) {
    infoBoxes.branches.addTo(map) // add by default it larger screen
  }

  // STANDARD LOAN PERIOD LEGEND
  infoBoxes.loanPeriod.onAdd = addLegend;
  infoBoxes.loanPeriod.update = function (props) {
  this._div.innerHTML = `
  <section>
  <div><div class="circle" style="background: 
  radial-gradient(4px 4px at 6px 6px, #3a3a3a 50%, transparent 75%),
  radial-gradient(4px 4px at 16px 6px, #3a3a3a 50%, transparent 75%),
  radial-gradient(4px 4px at 2px 12px, #3a3a3a 50%, transparent 75%),
  radial-gradient(4px 4px at 12px 12px, #3a3a3a 50%, transparent 75%),
  radial-gradient(4px 4px at 20px 12px, #3a3a3a 50%, transparent 75%),
  radial-gradient(4px 4px at 8px 18px, #3a3a3a 50%, transparent 75%);
  background-repeat: no-repeat;
  border: 1px solid black;
  "></div>2 weeks</div>
    <div><div class="circle" style="background: repeating-linear-gradient(
      0deg,
      #3a3a3a,
      #3a3a3a 2px,
      #fff 2px,
      #3a3a3a 4px
      )"></div>3 weeks</div>
    <div><div class="circle" style="background: repeating-linear-gradient(
      45deg,
      #3a3a3a,
      #3a3a3a 3px,
      #fff 1px,
      #3a3a3a 4px
      )"></div>4 weeks</div>
      <div><div class="circle" style="background: repeating-linear-gradient(
        135deg,
        #fff,
        #fff 8px,
        #3a3a3a 2px,
        #fff 10px
        )"></div>6 weeks</div>
    <div><div class="circle" style="background-color: #bbb"></div>Unknown (help me find out!)</div>
  </section>
  `
  };

  // FOCUSSED AREA INFOBOX (pops up on top left)
  infoBoxes.serviceInfo.onAdd = addLegend;
  infoBoxes.serviceInfo.update = function(props) {
    if (props) {
    this._div.innerHTML = `<h4>${props.name}</h4>` +
    '<section><p>' + 
    (
      props.fines === "no" ? "Fine free for overdue items" : 
      props.fines == "no_unconfirmed" ? "Probably no overdue fines" : 
      props.fines === "yes" ? "Overdue fines for all users" : 
      props.fines == "adults" ? "No overdue fines for children" :
      props.fines == "by_lga" ? "Fine policy varies" : "No fines data"
    ) + '<br/>' +
    (!props.standard_loan_weeks || props.standard_loan_weeks == "?" ? `No loan period data` : `${props.standard_loan_weeks} week loans`) +
      `<br/>Software: ` + 
      (!props.ILS || props.ILS == "?" ? `Unknown` : `${props.ILS}`) +
    '</p></section>'
    }
  }

  // loan period layer is always at bottom
  map.on('overlayadd', l => {
    if (l.name == "Loan Period") {
      loanPeriod.bringToBack()
    }
  })

  // change overlays depending on base layer
  // we remove info boxes before adding them again where relevant
  // this is so we don't accidentally stack up multiple copies dependng on user
  // navigation journey
  map.on('baselayerchange', l => {
    for (let k in infoBoxes) {
        infoBoxes[k].remove()
      }
    if (l.name == "Rules") {
      modeButton.setAttribute('class', 'hidden'); // hide the mode button when it's not relevant
      mapControl.addOverlay(fines, "Fines")
      mapControl.addOverlay(loanPeriod, "Loan Period")
      loanPeriod.addTo(map)
      fines.addTo(map)
      for (let i in overlayMaps ) {
        mapControl.removeLayer(overlayMaps[i])
        overlayMaps[i].remove()
      }
      ils.remove()
      if (!isSmallScreen) { // only add infoboxes to larger screens
        infoBoxes.loanPeriod.addTo(map)
        infoBoxes.fines.addTo(map)
      }
    } else if (l.name == "Library Management Software") {
      modeButton.setAttribute('class', 'hidden'); // hide the mode button when it's not relevant
      // remove any other layers
      for (let i in overlayMaps ) {
        mapControl.removeLayer(overlayMaps[i])
        overlayMaps[i].remove()
      }
      mapControl.removeLayer(fines)
      mapControl.removeLayer(loanPeriod)
      fines.remove()
      loanPeriod.remove()
      // add ILS layer
      ils.addTo(map)
    } else {
      // if 'Libraries' layer...
      mapControl.removeLayer(fines)
      mapControl.removeLayer(loanPeriod)
      fines.remove()
      loanPeriod.remove()
      ils.remove()
      branches.addTo(map)
      for (let k in overlayMaps ) {
        mapControl.addOverlay(overlayMaps[k], k)
      }
      if (!isSmallScreen) {
        infoBoxes.branches.addTo(map)
      }
      modeButton.setAttribute('class', 'visible');
    }
  })

  // remove the loading message once everything is loaded
  const loadingDiv = document.getElementById("loading");
  loadingDiv.remove()

})