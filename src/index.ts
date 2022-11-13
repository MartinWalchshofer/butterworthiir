/**
This library is based on mkfilter.c by Anthony J. Fisher, University of York, September 1992.
see:
http://www-users.cs.york.ac.uk/~fisher/mkfilter
https://github.com/university-of-york/cs-www-users-fisher
*/

/**
 * Enumeration containing available filter types.
 */
export enum FilterType
{
    Lowpass,
    Highpass,
    Bandpass,
    Notch
}

/**
 * Filter coefficients
 */
export class FilterCoefficients
{
    a : number[];
    b : number[];

    /**
     * Initializes a new instance of @see FilterCoefficient.
     * @param a a coefficients.
     * @param b b coefficients.
     */
    constructor(a : number[], b : number[]) {
      this.a = a;
      this.b = b;
    }
}

/**
 * Class to calculate Butterworth IIR filter coefficients.
 */
export class Butterworth{
    
    //#region  private members...

    #Cmone: Complex = new Complex(-1.0, 0.0);
    #Czero: Complex = new Complex(0.0, 0.0);
    #Cone: Complex= new Complex(1.0, 0.0);
    #Ctwo: Complex  = new Complex (2.0, 0.0);
    #Chalf: Complex = new Complex(0.5, 0.0);

    //#endregion

    //#region  public members...

    Coefficients : FilterCoefficients;

    //#endregion

