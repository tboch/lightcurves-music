var startPlayingStar = function (star) {
    if (!star || !star.params) {
        return;
    }
    var params = star.params;

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
            marker: { color: (star.id & 0xffffff).toString(16), size: 8 }
        },
        {
            x: [params.phase_estimate_2P[star.lcIndex]],
            y: [params.mag_estimate_2P[star.lcIndex]],
            mode: 'markers',
            marker: { color: '#7EE1F7', size: 8 }
        }
    ];
    Plotly.newPlot('lightcurve', d, {
        yaxis: { autorange: "reversed" },
        showlegend: false,
    });
};

// initialize Aladin Lite
var aladin = A.aladin('#aladin-lite-div', { target: 'sgr a*', fov: 10, cooFrame: 'galactic', survey: 'P/DSS2/red' });

var selectedStars = [];
// Set how we react when an object is clicked
aladin.on('objectClicked', function (object) {
    if (object == null) {
        selectedStars = [];
        Plotly.newPlot('lightcurve', [], {
            yaxis: { autorange: "reversed" },
            showlegend: false,
        });
        return;
    }
    var star = object.data;
    var sourceId = star.source_id;
    var period = star.pf;

    var xhr = new XMLHttpRequest();

    var url = 'http://cds.unistra.fr/~boch/adass2018-hackathon/data/' + sourceId + '.json';

    xhr.open('GET', url, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log(xhr.responseText);
            var data = JSON.parse(xhr.responseText);

            var phase_estimate = data.phase_estimate.slice(0, 48);
            var phase_estimate_2P = phase_estimate.concat(phase_estimate.map(function (x) { return 1 + x; }));

            var mag_estimate = data.mag_estimate.slice(0, 48);
            var mag_estimate_2P = mag_estimate.concat(mag_estimate);

            var mag_2P = data.mag.concat(data.mag);
            var phase_2P = data.phase.concat(data.phase.map(function (x) { return 1 + x; }));

            var newStar = {
                params: {
                    mag_2P: mag_2P,
                    phase_2P: phase_2P,
                    mag_estimate_2P: mag_estimate_2P,
                    phase_estimate_2P: phase_estimate_2P,
                    minMag: Math.min(...mag_estimate),
                    maxMag: Math.max(...mag_estimate)
                },
                id: sourceId,
                lcIndex: 0,
            };
            startPlayingStar(newStar);
            if (selectedStars.length == 0) {
                selectedStars.push(newStar);
            } else {
                selectedStars[0] = newStar;
            }
            console.log('star:', newStar);
        }
        else if (xhr.status !== 200) {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
})

// define custom draw function
var drawFunction = function (source, canvasCtx, viewParams) {
    canvasCtx.beginPath();
    canvasCtx.arc(source.x, source.y, 6, 0, 2 * Math.PI, false);
    canvasCtx.closePath();
    // assign color based on period
    var period = source.data.pf;
    if (period > 3) {
        period = 3;
    }
    canvasCtx.strokeStyle = '#' + Math.floor(0xffffff / (3 * period)).toString(16);

    canvasCtx.lineWidth = 5;
    canvasCtx.globalAlpha = 0.9,
        canvasCtx.stroke();

};

// load catalogue with positions of Gaia stars for which we have light curves
// draw function is too slow for that many sources :(
//aladin.addCatalog(A.catalogFromURL('http://cds.unistra.fr/~boch/adass2018-hackathon/gaia-variable-sample.vot', { shape:drawFunction, onClick: 'showTable' }));
aladin.addCatalog(A.catalogFromURL('http://cds.unistra.fr/~boch/adass2018-hackathon/gaia-variable-sample.vot', { color: 'red', onClick: 'showTable' }));


var notes = ['C3', 'D#3', 'F3', 'G#3', 'A#3', 'C4', 'D#4', 'F4', 'G#4', 'A#4', 'C5', 'D#5'];
//notes = ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4']; // minor pentatonic
//notes = ['C3', 'C3#', 'D3', 'D3#', 'E3', 'F3', 'F3#', 'G3', 'G3#', 'A3', 'A3#', 'B3', 'C4', 'C4#', 'D4', 'D4#', 'E4', 'F4', 'F4#', 'G4', 'G4#', 'A4', 'A4#', 'B4'];
notes = ['C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5'];
var chordsArray = [['F3', 'A3', 'D4'], ['B3', 'D4', 'G4'], ['C3', 'E3', 'A3'], ['A3', 'C4', 'F4']]; // veridis quo
chordsArray = [['G3', 'C4', 'E4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4', 'E4'], ['G3', 'A3', 'C4', 'F4']]; // 
//chordsArray = [['A3', 'C3', 'E4'], ['G3', 'B3', 'D4'], ['F3', 'A3', 'C4'], ['D3', 'F3', 'A3']];  // kavinsky

// Tone JS
Tone.Transport.bpm.value = 300;
//var synth = new Tone.DuoSynth();

var synth = new Tone.FMSynth();
synth.set({
    'envelope':
    {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.3,
        release: 0.1
    }
});

synth = new Tone.PluckSynth();

var synth = new Tone.MonoSynth({
    "oscillator": {
        "type": "square8"
    },
    "envelope": {
        "attack": 0.05,
        "decay": 0.3,
        "sustain": 0.4,
        "release": 0.8,
    },
    "filterEnvelope": {
        "attack": 0.001,
        "decay": 0.7,
        "sustain": 0.1,
        "release": 0.8,
        "baseFrequency": 300,
        "octaves": 4
    }
});

var synth = new Tone.FMSynth({
    "harmonicity": 1,
    "modulationIndex": 3.5,
    "carrier": {
        "oscillator": {
            "type": "custom",
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
            "type": "square"
        },
        "envelope": {
            "attack": 0.1,
            "decay": 0.2,
            "sustain": 0.3,
            "release": 0.01
        },
    }
})

synth.toMaster();

var piano = new Tone.PolySynth(4, Tone.Synth, {
    "volume": -2,
    "oscillator": {
        "partials": [1, 2, 5],
    },
    "portamento": 0.005
});
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


var loop = new Tone.Loop(function (time) {

    Tone.Draw.schedule(function () {

        //this callback is invoked from a requestAnimationFrame
        //and will be invoked close to AudioContext time
        for (var i = 0; i < selectedStars.length; i++) {
            var currentStar = selectedStars[i];
            currentStar.lcIndex++;
            currentStar.lcIndex = currentStar.lcIndex % 96;
            // Update plotly trace
            var update = {
                x: [currentStar.params.phase_estimate_2P[currentStar.lcIndex]],
                y: [currentStar.params.mag_estimate_2P[currentStar.lcIndex]],
                mode: 'markers',
                marker: { color: '#7EE1F7', size: 8 }
            }
            //Plotly.deleteTraces('lightcurve', 3 * i + 2);
            //Plotly.addTraces('lightcurve', update, 3 * i + 2);
        }
    }, time) //use AudioContext time of the event


    for (var k = 0; k < selectedStars.length; k++) {
        var currentStar = selectedStars[k];

        var noteIdx = Math.floor((notes.length - 1) * (currentStar.params.mag_estimate_2P[currentStar.lcIndex] - currentStar.params.minMag) / (currentStar.params.maxMag - currentStar.params.minMag));
        var note = notes[notes.length - 1 - noteIdx];

        var mesureIdx = parseInt(Tone.Transport.position.split(':')[0]) % 16;
        mesureIdx = Math.floor(mesureIdx / 4);
        if (currentStar.lcIndex % 48 == 0) {
            piano.triggerAttackRelease(chordsArray[mesureIdx], '4m');
        }

        if (currentStar.lcIndex % 2 == 0) synth.triggerAttackRelease(note, '6n');
    }
    //triggered every 48th mesure.
    //console.log(Tone.Transport.position);
}, "12n").start(0);
Tone.Transport.start();


