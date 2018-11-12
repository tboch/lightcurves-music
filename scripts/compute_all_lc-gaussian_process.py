#!/usr/bin/env python

"""
Compute gaussian processes for all stars
"""

import sys
import os
from astropy.io import ascii
import numpy as np
import json
from matplotlib import pyplot as plt
import time

from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, Matern, ConstantKernel as Constant

from astropy.io.votable import parse_single_table

variables_sample = parse_single_table('../data/gaia-variable-sample.vot').array

lc4id = {}
transits = parse_single_table('../data/gaiadr2-transits.vot').array

for row in transits:
    #   if row['source_id'] not in variables_sample['source_id']:
        #continue

    source_id      = row['source_id']
    g_transit_time = row['g_transit_time']
    g_transit_mag  = row['g_transit_mag']
    if not source_id in lc4id:
        lc4id[source_id] = {'time': [], 'mag': []}
    lc4id[source_id]['time'].append(g_transit_time)
    lc4id[source_id]['mag'].append(g_transit_mag)

kernel = Matern(0.001, [1e-6, 1]) * Constant(15, (2, 30))
gaussian_process = GaussianProcessRegressor(kernel=kernel, alpha=np.square(0.03), n_restarts_optimizer=20)
nb_processed = 0
for row in variables_sample:
    period = row['pf']
    source_id = row['source_id']

    lc_time = np.array(lc4id[source_id]['time'])
    lc_mag  = np.array(lc4id[source_id]['mag'])


    x = (lc_time % period) / period
    y = lc_mag

    sorted_indexes = np.argsort(x)
    x = x[sorted_indexes]
    y = y[sorted_indexes]

    try:
        gaussian_process.fit(np.atleast_2d(x).T, y)
        predictedY, sigma = gaussian_process.predict(np.atleast_2d(np.linspace(0, 1)).T, return_std=True)
    except:
        print(source_id)
        continue

    if nb_processed<5:                                
        plt.errorbar(np.linspace(0, 1), predictedY, yerr=sigma*3)
        plt.scatter(x, y, color='r')
        plt.show()

    with open('results/%d.json' % (source_id), 'w') as h:
        h.write(json.dumps({'phase':x.tolist(), 'mag': y.tolist(), 'phase_estimate': np.linspace(0, 1).tolist(), 'mag_estimate': predictedY.tolist()}))

    nb_processed += 1
    print(nb_processed)

