var playStar = function (star) {
    if (! star.params) {
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

var currentStar = {
    params: null,
    id: null,
    lcIndex: -1
};
// Set how we react when an object is clicked
aladin.on('objectClicked', function (object) {
    currentStar.lcIndex = 0;
    var sourceId = object.data.source_id;
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
            console.log(xhr.responseText);
            currentStar.params = JSON.parse(xhr.responseText);
            currentStar.id = sourceId;
            //playStar(currentStar);
        }
        else if (xhr.status !== 200) {
            alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr.send();
})

// load catalogue with positions of Gaia stars for which we have light curves
aladin.addCatalog(A.catalogFromURL('http://cds.unistra.fr/~boch/adass2018-hackathon/gaia-variable-sample.vot', { color: 'red', onClick: 'showTable' }));

var notes = ['C3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5', 'D#5'];
// Tone JS
Tone.Transport.bpm.value = 60;

var loop = new Tone.Loop(function (time) {

    Tone.Draw.schedule(function () {
        playStar(currentStar);
        console.log('update drawing');
        //this callback is invoked from a requestAnimationFrame
        //and will be invoked close to AudioContext time

    }, time) //use AudioContext time of the event

    currentStar.lcIndex++;
    currentStar.lcIndex = currentStar.lcIndex%96;
    //synth.triggerAttack('C4', '+0.05');
    //triggered every 12th note. 
    console.log(Tone.Transport.position);
}, "48n").start(0);
Tone.Transport.start();

