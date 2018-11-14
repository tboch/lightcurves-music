// load all frames to animate stars
var starAnimationFrames = [];
for (var k = 0; k<30; k++) {
    var image = new Image();
    image.idx = k;
    image.onload = function () {
        starAnimationFrames[this.idx] = this;
    };
    image.src = 'pics/star-frames/f' + k + '.png';
}

var notes = ['C3', 'D#3', 'F3', 'G#3', 'A#3', 'C4', 'D#4', 'F4', 'G#4', 'A#4', 'C5', 'D#5'];
//notes = ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4']; // minor pentatonic
//notes = ['C3', 'C3#', 'D3', 'D3#', 'E3', 'F3', 'F3#', 'G3', 'G3#', 'A3', 'A3#', 'B3', 'C4', 'C4#', 'D4', 'D4#', 'E4', 'F4', 'F4#', 'G4', 'G4#', 'A4', 'A4#', 'B4'];
notes = ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'];
var chordsArray = [['F3', 'A3', 'D4'], ['B3', 'D4', 'G4'], ['C3', 'E3', 'A3'], ['A3', 'C4', 'F4']]; // veridis quo
chordsArray = [['G3', 'C4', 'E4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'A3', 'C4', 'F4']]; // 
//chordsArray = [['A3', 'C3', 'E4'], ['G3', 'B3', 'D4'], ['F3', 'A3', 'C4'], ['D3', 'F3', 'A3']];  // kavinsky
var piano = new Tone.PolySynth(3, Tone.Synth, {
    "volume": -10,
    "spread": 30,
    "envelope": {
        "attack": 0.01,
        "decay": 0.1,
        "sustain": 0.5,
        "release": 0.4,
        "attackCurve": "exponential"
    },
});
piano.toMaster();

// Tone JS
Tone.Transport.bpm.value = 300;

var velocities = [8, 8, 8];

// number of instruments and their colors
var numInst = 3;
var colors = ['green', 'red', 'purple'];

// Describes the list of instruments which will be played
// In order :
// - melody synth
// - kick
// - add here more instruments
// Cycles when all instruments have already been added one time
var globalInstId = 0;
var typeOfInsts = ['melody', 'conga', 'kick'];
Plotly.newPlot('lightcurve', [], {
    yaxis: { autorange: "reversed", title: 'G mag' },
    xaxis: { title: 'phase' },

    showlegend: false,
});

var startPlayingStar = function (star) {
    if (!star || !star.params) {
        return;
    }
    var params = star.params;
    var color = colors[star.instId];
    var d = [
        {
            x: params.phase_estimate_2P,
            y: params.mag_estimate_2P,
            mode: 'markers',
            marker: { color: 'pink', size: 4 },
            name: star.id,
        },
        {
            x: params.phase_2P,
            y: params.mag_2P,
            mode: 'markers',
            marker: { color: color, size: 8 }
        },
        {
            x: [params.phase_estimate_2P[star.lcIndex]],
            y: [params.mag_estimate_2P[star.lcIndex]],
            mode: 'markers',
            marker: { color: color, size: 8 }
        },
    ];
    Plotly.addTraces('lightcurve', d);
};

// initialize Aladin Lite
var aladin = A.aladin('#aladin-lite-div', { target: 'sgr a*', fov: 10, cooFrame: 'galactic', survey: 'P/DSS2/red' });

var selectedStars = [];
// Set how we react when an object is clicked
aladin.on('objectClicked', function (object) {
    console.log('click', object);
    if (object == null) {
        Tone.Transport.stop();
        for (var k=0; k<selectedStars.length; k++) {
            var s = selectedStars[k].ref;
            s.starRef = undefined;
            s.catalog.reportChange();
        }
        selectedStars = [];
	Plotly.newPlot('lightcurve', [], {
	    yaxis: { autorange: "reversed", title: 'G mag' },
	    xaxis: { title: 'phase' },

	    showlegend: false,
	});
        globalInstId = 0;
        var ulElt = document.getElementById('starsList');
        while (ulElt.hasChildNodes()) {
            ulElt.removeChild(ulElt.lastChild);
        }
        document.getElementById('textListStars').innerText = "No stars playing";
        return;
    }

    Tone.Transport.start('+0.15');
    var star = object.data;
    var isGaiaVariable = false;
    if (star.hasOwnProperty('source_id')) {
        isGaiaVariable = true;

    }

    if (isGaiaVariable) {
        var sourceId = star.source_id;
        var period = star.pf;

        var xhr = new XMLHttpRequest();

        var url = 'http://cds.unistra.fr/~boch/adass2018-hackathon/data/' + sourceId + '.json';

        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);

                var phase_estimate = data.phase_estimate.slice(0, 48);
                var phase_estimate_2P = phase_estimate.concat(phase_estimate.map(function (x) { return 1 + x; }));

                var mag_estimate = data.mag_estimate.slice(0, 48);
                var mag_estimate_2P = mag_estimate.concat(mag_estimate);

                var mag_2P = data.mag.concat(data.mag);
                var phase_2P = data.phase.concat(data.phase.map(function (x) { return 1 + x; }));

                var synth;
		var vel; 
                if (globalInstId == 1) {
		    synth = new Tone.MembraneSynth({
			"pitchDecay" : 0.008,
			"octaves" : 2,
			"envelope" : {
				"attack" : 0.01,
				"decay" : 0.5,
				"sustain" : 0
			}
		    });
                    // Connect lowpass filter to the kick
                    synth.connect(new Tone.Filter(500));
                    var freeverb = new Tone.Freeverb().toMaster();
                    freeverb.dampening.value = 100;
                    synth.connect(freeverb);
                    synth.toMaster();
                    vel = velocities[Math.floor(Math.random() * velocities.length)];
                } else if (globalInstId == 0) {
                    synth = new Tone.FMSynth({
                        "harmonicity": 1,
			"volume": -5,
                        "modulationIndex": 3.5,
                        "carrier": {
                            "oscillator": {
                                "instId": "custom",
                                "partials": [0, 1, 0, 2]
                            },
                            "envelope": {
                                "attack": 0.08,
                                "decay": 0.3,
                                "sustain": 0,
                            },
                        },
                        "modulator": {
                            "oscillator": {
                                "instId": "square"
                            },
                            "envelope": {
                                "attack": 0.1,
                                "decay": 0.2,
                                "sustain": 0.3,
                                "release": 0.01
                            },
                        }
                    }).toMaster();
                    vel = velocities[Math.floor(Math.random() * velocities.length)];
		} else if(globalInstId == 2) {
			synth = new Tone.MembraneSynth({
				"volume": "+10",
				"pitchDecay" : 0.008,
				"octaves" : 2,
				"envelope" : {
					"attack" : 0.01,
					"decay" : 1,
					"sustain" : 0,
				}
		    	});
                    	// Connect lowpass filter to the kick

                    	vel = 12;
                    // Connect lowpass filter to the kick
                    var freeverb = new Tone.Freeverb().toMaster();
                    freeverb.dampening.value = 100;
                    synth.connect(freeverb);
                    synth.toMaster();
		}

                var newStar = {
                    params: {
                        mag_2P: mag_2P,
                        phase_2P: phase_2P,
                        mag_estimate_2P: mag_estimate_2P,
                        phase_estimate_2P: phase_estimate_2P,
                        // minMag: 15,
                        // maxMag: 20
                        minMag: Math.min(...mag_estimate),
                        maxMag: Math.max(...mag_estimate)
                    },
                    id: sourceId,
                    lcIndex: 0,
                    synth: synth,
                    type: typeOfInsts[globalInstId],
                    instId: globalInstId,
                    vel: vel,
                };
                object.starRef = newStar;
                newStar.ref = object;
                startPlayingStar(newStar);
                selectedStars.push(newStar);
                //console.log('star:', newStar);

                // Add to the DOM
                var ulElt = document.getElementById('starsList');
                var liElt = document.createElement('li');
                var color = colors[globalInstId];
                liElt.innerHTML = "<p style='color: " + color + ";display: inline-block;margin: 0'>" + typeOfInsts[globalInstId] + "</>" + ' for source: ' + object.data.source_id;

                ulElt.appendChild(liElt);

                document.getElementById('textListStars').innerText = "List of stars playing:";
                globalInstId++;
                globalInstId = globalInstId % numInst;
            }
            else if (xhr.status !== 200) {
                alert('Request failed.  Returned status of ' + xhr.status);
            }
        }
        xhr.send();
    }
});

