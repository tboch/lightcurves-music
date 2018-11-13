var updateLightCurve = function (star) {
    if (!star) {
        return;
    }
    var phase_estimateArray = star.params.phase_estimate.slice(0, 48);
    var mag_estimateArray = star.params.mag_estimate.slice(0, 48);

    var phase_2P = star.params.phase.concat(star.params.phase.map(function (x) { return 1 + x; }));
    var phase_estimate_2P = phase_estimateArray.concat(phase_estimateArray.map(function (x) { return 1 + x; }));


    var data = [
        {
            x: phase_estimate_2P,
            y: mag_estimateArray.concat(mag_estimateArray),
            mode: 'markers',
            marker: { color: 'pink', size: 4 }
        },
        {
            x: phase_2P,
            y: star.params.mag.concat(star.params.mag),
            mode: 'markers',
            marker: { color: 'green', size: 8 }
        },
        {
            x: [phase_estimate_2P[star.lcIndex]],
            y: [mag_estimateArray.concat(mag_estimateArray)[star.lcIndex]],
            mode: 'markers',
            marker: { color: '#7EE1F7', size: 8 }
        }
    ];
    Plotly.newPlot('lightcurve', data, { title: 'Gaia DR2 ' + star.id, showlegend: false, yaxis: { autorange: "reversed" } });
    //Plotly.relayout();

};

// initialize Aladin Lite
var aladin = A.aladin('#aladin-lite-div', { target: 'sgr a*', fov: 10, cooFrame: 'galactic', survey: 'P/DSS2/red' });

// list of stars playing, indexed by source_id
var musicians = [];
var currentStar = null;
// Set how we react when an object is clicked
aladin.on('objectClicked', function (object) {
    if (object == null) {
        currentStar = null;
        return;
    }
    var sourceId = object.data.source_id;
    if (musicians.hasOwnProperty(sourceId)) {
        return;
    }
    var period = object.data.pf;
    var xhr = new XMLHttpRequest();
    /*
    var query = 'SELECT g_transit_time,g_transit_mag FROM "I/345/transits" where source_id=' + source;
    var url = 'http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync?'
    url += '&request=doQuery&lang=adql&format=json&phase=run';
    url += '&query=' + encodeURIComponent(query);
    */
    var url = 'http://cds.unistra.fr/~boch/adass2018-hackathon/data/' + sourceId + '.json';


    xhr.open('GET', url, true);

    xhr.onload = function () {
        if (xhr.status === 200) {
            currentStar = {
                lcIndex: 0,
                params: JSON.parse(xhr.responseText),
                id: sourceId
            };

            currentStar.minMag = Math.min(...currentStar.params.mag_estimate);
            currentStar.maxMag = Math.max(...currentStar.params.mag_estimate);
            
            

            //playStar(currentStar);
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


var notes = ['C3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5', 'D#5'];
notes = ['A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4']; // minor pentatonic
// Tone JS
Tone.Transport.bpm.value = 300;
var synth = new Tone.Synth().toMaster();
var piano = new Tone.PolySynth(4, Tone.Synth, {
    "volume" : -1,
    "oscillator" : {
        "partials" : [1, 2, 5],
    },
    "portamento" : 0.005
}).toMaster();
var loop = new Tone.Loop(function (time) {

    Tone.Draw.schedule(function () {
        updateLightCurve(currentStar);
        //console.log('update drawing');
        //this callback is invoked from a requestAnimationFrame
        //and will be invoked close to AudioContext time

    }, time) //use AudioContext time of the event


    if (currentStar) {
        if (currentStar.lcIndex % 12 ==0) {
            piano.triggerAttackRelease(['C3', 'E3', 'A3'], '1n');
        }
        currentStar.lcIndex++;
        currentStar.lcIndex = currentStar.lcIndex % 96;
        var i = currentStar.lcIndex % 48;
        var noteIdx = Math.floor((notes.length - 1) * (currentStar.params.mag_estimate[i] - currentStar.minMag) / (currentStar.maxMag - currentStar.minMag));
        var note = notes[notes.length - 1 - noteIdx];
        synth.triggerAttackRelease(note, '+0.01');
    }
    //triggered every 48th mesure. 
    //console.log(Tone.Transport.position);
}, "12n").start(0);
Tone.Transport.start();