    /**
     * Initializes a new instance of @see Butterworth.
     * @param samplingRate The sampling rate of the signal.
     * @param type Parameter to select the filter behavior @see FilterType.
     * @param order The filter order.
     * @param cutoffFrequencies An array with one filter cutoff frequency for @see FilterType.Highpass and @see FilterType.Lowpass. An array with two filter cutoff frequencies for @type FilterType.Bandpass and @type FilterType.Notch.
     */
    constructor(samplingRate : number, type : FilterType, order : number, cutoffFrequencies : number[]) {
        var cutoffLow : number = -1;
        var cutoffHigh : number = -1;
        if((type == FilterType.Lowpass ||  type == FilterType.Highpass) && cutoffFrequencies.length != 1)
            throw new Error("Only one cutoff frequency allowed for low- and highpass filters.");

        if ((type == FilterType.Bandpass || type == FilterType.Notch) && cutoffFrequencies.length != 2)
            throw new Error("Two cutoff frequencies required for bandpass and notch filters.");

        var cutoffLow : number = cutoffFrequencies[0];
        if(type == FilterType.Bandpass || type == FilterType.Notch)
            var cutoffHigh : number = cutoffFrequencies[1];

        if ((type == FilterType.Bandpass || type == FilterType.Notch) && cutoffLow >= cutoffHigh)
        throw new Error("Lower cutoff frequency mut be lower than higher cutoff frequency");

        if ((type == FilterType.Lowpass || type == FilterType.Highpass) && cutoffHigh != -1)
            throw new Error("Only lower cutoff frequency must be set for low- or highpass filter types.");

        if ((type == FilterType.Lowpass || type == FilterType.Highpass) && cutoffLow > samplingRate/2)
            throw new Error("Cutoff must be lower than half of the sampling rate.");

        if ((type == FilterType.Bandpass || type == FilterType.Notch) && (cutoffLow > samplingRate/2 || cutoffHigh > samplingRate/2))
            throw new Error("Cutoff must be lower than half of the sampling rate.");

        //set defaults
        var numpoles : number = 0;

        var size : number = 0;
        if (type == FilterType.Bandpass || type == FilterType.Notch)
            size = 2 * order;
        else
            size = order;

        var spoles : Complex[] = new Array(size);
        var zpoles : Complex[] = new Array(size);
        var zzeros : Complex[] = new Array(size);

        //compute s
        for (var i : number = 0; i < 2 * order; i++) {
            var s : Complex = new Complex(0.0, (order & 1) == 1 ? (i * Math.PI) / order : ((i + 0.5) * Math.PI) / order);
            var z : Complex = this.#cexp(s);
            if (z.Real < 0.0)
                spoles[numpoles++] = z;
        }

        //normalize
        var rawAlpha1 : number = 0.0;
        var rawAlpha2 : number = 0.0;
        rawAlpha1 = cutoffLow / samplingRate;
        if (type == FilterType.Bandpass || type == FilterType.Notch)
            rawAlpha2 = cutoffHigh / samplingRate;
        else
            rawAlpha2 = rawAlpha1;

        var warpedAlpha1 : number = Math.tan(Math.PI * rawAlpha1) / Math.PI;
        var warpedAlpha2 : number = Math.tan(Math.PI * rawAlpha2) / Math.PI;

        var w1 : Complex = new Complex(2.0 * Math.PI * warpedAlpha1, 0.0);
        var w2 : Complex = new Complex(2.0 * Math.PI * warpedAlpha2, 0.0);
        var w0 : Complex = this.#Czero;
        var bw : Complex = this.#Czero;

        switch (type) {
            case FilterType.Lowpass:
                for (var i : number = 0; i < numpoles; i++)
                    spoles[i] = this.#cmul(spoles[i], w1);
                break;

            case FilterType.Highpass:
                for (var i : number = 0; i < numpoles; i++)
                    spoles[i] = this.#cdiv(w1, spoles[i]);
                break;

            case FilterType.Bandpass:
                w0 = this.#csqrt(this.#cmul(w1, w2));
                bw = this.#csub(w2, w1);
                for (var i : number = 0; i < numpoles; i++) {
                    var hba : Complex = this.#cmul(this.#Chalf, this.#cmul(spoles[i], bw));
                    var temp : Complex = this.#cdiv(w0, hba);
                    temp = this.#csqrt(this.#csub(this.#Cone, this.#cmul(temp, temp)));
                    spoles[i] = this.#cmul(hba, this.#cadd(this.#Cone, temp));
                    spoles[numpoles + i] = this.#cmul(hba, this.#csub(this.#Cone, temp));
                }
                numpoles *= 2;
                break;

            case FilterType.Notch:
                w0 = this.#csqrt(this.#cmul(w1, w2));
                bw = this.#csub(w2, w1);
                for (var i : number = 0; i < numpoles; i++) {
                    var hba : Complex = this.#cmul(this.#Chalf, this.#cdiv(bw, spoles[i]));
                    var temp : Complex = this.#cdiv(w0, hba);
                    temp = this.#csqrt(this.#csub(this.#Cone, this.#cmul(temp, temp)));
                    spoles[i] = this.#cmul(hba, this.#cadd(this.#Cone, temp));
                    spoles[numpoles + i] = this.#cmul(hba, this.#csub(this.#Cone, temp));
                }
                numpoles *= 2;
                break;

            default:
                throw new Error("Unknown filter type");
        }

        //compute z
        for (var i : number = 0; i < numpoles; i++) {
            var top : Complex = this.#cadd(this.#Ctwo, spoles[i]);
            var bot : Complex = this.#csub(this.#Ctwo, spoles[i]);
            zpoles[i] = this.#cdiv(top, bot);
            switch (type) {
                case FilterType.Lowpass:
                    zzeros[i] = this.#Cmone;
                    break;
                case FilterType.Highpass:
                    zzeros[i] = this.#Cone;
                    break;
                case FilterType.Bandpass:
                    if (i % 2 == 0)
                        zzeros[i] = this.#Cone;
                    else
                        zzeros[i] = this.#Cmone;
                    break;
                case FilterType.Notch:
                    if (i % 2 == 0)
                        zzeros[i] = new Complex(Math.cos(2 * Math.PI * ((cutoffHigh + cutoffLow)/2) / samplingRate), Math.sin(2 * Math.PI * ((cutoffHigh + cutoffLow) / 2) / samplingRate));
                    else
                        zzeros[i] = new Complex(Math.cos(2 * Math.PI * ((cutoffHigh + cutoffLow)/2) / samplingRate), -Math.sin(2 * Math.PI * ((cutoffHigh + cutoffLow) / 2) / samplingRate));
                    break;
                default:
                    throw new Error("Unknown filter type");
            }
        }

        //expand poly
        var topCoeffs : Complex[] = new Array(numpoles + 1);
        var botCoeffs : Complex[] = new Array(numpoles + 1);
        var a :number[] = new Array(numpoles + 1);
        var b :number[] = new Array(numpoles + 1);
        this.#expand(zzeros, topCoeffs, numpoles);
        this.#expand(zpoles, botCoeffs, numpoles);

        var FCgain : Complex = this.#Cone;
        if (type != FilterType.Notch) {
            var st : Complex = new Complex(0.0, Math.PI * (rawAlpha1 + rawAlpha2));
            var zfc : Complex = this.#cexp(st);
            FCgain = this.#evaluate(topCoeffs, botCoeffs, numpoles, zfc);
        }
        else
            FCgain = this.#evaluate(topCoeffs, botCoeffs, numpoles, this.#Cone);

        for (var i : number = 0; i <= numpoles; i++) {
            if(type == FilterType.Highpass ||  type == FilterType.Lowpass)
                b[i] = topCoeffs[i].Real / botCoeffs[numpoles].Real / FCgain.Magnitude / Math.sqrt(2);
            else
                b[i] = topCoeffs[i].Real / botCoeffs[numpoles].Real / FCgain.Magnitude;
            a[i] = botCoeffs[i].Real / botCoeffs[numpoles].Real;              
        }

        this.Coefficients = new FilterCoefficients(a.reverse(), b.reverse());
    }

