var playStar = function (starParameter) {
    var phase_estimateArray = starParameter.phase_estimate.slice(0, 48);
    var mag_estimateArray = starParameter.mag_estimate.slice(0, 48);

    var phase_2P = starParameter.phase.concat(starParameter.phase.map(function (x) { return 1 + x; }));
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
            y: starParameter.mag.concat(starParameter.mag),
            mode: 'markers',
            marker: { color: 'green', size: 8 }
        }
    ];
    Plotly.newPlot('lightcurve', data, { yaxis: { autorange: "reversed" } });
    //Plotly.relayout();

};

// initialize Aladin Lite
var aladin = A.aladin('#aladin-lite-div', { target: 'sgr a*', fov: 10, cooFrame: 'galactic', survey: 'P/DSS2/red' });

// Set how we react when an object is clicked
aladin.on('objectClicked', function (object) {
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
            var starParam = JSON.parse(xhr.responseText);
            playStar(starParam);
            console.log(starParam);
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
        console.log('update drawing');
        //this callback is invoked from a requestAnimationFrame
        //and will be invoked close to AudioContext time

    }, time) //use AudioContext time of the event

    //synth.triggerAttack('C4', '+0.05');
    //triggered every 12th note. 
    console.log(Tone.Transport.position);
}, "48n").start(0);
Tone.Transport.start();

