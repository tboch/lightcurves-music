#!/usr/bin/env python

"""
Create JSON file for phase vs mag from light curve CSV file + period
"""

import sys
from astropy.io import ascii
import numpy as np
import json

csv_path = sys.argv[1]
period = float(sys.argv[2])
star_id = sys.argv[3]
output_path = sys.argv[4]

lc_points = ascii.read(csv_path, format='csv')


x = (lc_points['time'] % period) / period
y = lc_points['Gmag']

print(y)

sorted_indexes = np.argsort(x)

phase = []
mag  = []


for idx in sorted_indexes:
    phase.append(x[idx])
    mag.append(y[idx])


json_obj = {star_id: {'phase': phase, 'mag': mag}}

with open(output_path, 'w') as outfile:
    json.dump(json_obj, outfile)