    #expand(pz : Complex[], coeffs : Complex[] , numpoles : number) {
        coeffs[0] = this.#Cone;
        for (var i = 0; i < numpoles; i++)
            coeffs[i + 1] = this.#Czero;
        for (var i = 0; i < numpoles; i++)
            this.#multin(pz[i], coeffs, numpoles);

        for (var i = 0; i < numpoles + 1; i++) {
            if (Math.abs(coeffs[i].Imaginary) > 1e-10)
                throw new Error("Filter calculation failed. Coefficients of z^k not real.");
        }
    }

    #multin(w : Complex, coeffs : Complex[], numpoles : number) {
        var nw = this.#cneg(w);
        for (var i = numpoles; i >= 1; i--)
            coeffs[i] = this.#cadd(this.#cmul(nw, coeffs[i]), coeffs[i - 1]);

        coeffs[0] = this.#cmul(nw, coeffs[0]);
    }
  
    #evaluate(topco : Complex[], botco : Complex[], np : number, z : Complex) {
        return this.#cdiv(this.#eval(topco, np, z), this.#eval(botco, np, z));
    }
  
    #eval(coeffs : Complex[], np : number, z : Complex) {
        var sum : Complex = this.#Czero;
        for (var i=np; i >= 0; i--)
            sum = this.#cadd(this.#cmul(sum, z), coeffs[i]);
        return sum;
    }
  
    #xsqrt(x : number) {
        return (x >= 0.0) ? Math.sqrt(x) : 0.0;
    }
  
    #csqrt(x : Complex) {
        var r : number = Math.sqrt(Math.pow(x.Real,2) + Math.pow(x.Imaginary,2));
        var real : number = this.#xsqrt(0.5 * (r + x.Real));
        var imag : number = this.#xsqrt(0.5 * (r - x.Real));
        if (x.Imaginary< 0.0)
            imag = -imag;
        return new Complex(real, imag);
    }
  
    #cexp(x : Complex) {  
        var r : number = Math.exp(x.Real);
        return new Complex(r * Math.cos(x.Imaginary), r * Math.sin(x.Imaginary));
    }
  
    #cadd(x : Complex, y : Complex) {
        return new Complex(x.Real + y.Real, x.Imaginary + y.Imaginary);
    }
  
    #csub(x : Complex, y : Complex) {
        return new Complex(x.Real - y.Real, x.Imaginary - y.Imaginary);
    }
  
    #cmul(x : Complex, y : Complex) { 
        return new Complex((x.Real * y.Real - x.Imaginary * y.Imaginary), (x.Imaginary * y.Real + x.Real * y.Imaginary));
    }
  
    #cdiv(x : Complex, y : Complex) {
        var mag : number = y.Real * y.Real + y.Imaginary * y.Imaginary;
        return new Complex((x.Real * y.Real + x.Imaginary * y.Imaginary) / mag, (x.Imaginary * y.Real - x.Real * y.Imaginary) / mag);
    }
  
    #cneg(x : Complex) {
        return this.#csub(this.#Czero, x);
    }
}

export class Filter
{
    /**
     * Applies a filter to the input data.
     * @param data 2D Array structured as [samples, channels].
     * @param filt A filter object @see Butterworth.
     * @returns Filtered data.
     */
    static filter(data : number[][], filt : Butterworth) {
        return this.#filt(data,filt,false, false);
    }

