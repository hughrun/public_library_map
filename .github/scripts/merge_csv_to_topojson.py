#!/usr/bin/env python3
import csv
import json

# files to merge
csv_file = './website/data/library_services_information.csv'
topojson_file = './website/data/boundaries.topo.json'

geo = open(topojson_file, 'r') # open the topo.json file
json_data = json.loads(geo.read()) # read the file and load into a dict

# for each feature, if the name in the json matches the name in the csv, add new properties to the json
for feature in json_data['objects']['boundaries.geo']['geometries']:
  with open(csv_file, newline='') as f:
    # use DictReader so we can use the header names
    reader = csv.DictReader(f)
    for row in reader:
      # look for match
      if row['name'] == feature['properties']['name']:
        # create new properties in topojson
        for k in row:
          if k != "long_name" and k != "": # ignore long_name and any blank column names
            feature['properties'][k] = row[k]
  f.close() # close csv
geo.close() # close geo and flush

# open topojson file again and overwrite it
with open(topojson_file, 'w') as newfile:
  json.dump(json_data, newfile, separators=(',', ':'))
  newfile.close()
