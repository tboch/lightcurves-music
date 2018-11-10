Tone.Transport.bpm.value = 100;

// http://tonejs.org/docs/#DuoSynth
var synth = new Tone.DuoSynth();
var gain  = new Tone.Gain(0.5);
synth.connect(gain);
gain.toMaster();

synth.voice0.oscillator.type = 'triangle';
// synth.voice1.oscillator.type = 'triangle';

var stars = {"2369538890337581056": {"phase": [0.04479915581100794, 0.2067449955304341, 0.2711185148128382, 0.29455082617091055, 0.3215073421923412, 0.32684048294031237, 0.3361653923395087, 0.35968560488320583, 0.3615389838067129, 0.38655421971901166, 0.4265858613331835, 0.466104441305765, 0.47689459315224125, 0.5212273101108214, 0.5311513188324355, 0.541436109181315, 0.5419414706789117, 0.5766345568323161, 0.5864499900091412, 0.6064829867075857, 0.6416814343585868, 0.6630241235662255, 0.6716249733172647, 0.7411560770993955, 0.7545354462761151, 0.8013965177838611, 0.806202954626066, 0.8196702249886103, 0.8248703888224338, 0.8899172663491043], "mag": [15.492376, 15.752078, 15.78715, 15.82181, 15.820882, 15.832815, 15.821575, 15.829121, 15.815545, 15.828069, 15.826036, 15.829264, 15.835094, 15.841603, 15.892994, 15.869608, 15.897626, 15.927849, 15.924864, 15.89397, 15.461832, 14.964028, 14.994702, 14.801614, 14.897686, 15.105296, 15.020072, 15.135538, 15.070231, 15.231863]}}
var mags = stars["2369538890337581056"].mag;
var startingPhases = stars["2369538890337581056"].phase;

var minFreq = 200;
var maxFreq = 300;
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

  var note = maxFreq - ((maxFreq - minFreq)*((mags[i] - minMag)/(maxMag - minMag)));
  synth.triggerAttackRelease(note, duration, durationSum);
  Tone.Transport.schedule(function(time){
    console.log('duration:', duration)
    console.log('trigger', time);
    phaseElt.innerHTML = time;
  }, durationSum);
 
  durationSum += duration;
}
console.log("sum, ", durationSum)
Tone.Transport.start()

