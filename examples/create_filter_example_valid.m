%create filters
samplingRate = 1000;
order = 2;
[blp,alp] = butter(order,100/(samplingRate/2),'low')
[bhp,ahp] = butter(order,100/(samplingRate/2),'high')
[bbp,abp] = butter(order,[100,200]/(samplingRate/2),'bandpass')
[bn,an] = butter(order,[48,52]/(samplingRate/2),'stop')