    /**
     * Applies a filter to the input data twice; forwards and backwards.
     * @param data 2D Array structured as [samples, channels].
     * @param filt A filter object @see Butterworth.
     * @returns Filtered data.
     */
    static filtfilt(data : number[][], filt : Butterworth)
    {
        return this.#filt(data,filt,true, false);
    }

    static #filt(data : number[][], filt : Butterworth, filtfilt : boolean, offsetCorrection :boolean) {
        var rows : number = data.length;
        var columns : number = data[0].length;
        var coeff : FilterCoefficients = filt.Coefficients;

        //allocate buffers
        var dataOut : number[][] = new Array(rows);
        for(var i : number = 0; i < rows; i++){
            dataOut[i] = new Array(columns);
        }
        
        if(coeff.a.length  != coeff.b.length)
            throw new Error("Invalid filter coefficients.");

        var numberOfCoefficients : number = coeff.a.length;
        var x : number[][] = new Array(numberOfCoefficients);
        var y : number[][] = new Array(numberOfCoefficients);
        for(var i : number = 0; i < numberOfCoefficients;i++) {
            x[i] = new Array(columns);
        }

        for(var i : number = 0; i < numberOfCoefficients;i++) {
            y[i] = new Array(columns);
        }

        var xyr : number = x.length;
        var xyc : number = x[0].length;
        for(var i :number = 0; i < xyr; i ++) {
            for(var j : number = 0; j < xyc; j++) {
                if(offsetCorrection) {
                    x[i][j] = data[0][0];
                    y[i][j] = data[0][0];
                }
                else
                {
                    x[i][j] = 0;
                    y[i][j] = 0;
                }             
            }
        }
        
        //filter
        for(var c : number = 0; c < columns; c++) {
            for(var r : number = 0; r < rows; r++) {
                //shift buffer
                for (var i : number = 0; i < numberOfCoefficients - 1; i++){
                    x[i][c] = x[i + 1][c];
                    y[i][c] = y[i + 1][c];
                }

                //transfer function
                x[numberOfCoefficients - 1][c] = data[r][c];
                y[numberOfCoefficients - 1][c] = coeff.b[0] * x[numberOfCoefficients - 1][c];
                for (var i : number = 1; i < numberOfCoefficients; i++){
                    y[numberOfCoefficients - 1][c] = y[numberOfCoefficients - 1][c] + coeff.b[i] * x[numberOfCoefficients - 1 - i][c] - coeff.a[i] * y[numberOfCoefficients - 1 - i][c];
                }
                dataOut[r][c] = y[numberOfCoefficients - 1][c];
            }
        }

        //filter reverse
        if(filtfilt){
            for(var c : number = columns - 1; c >= 0; c--) {
                for(var r : number = rows - 1; r >= 0; r--) {
                    //shift buffer
                    for (var i : number = 0; i < numberOfCoefficients - 1; i++){
                        x[i][c] = x[i + 1][c];
                        y[i][c] = y[i + 1][c];
                    }

                    //transfer function
                    x[numberOfCoefficients - 1][c] = dataOut[r][c];
                    y[numberOfCoefficients - 1][c] = coeff.b[0] * x[numberOfCoefficients - 1][c];
                    for (var i : number = 1; i < numberOfCoefficients; i++){
                        y[numberOfCoefficients - 1][c] = y[numberOfCoefficients - 1][c] + coeff.b[i] * x[numberOfCoefficients - 1 - i][c] - coeff.a[i] * y[numberOfCoefficients - 1 - i][c];
                    }
                    dataOut[r][c] = y[numberOfCoefficients - 1][c];
                }
            }
        }

        return dataOut;
    }
}

export class RealtimeFilter
{
    constructor(coefficients : FilterCoefficients) {
        throw Error("not implemented yet");
    }

    step(data : number[][]) {
        throw Error("not implemented yet");
    }
}

class Complex {
    Real : number;
    Imaginary : number;
    Magnitude : number;

    constructor(real : number, imaginary : number) {
      this.Real = real;
      this.Imaginary = imaginary;
      this.Magnitude = Math.sqrt(Math.pow(this.Real,2) +  Math.pow(this.Imaginary,2));
    }
}