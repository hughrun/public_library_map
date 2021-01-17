#!/usr/bin/env python3

import csv
import json
from titlecase import titlecase # you need to install the titlecase package from PyPi :-)

# files to merge
geojson_file = 'data/all_library_services.geojson'
csv_file = 'data/library_services.csv'

# fields to match on
geojson_match = 'name'
csv_match = 'short_name'

# output file name
output_file = 'data/boundaries.geojson'

# open the geojson file
file = open(geojson_file, 'r')
# read the file and then load the json so it's a dict
json_data = json.loads(file.read())

# for each geojson feature, if a field in the json matches a field in the csv, add new properties to the json
for feature in json_data['features']:
  with open(csv_file, newline='') as f:
    # use DictReader so we can use the header names
    reader = csv.DictReader(f)
    for row in reader:
      # look for match
      if row[csv_match] == feature['properties'][geojson_match]:
        # create new properties in geojson
        for k in row:
          feature['properties'][k] = row[k]

  downcased = titlecase(feature['properties'][geojson_match]) # titlecase name
  feature['properties']['name'] = downcased


# write out new geojson file with the updates
with open(output_file, 'w') as newfile:
  json.dump(json_data, newfile, indent=2)
