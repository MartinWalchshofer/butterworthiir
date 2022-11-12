import {FilterType, Filter, Butterworth} from "../src"

var samplingRate : number = 1000;
var filterOrder : number = 2;

var filt : Butterworth = new Butterworth(samplingRate, FilterType.Lowpass, filterOrder, [100] );
console.log(filt.Coefficients);

var filt : Butterworth = new Butterworth(samplingRate, FilterType.Highpass, filterOrder, [100] );
console.log(filt.Coefficients);

var filt : Butterworth = new Butterworth(samplingRate, FilterType.Bandpass, filterOrder, [100, 200] );
console.log(filt.Coefficients);

var filt : Butterworth = new Butterworth(samplingRate, FilterType.Notch, filterOrder, [48,52] );
console.log(filt.Coefficients);