var shapesCache = {};
var getShape = function (diam, r, g, b) {
    var key = diam + '-' + r + '-' + g + '-' + b;

    if (shapesCache[key] === undefined) {
        var c = document.createElement('canvas');
        c.width = c.height = diam;
        var ctx = c.getContext('2d');
        ctx.beginPath();
        var color = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillStyle = color;
        ctx.fillStyle = color;
        ctx.arc(diam / 2., diam / 2., diam / 2., 0, 2 * Math.PI, true);
        ctx.fill();

        shapesCache[key] = c;
    }

    return shapesCache[key];
};


// define custom draw function
var starDrawFunction = function (source, canvasCtx, viewParams) {
    if (source.starRef) {
        drawAnimatedStar(source, canvasCtx, source.starRef.lcIndex);
        return;
    }
    var diam = 14;
    canvasCtx.drawImage(getShape(diam, 230, 20, 20), source.x - diam / 2., source.y - diam / 2.);
};

var drawAnimatedStar = function (source, canvasCtx, idx) { // progression between 0 and 1
    var img = starAnimationFrames[idx % starAnimationFrames.length];
    canvasCtx.drawImage(img, source.x - img.width/2, source.y - img.height/2);

};

var pulsarDrawFunction = function (source, canvasCtx, viewParams) {
    var diam = 14;
    canvasCtx.drawImage(getShape(diam, 56, 124, 234), source.x - diam / 2., source.y - diam / 2.);
};
// load catalogue with positions of Gaia stars for which we have light curves
// draw function is too slow for that many sources :(
aladin.addCatalog(A.catalogFromURL('http://cds.unistra.fr/~boch/adass2018-hackathon/gaia-variable-sample.vot', { shape: starDrawFunction, onClick: 'showTable' }));
aladin.addCatalog(A.catalogFromVizieR('J/ApJ/804/23/pulsars', '0 +0', 180, { shape: pulsarDrawFunction, onClick: 'showTable', name: 'Pulsars' }));

