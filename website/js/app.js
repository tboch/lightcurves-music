var startPlayingStar = function (star) {
    if (! star.params) {
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
   	showLegend: false, 
    });
};

// initialize Aladin Lite
var aladin = A.aladin('#aladin-lite-div', { target: 'sgr a*', fov: 10, cooFrame: 'galactic', survey: 'P/DSS2/red' });


var selectedStars = [];
// Set how we react when an object is clicked
aladin.on('objectClicked', function (object) {
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

// load catalogue with positions of Gaia stars for which we have light curves
aladin.addCatalog(A.catalogFromURL('http://cds.unistra.fr/~boch/adass2018-hackathon/gaia-variable-sample.vot', { color: 'red', onClick: 'showTable' }));

var notes = ['C3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5', 'D#5'];
// Tone JS
Tone.Transport.bpm.value = 60;

var loop = new Tone.Loop(function (time) {

    Tone.Draw.schedule(function () {
        //playStar(currentStar);
	console.log('update drawing');
        //this callback is invoked from a requestAnimationFrame
        //and will be invoked close to AudioContext time
	for (var i = 0; i < selectedStars.length; i++) {
	    var currentStar = selectedStars[i];
	    currentStar.lcIndex++;
	    currentStar.lcIndex = currentStar.lcIndex%96;
	    // Update plotly trace
	    var update = {
		x: [currentStar.params.phase_estimate_2P[currentStar.lcIndex]],
		y: [currentStar.params.mag_estimate_2P[currentStar.lcIndex]],
		mode: 'markers',
            	marker: { color: '#7EE1F7', size: 8 }
	    }
	    Plotly.deleteTraces('lightcurve', 3*i + 2);
    	    Plotly.addTraces('lightcurve', update, 3*i+2);
	}
    }, time) //use AudioContext time of the event
    //synth.triggerAttack('C4', '+0.05');
    //triggered every 12th note. 
    console.log(Tone.Transport.position);
}, "48n").start(0);
Tone.Transport.start();

