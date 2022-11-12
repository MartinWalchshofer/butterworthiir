# butterworthiir
A typescript implementation of a butterworth iir filter<br />

This library is based on mkfilter.c by Anthony J. Fisher, University of York, September 1992.<br />
see:<br />
http://www-users.cs.york.ac.uk/~fisher/mkfilter<br />
https://github.com/university-of-york/cs-www-users-fisher<br />

## run example
Run 'npx ts-node examples/filter_example.ts' or 'npx ts-node examples/create_filter_example.ts' from the root folder to execute the example script.<br />

## Octave/Matlab comparison
Functionality can be validated with Octave or Matlab.<br />
run 'filter_example_valid.m' in Matlab or octave after executing the typescript example 'filter_example.ts' to compare the behavior.
run 'create_filter_example_valid.m' in Matlab or octave after executing the typescript example 'create_filter_example.ts' to compare filter coefficients calculated with Octave/Matlab or typescript.