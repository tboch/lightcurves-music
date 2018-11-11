#!/usr/bin/env python

"""
Create JSON file for phase vs mag from light curve CSV file + period
"""

import sys
from astropy.io import ascii
import numpy as np
import json
from matplotlib import pyplot as plt

from scipy.fftpack import fft
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, Matern, ConstantKernel as Constant

csv_path = '../sample-data/GaiaDR2-2369538890337581056-Gmag-lightcurve.csv'
period = 1.13764108

#csv_path = '../sample-data/4047585189923411328.csv'
#period = 0.60699743

lc_points = ascii.read(csv_path, format='csv')

max_time = np.max(lc_points['time'])
times = np.hstack((lc_points['time'], lc_points['time'] + 1))

x = (lc_points['time'] % period) / period
x = np.hstack((x, x + 1))
y = np.hstack((lc_points['Gmag'], lc_points['Gmag']))

kernel = Matern(0.001, [1e-6, 1]) * Constant(15, (2, 30))
gaussian_process = GaussianProcessRegressor(kernel=kernel, alpha=np.square(0.05), n_restarts_optimizer=20)
gaussian_process.fit(np.atleast_2d(x).T, y)

# sampling rate
Fs = 200.0
# sampling interval
Ts = 1.0/Fs
# time vector
t = np.arange(0, 5, Ts);
predictedY, sigma = gaussian_process.predict(np.atleast_2d(np.linspace(0.5, 1.5, t.size/5)).T, return_std=True)
predictedY = np.tile(predictedY, 5)
Y = predictedY;

print(Y.size)
print(t.size)

# length of the signal
n = len(Y)
k = np.arange(n)
print(k)
T = n/Fs
print(T)
freq = k/T
freq = freq[range(n/2)]
print(freq)

Yf = np.fft.fft(Y)/n
Yf = Yf[range(n/2)]

import matplotlib.pyplot as plt

fig, ax = plt.subplots(1, 1)
ax.set_xlabel('Freq (Hz)')
ax.set_ylabel('|Y(freq)|')

Xx = freq[1:]
Yy = np.abs(Yf)[1:]
ax.plot(Xx, Yy)

max_ids = Yy.argsort()[-6:][::-1]
max_t = Xx[max_ids]
max_f = Yy[max_ids] 

#plt.scatter(x, y, color='r')

#np.savetxt('test2.csv', np.array([np.linspace(0.5, 1.5), predictedY]).T, delimiter=',')
np.savetxt('freq.csv', np.array([max_t, max_f]).T, delimiter=',')
plt.show()
