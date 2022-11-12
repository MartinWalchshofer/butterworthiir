%this line is only required for octave uncomment if Matlab is used
pkg load signal

close all;

%load data processed with ts
data=csvread('data.csv');
dataFilt=csvread('dataFilt.csv');

%create and apply filter
samplingRate = 1000;
cutoffFrequency = 10;
order = 2;
[b,a] = butter(order,cutoffFrequency/(samplingRate/2));
dataFiltOctave = filter(b,a,data);
if(abs(sum(sum(dataFilt-dataFiltOctave)))>1/1000000 )
  disp('Error: Octave & typescript results are not identical.');
else
  disp('Octave & typescript results are identical.');
end

%plot data
figure;
plot(data);
ylabel('A');
xlabel('samples[n]');
figure;
plot(dataFilt);
ylabel('A');
xlabel('samples[n]');
figure;
plot(dataFiltOctave);
ylabel('A');
xlabel('samples[n]');
figure;
plot(dataFilt-dataFiltOctave);
ylabel('diff octave/ts');
xlabel('samples[n]');
