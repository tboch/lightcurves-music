#!/usr/bin/env python

"""
Create JSON file for phase vs mag from light curve CSV file + period
"""

import sys
from astropy.io import ascii
import numpy as np
import json
from matplotlib import pyplot as plt

from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, Matern, ConstantKernel as Constant

csv_path = '../sample-data/GaiaDR2-2369538890337581056-Gmag-lightcurve.csv'
period = 1.13764108

csv_path = '../sample-data/4047585189923411328.csv'
period = 0.60699743

lc_points = ascii.read(csv_path, format='csv')


x = (lc_points['time'] % period) / period
y = lc_points['Gmag']

kernel = Matern(0.001, [1e-6, 1]) * Constant(15, (2, 30))
gaussian_process = GaussianProcessRegressor(kernel=kernel, alpha=np.square(0.05), n_restarts_optimizer=20)
gaussian_process.fit(np.atleast_2d(x).T, y)


predictedY, sigma = gaussian_process.predict(np.atleast_2d(np.linspace(0, 1)).T, return_std=True)

plt.errorbar(np.linspace(0, 1), predictedY, yerr=sigma*3)
plt.scatter(x, y, color='r')
plt.show()

np.savetxt('test2.csv', np.array([np.linspace(0, 1), predictedY]).T, delimiter=',')
