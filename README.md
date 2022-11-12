# butterworthiir
A typescript implementation of a butterworth iir filter<br />

This library is based on mkfilter.c by Anthony J. Fisher, University of York, September 1992.<br />
see:<br />
http://www-users.cs.york.ac.uk/~fisher/mkfilter<br />
https://github.com/university-of-york/cs-www-users-fisher<br />

## run example
Run 'npx ts-node examples/butterworth.ts' from the root folder to execute the example script.<br />

## octave equivalent
Functionality can be validated with Octave.<br />

samplingRate = 1000;<br />
cutoffFrequency = 10;<br />
order = 2;<br />
[b,a] = butter(order,cutoffFrequency/(samplingRate/2));<br />
dataFiltOctave = filter(b,a,data);<br />