Tone.Transport.bpm.value = 100;

// http://tonejs.org/docs/#DuoSynth
var synth = new Tone.FMSynth();
var gain  = new Tone.Gain(0.5);
//synth.oscillator = new Tone.OmniOscillator('C4', 'pwm');
synth.connect(gain);
gain.toMaster();

//synth.voice0.oscillator.type = 'triangle';
// synth.voice1.oscillator.type = 'triangle';

var stars = {"2369538890337581056": {"phase": [0.04479915581100794, 0.2067449955304341, 0.2711185148128382, 0.29455082617091055, 0.3215073421923412, 0.32684048294031237, 0.3361653923395087, 0.35968560488320583, 0.3615389838067129, 0.38655421971901166, 0.4265858613331835, 0.466104441305765, 0.47689459315224125, 0.5212273101108214, 0.5311513188324355, 0.541436109181315, 0.5419414706789117, 0.5766345568323161, 0.5864499900091412, 0.6064829867075857, 0.6416814343585868, 0.6630241235662255, 0.6716249733172647, 0.7411560770993955, 0.7545354462761151, 0.8013965177838611, 0.806202954626066, 0.8196702249886103, 0.8248703888224338, 0.8899172663491043], "mag": [15.492376, 15.752078, 15.78715, 15.82181, 15.820882, 15.832815, 15.821575, 15.829121, 15.815545, 15.828069, 15.826036, 15.829264, 15.835094, 15.841603, 15.892994, 15.869608, 15.897626, 15.927849, 15.924864, 15.89397, 15.461832, 14.964028, 14.994702, 14.801614, 14.897686, 15.105296, 15.020072, 15.135538, 15.070231, 15.231863]}};
var starsEstimate = {"2369538890337581056": {"phase": [0.0, 0.017939017519748954, 0.03587803503949791, 0.05381705255924686, 0.07175607007899582, 0.08969508759874475, 0.10763410511849372, 0.12557312263824266, 0.14351214015799163, 0.16145115767774057, 0.1793901751974895, 0.19732919271723848, 0.21526821023698745, 0.23320722775673636, 0.2511462452764853, 0.26908526279623424, 0.28702428031598326, 0.3049632978357322, 0.32290231535548114, 0.3408413328752301, 0.358780350394979, 0.376719367914728, 0.39465838543447695, 0.4125974029542259, 0.4305364204739749, 0.44847543799372386, 0.4664144555134727, 0.4843534730332217, 0.5022924905529706, 0.5202315080727197, 0.5381705255924685, 0.5561095431122175, 0.5740485606319665, 0.5919875781517154, 0.6099265956714645, 0.6278656131912133, 0.6458046307109623, 0.6637436482307112, 0.6816826657504602, 0.6996216832702091, 0.717560700789958, 0.7354997183097071, 0.753438735829456, 0.771377753349205, 0.7893167708689539, 0.8072557883887028, 0.8251948059084518, 0.8431338234282008, 0.8610728409479498, 0.8790118584676987], "mag": [15.291923555245404, 15.39119332240142, 15.47616963087816, 15.545927408697537, 15.601620669995697, 15.645286083550644, 15.678902093157461, 15.70439005654174, 15.723619457862299, 15.738412993092766, 15.750551538722107, 15.76179143462224, 15.773930649882118, 15.788767045719283, 15.807096067202963, 15.820656087767304, 15.825328347534821, 15.824651960547953, 15.82416485348, 15.825601354495916, 15.826174028395542, 15.826415736911542, 15.827512413969316, 15.830087764584505, 15.834828530464108, 15.846839028643615, 15.873904108551585, 15.910257817123863, 15.93652744521421, 15.915701172167758, 15.792914248405225, 15.543336718790613, 15.221697071019832, 14.955457772125385, 14.812350011840579, 14.76772609884182, 14.798249348463116, 14.878394015284243, 14.966446942780749, 15.040149210238724, 15.090646189036875, 15.132966952656375, 15.176424384787424, 15.212747101257548, 15.23266515310928, 15.231389292449933, 15.210053216710207, 15.170117924693159, 15.112964672572389, 15.039898841964373]}};
//var mags = stars["2369538890337581056"].mag;
var mags = starsEstimate["2369538890337581056"].mag;
//var startingPhases = stars["2369538890337581056"].phase;
var startingPhases = starsEstimate["2369538890337581056"].phase;

//var tones = ['C2', 'D2', 'E2', 'F#2', 'G#2', 'A#3', 'C3', 'D3', 'E3', 'F#3', 'G#3', 'A#4', 'C4', 'D4', 'E4', 'F#4', 'G#4'];
//var tones = ['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2','A3', 'A#3', 'B3'];
//var tones = ['C3', 'D3', 'E3', 'F3', 'G3', 'A4', 'B4'];
//var tones = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3'];
var tones = ['C3', 'D#3', 'F3', 'G3', 'G#3', 'A#3', 'C4', 'D#4', 'F4', 'G4', 'G#4', 'A#4'];

var minFreq = 200;
var maxFreq = 400;
var minMag = Math.min(...mags);
var maxMag = Math.max(...mags);
var sequenceDuration = 5;
var durationSum = 0;
var phaseElt = document.getElementById('phase');
for(var i = 0; i < mags.length; i++) {
  var startingPhase = startingPhases[i];

  var duration;
  if (i==mags.length-1) {
    duration = (1-startingPhase) + startingPhases[0];
  }
  else {
    duration = startingPhases[i + 1] - startingPhase;
  }
  duration *= sequenceDuration;

    /*
  var note = maxFreq - ((maxFreq - minFreq)*((mags[i] - minMag)/(maxMag - minMag)));
    note = Tone.Frequency(note).toNote()
    console.log(note);
    */
  var noteIdx = Math.floor((tones.length-1) * (mags[i] - minMag) / (maxMag - minMag));
    console.log('noteIdx', noteIdx);
  var note = tones[tones.length-1-noteIdx];
  console.log(note);
  console.log(tones.length-1-noteIdx);
  synth.triggerAttackRelease(note, duration/2., durationSum);
  Tone.Transport.schedule(function(time){
    console.log('duration:', duration)
    console.log('trigger', time);
    phaseElt.innerHTML = time;
  }, durationSum);
 
  durationSum += duration;
}
console.log("sum, ", durationSum)
Tone.Transport.start()

    
var aladin = A.aladin('#aladin-lite-div', {target: '12.5116686 -17.607493', fov: 0.01});

var source;

aladin.on('objectClicked', function(object) {
  source = object.data.Source;
  var xhr = new XMLHttpRequest();
  var query = 'SELECT g_transit_time,g_transit_mag FROM "I/345/transits" where source_id=' + source;
  var url = 'http://tapvizier.u-strasbg.fr/TAPVizieR/tap/sync?'
  url += '&request=doQuery&lang=adql&format=json&phase=run';
  url += '&query=' + encodeURIComponent(query);

  console.log('query to vizier, ', query);

  xhr.open('GET', url, true);

  xhr.onload = function() {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
      var json = JSON.parse(xhr.responseText);
      console.log(json);
    }
    else if (xhr.status !== 200) {
        alert('Request failed.  Returned status of ' + xhr.status);
    }
  };
  xhr.send();
})

aladin.addCatalog(A.catalogFromVizieR('I/345/gaia2', '12.5116686 -17.607493', 0.01, {onClick: 'showTable'}));

