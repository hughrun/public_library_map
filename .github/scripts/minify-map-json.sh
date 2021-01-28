npm install -g mapshaper
mapshaper ./boundaries.geo.json snap -clean -o force precision=0.0001 format=geojson ./boundaries.geo.json
npm install -g topojson-server
geo2topo ./boundaries.geo.json -q 50000 > ./website/data/boundaries.topo.json