%this line is only required for octave uncomment if Matlab is used
pkg load signal

close all;

%load data processed with ts
data=csvread('data.csv');
dataFilt=csvread('dataFilt.csv');
dataFiltFilt=csvread('dataFiltFilt.csv');

%create and apply filter
samplingRate = 1000;
cutoffFrequency = 10;
order = 2;
[b,a] = butter(order,cutoffFrequency/(samplingRate/2));
dataFiltOctave = filter(b,a,data);
dataFiltFiltOctave = filtfilt(b,a,data);
if(abs(sum(sum(dataFilt-dataFiltOctave)))>1/1000000 )
  disp('Error: Octave & typescript filter results are not identical.');
else
  disp('Octave & typescript filter results are identical.');
end
if(abs(sum(sum(dataFiltFilt-dataFiltFiltOctave)))>1/1000000 )
  disp('Error: Octave & typescript filtfilt results are not identical.');
else
  disp('Octave & typescript filtfilt results are identical.');
end

%plot data
figure;
plot(data(:,1),'-b');
hold on;
plot(dataFilt(:,1),'-r','LineWidth',1);
plot(dataFiltFilt(:,1),'-g','LineWidth',1);
plot(dataFiltOctave(:,1),'--c','LineWidth',1);
plot(dataFiltFiltOctave(:,1),'--m','LineWidth',1);
axis([1 length(dataFilt) 100 200]);
legend('raw data','filter ts','filtfilt ts', 'filter octave', 'filtfilt octave');
ylabel('A');
xlabel('samples[n]');
figure;
plot(data);
title('input data');
ylabel('A');
xlabel('samples[n]');
figure;
plot(dataFilt);
title('ts filter');
ylabel('A');
xlabel('samples[n]');
axis([1 length(dataFilt) 100 200]);
figure;
plot(dataFiltOctave);
title('Octave filter')
ylabel('A');
xlabel('samples[n]');
axis([1 length(dataFiltOctave) 100 200]);
figure;
plot(dataFilt-dataFiltOctave);
title('diff');
ylabel('diff octave/ts');
xlabel('samples[n]');
figure;
plot(dataFiltFilt-dataFiltFiltOctave);
title('diff');
ylabel('diff octave/ts');
xlabel('samples[n]');