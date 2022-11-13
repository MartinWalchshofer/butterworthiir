import {FilterType, Filter, Butterworth} from "../src"
import * as fs from 'fs';

//filter configuration
var samplingRate : number = 1000;
var filterOrder : number = 2;
var type : FilterType = FilterType.Lowpass;
var cutoff : number[] = [10];

//generate testdata
var noiseAmplitude : number = 100;
var offset : number = 100;
var r : number = 10000;
var c : number = 10;
var data : number[][] = new Array(r);
for(var i : number = 0; i < r; i++) {
    data[i] = new Array(c);
}
for(var i : number = 0; i < r; i++) {
    for(var j : number = 0; j < c; j++) {
        data[i][j] = Math.random() 
        * noiseAmplitude    //amplitude
        + offset;           //offset
    }
}

//create filter
var filt : Butterworth = new Butterworth(samplingRate, type, filterOrder, cutoff );
console.log(filt.Coefficients);

//apply filter
var dataFilt : number[][] = Filter.filter(data, filt);

//apply filt filt
var dataFiltFilt : number[][] = Filter.filtfilt(data, filt);

//store data as csv
var dataCSV = data
  .map((item) => {
    var row = item;
    return row.join(",");
  })
  .join("\n");

var dataFiltCSV = dataFilt
  .map((item) => {
    var row = item;
    return row.join(",");
  })
  .join("\n");

var dataFiltFiltCSV = dataFiltFilt
  .map((item) => {
    var row = item;
    return row.join(",");
  })
  .join("\n");

fs.writeFile('./examples/data.csv', dataCSV,  function(err) {
    if (err) {
        return console.error(err);
    }
    console.log("Created data file.");
});

fs.writeFile('./examples/dataFilt.csv', dataFiltCSV,  function(err) {
    if (err) {
        return console.error(err);
    }
    console.log("Created dataFilt file.");
});

fs.writeFile('./examples/dataFiltFilt.csv', dataFiltFiltCSV,  function(err) {
  if (err) {
      return console.error(err);
  }
  console.log("Created dataFiltFiltfile.");
});