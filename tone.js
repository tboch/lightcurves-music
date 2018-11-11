Tone.Transport.bpm.value = 100;
// http://tonejs.org/docs/#DuoSynth
var synth = new Tone.FMSynth();
//var synth = new Tone.PolySynth(6, Tone.Synth).toMaster();
synth.set({
            'envelope': 
                {
                    attack: 0.005,
                    decay: 0.3,
                    sustain: 0.1,
                    release: 0.05
                }
});


var gain  = new Tone.Gain(0.5);
synth.connect(gain);
gain.toMaster();

function playSoundForStars(stars) {
    if (!stars || stars.length==0) {
        return;
    }




    var tones = ['C3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5', 'D#5'];

    var mags = [];
    for (var k=0; k<stars.length; k++) {
        var star = stars[k];
        mags = mags.concat(star.mag_estimate);
    }

    var phases = stars[0].phase_estimate;

    var minMag = Math.min(...mags);
    var maxMag = Math.max(...mags);
    var sequenceDuration = 20;
    var durationSum = 0;
    var phaseElt = document.getElementById('phase');
    var counter = 0;
    var startingPhases = phases;
    for(var i = 0; i < phases.length-1; i++) {
        var startingPhase = startingPhases[i];

        var duration;
        duration = startingPhases[i + 1] - startingPhase;
        duration *= sequenceDuration;

        var notesToPlay = [];
        for (var k=0; k<stars.length; k++) {
            var star = stars[k];
            var noteIdx = Math.floor((tones.length-1) * (star.mag_estimate[i] - minMag) / (maxMag - minMag));
            var note = tones[tones.length-1-noteIdx];
            notesToPlay.push(note);
        }
        console.log('We re playing:', notesToPlay, duration, durationSum);
        synth.triggerAttackRelease(notesToPlay[0], duration/2, durationSum + Tone.Transport.toSeconds(Tone.Transport.ticks + "i"));

  
/*
        Tone.Transport.schedule(function(time){
        console.log('duration:', duration)
        console.log('trigger', time);
        console.log(time/sequenceDuration);

        phaseElt.innerHTML = startingPhases[counter];
        counter++;
  }, durationSum);
  */

        durationSum += duration;
    }
    console.log("sum, ", durationSum)
    Tone.Transport.start()
}


// END

    
var aladin = A.aladin('#aladin-lite-div', {target: 'sgr a*', fov: 10, cooFrame: 'galactic'});


aladin.on('objectClicked', function(object) {
  var sourceId = object.data.source_id;
  var period = object.data.pf;
  var xhr = new XMLHttpRequest();
  /*
  var query = 'SELECT g_transit_time,g_transit_mag FROM "I/345/transits" where source_id=' + source;
  var url = 'http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync?'
  url += '&request=doQuery&lang=adql&format=json&phase=run';
  url += '&query=' + encodeURIComponent(query);
  */
    console.log(period);
  var url = 'http://cds.unistra.fr/~boch/adass2018-hackathon/data/' + sourceId + '.json';
  window.open('http://cdsxmatch.u-strasbg.fr/gadgets/ifr?url=http://cdsxmatch.u-strasbg.fr/widgets/graphs_VizieR.xml&dataset_url_1=http%3A%2F%2Fcdsarc.u-strasbg.fr%2Fviz-bin%2Fvizgraph%3F-s%3DI%2F345%26-i%3D.graph_sql_lc%26Star%3D' + sourceId + '%26Per%3D' + period + '%26--output%3Dvotable&option_graph_title=I%2F345%20Light%20curves%20of%20source%20' + sourceId + '&option_axis_x_period=' + period +'&option_axis_x_min=0&option_axis_x_max=1&option_axis_x_label=&option_axis_y_min=11&option_axis_y_max=17&option_axis_y_label=&option_dataset_equation_-1=x&option_dataset_color_-1=blue&option_dataset_size_lines_-1=1&option_dataset_symbol_-1=circle&option_dataset_size_points_-1=1&option_dataset_x_axis_0=&x_err_0=none&option_dataset_y_axis_0=Gmag%20%5Bmag%5D&y_err_0=err&option_dataset_color_0=%2333CC00&option_dataset_size_lines_0=1&option_dataset_symbol_0=circle&option_dataset_size_points_0=1&option_dataset_x_axis_1=&x_err_1=none&option_dataset_y_axis_1=BPmag%20%5Bmag%5D&y_err_1=err&option_dataset_color_1=%230066FF&option_dataset_size_lines_1=1&option_dataset_symbol_1=circle&option_dataset_size_points_1=1&option_dataset_x_axis_2=&x_err_2=none&option_dataset_y_axis_2=RPmag%20%5Bmag%5D&y_err_2=err&option_dataset_color_2=%23D80000&option_dataset_size_lines_2=1&option_dataset_symbol_2=circle&option_dataset_size_points_2=1&option_axis_x_log=false&option_axis_x_reverse=false&option_axis_x_phase=true&option_axis_y_log=false&option_axis_y_reverse=true&option_dataset_serie_-1=false&option_dataset_lines_-1=true&option_dataset_points_-1=false&option_dataset_serie_0=true&option_dataset_lines_0=false&option_dataset_points_0=true&option_dataset_serie_1=true&option_dataset_lines_1=false&option_dataset_points_1=true&option_dataset_serie_2=true&option_dataset_lines_2=false&option_dataset_points_2=true', 'lightcurve', "height=800,width=700");


  xhr.open('GET', url, true);

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
      var starParam = JSON.parse(xhr.responseText);
      playSoundForStars([starParam]);
      console.log(starParam);
    }
    else if (xhr.status !== 200) {
        alert('Request failed.  Returned status of ' + xhr.status);
    }
  };
  xhr.send();
})

//aladin.addCatalog(A.catalogFromVizieR('I/345/gaia2', '12.5116686 -17.607493', 0.01, {onClick: 'showTable', color: 'red'}));
aladin.addCatalog(A.catalogFromURL('http://cds.unistra.fr/~boch/adass2018-hackathon/gaia-variable-sample.vot', {color: 'red', onClick: 'showTable'}));