var playChords = false;
document.getElementById('chordsControl').addEventListener('change', function (e) {
    playChords = e.target.checked;
});

var t = 0;
var loop = new Tone.Loop(function (time) {
    for (var k = 0; k < selectedStars.length; k++) {
        var currentStar = selectedStars[k]; 
        
        currentStar.lcIndex++;
        currentStar.lcIndex = currentStar.lcIndex % 96;
   	var idTrace = k*3 + 2;
 
        var color = colors[currentStar.instId];
    	Plotly.animate('lightcurve', {
    		data: [{
            		x: [currentStar.params.phase_estimate_2P[currentStar.lcIndex]],
            		y: [currentStar.params.mag_estimate_2P[currentStar.lcIndex]],
            		mode: 'markers',
            		marker: { color: color, size: 13 }
		      }], 
    		traces: [idTrace]
  	},
	{
    		transition: {
      			duration: 0,
    		},
	  	frame: {
		  	duration: 0,
			redraw: false,
	  	}
	});
    }
    for (var k = 0; k < selectedStars.length; k++) {
        var currentStar = selectedStars[k]; 

	var noteIdx = Math.floor((notes.length - 1) * (currentStar.params.mag_estimate_2P[currentStar.lcIndex] - currentStar.params.minMag) / (currentStar.params.maxMag - currentStar.params.minMag));
        var note = notes[notes.length - 1 - noteIdx];
        if (currentStar.type == 'melody') {
            //currentStar.ref.catalog.reportChange();
            var mesureIdx = parseInt(Tone.Transport.position.split(':')[0]) % 16;
            mesureIdx = Math.floor(mesureIdx / 4);
            // play chords
            if (playChords && currentStar.lcIndex % 48 == 0) {
                piano.triggerAttackRelease(chordsArray[mesureIdx], '4m');
            }

            if (currentStar.lcIndex % 2 >= 0) currentStar.synth.triggerAttackRelease(note, '12n');
        } else if (currentStar.type == 'conga') {
            //triggered at different notes
            if (t % currentStar.vel == 0) {
                currentStar.synth.triggerAttackRelease(note, '48n');
            }
        } else if (currentStar.type == 'kick') {
            //triggered at different notes
            if (t % currentStar.vel == 0) {
                currentStar.synth.triggerAttackRelease(note, '48n');
            }
        } 
    }
    //triggered every 48th mesure.
    //console.log(Tone.Transport.position);
    t = t + 1;
}, "12n").start(0);
Tone.Transport.start();

