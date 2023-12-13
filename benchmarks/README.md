## Benchmarks
For my seminar paper I evaluated some benchmarks for the programs I wrote as well as some from the paper itself.

These were evaluated with this script.

### Requirements
The script requires the installed `sketch` tool as well as `bc`.

### Usage

```bash
# Define how many iterations the benchmarks
# should run on (I used 100)
NUMBER_OF_RUNS=100

# Define how many warmup runs should be
# made before logging the results
# If not given, one round is chosen
NUMBER_OF_WARMUP_RUNS=10

chmod +x benchmarks.sh
./benchmarks.sh $NUMBER_OF_RUNS $NUMBER_OF_WARMUP_RUNS
```

### Reproducibility
I ran these benchmarks on my Lenovo Yoga S740. The examples I used, as stated in the results, where:

```
Fibonacci.sk
HelloWorld.sk
InplaceSwap_Repeat.sk
InplaceSwap.sk
LeastSig0Bit.sk
LeastSig1Bit_Generator.sk
ListReverse.sk
```


### Results

#### First run
```
TOTAL RUNS = 100
SKIPPED RUNS = 1
Fibonacci.sk: AVG: 4433.13, TOTAL: 443313
HelloWorld.sk: AVG: 504.89, TOTAL: 50489
InplaceSwap.sk: AVG: 633.83, TOTAL: 63383
InplaceSwap_Repeat.sk: AVG: 889.67, TOTAL: 88967
LeastSig0Bit.sk: AVG: 894.70, TOTAL: 89470
LeastSig1Bit_Generator.sk: AVG: 6440.40, TOTAL: 644040
ListReverse.sk: AVG: 6635.09, TOTAL: 663509
```

#### Second run:

```
TOTAL RUNS = 100
SKIPPED RUNS = 1
Fibonacci.sk: AVG: 4095.63, TOTAL: 409563
HelloWorld.sk: AVG: 423.97, TOTAL: 42397
InplaceSwap.sk: AVG: 519.29, TOTAL: 51929
InplaceSwap_Repeat.sk: AVG: 699.19, TOTAL: 69919
LeastSig0Bit.sk: AVG: 705.48, TOTAL: 70548
LeastSig1Bit_Generator.sk: AVG: 5205.45, TOTAL: 520545
ListReverse.sk: AVG: 5719.44, TOTAL: 571944
```

* [Results](img/run2/results.txt)
* [Poorly written code for generating graphics](main.py)

![LineGraph](img/run2/line_graph.png)

**Fibonacci.sk**
> ![FibBox](img/run2/Fibonacci.sk_boxplot.png)
> ![FibHist](img/run2/Fibonacci.sk_histogram.png)

**ListReverse.sk**
> ![ListBox](img/run2/ListReverse.sk_boxplot.png)
> ![ListHist](img/run2/ListReverse.sk_histogram.png)

**LeastSig1Bit_Generator.sk**
>![LeastSig1Box](img/run2/LeastSig1Bit_Generator.sk_boxplot.png)
> ![LeastSig1Hist](img/run2/LeastSig1Bit_Generator.sk_histogram.png)

**LeastSig0Bit.sk**
> ![LeastSig0Box](img/run2/LeastSig0Bit.sk_boxplot.png)
> ![LeastSig0Hist](img/run2/LeastSig0Bit.sk_histogram.png)

**HelloWorld.sk**
> ![HelloWorldBox](img/run2/HelloWorld.sk_boxplot.png)
> ![HelloWorldHist](img/run2/HelloWorld.sk_histogram.png)

**InplaceSwap.sk**
> ![InplaceSwapBox](img/run2/InplaceSwap.sk_boxplot.png)
> ![InplaceSwapHist](img/run2/InplaceSwap.sk_histogram.png)

**InplaceSwap_Repeat.sk**
> ![InplaceSwapRBox](img/run2/InplaceSwap_Repeat.sk_boxplot.png)
> ![InplaceSwapRHist](img/run2/InplaceSwap_Repeat.sk_histogram.png)

#### Third run

> **Note:**
>
> Here I introduced 10 warmup rounds instead of 1.

```
TOTAL RUNS = 100
SKIPPED RUNS = 10
Fibonacci.sk: AVG: 2928.50, TOTAL: 292850
HelloWorld.sk: AVG: 345.40, TOTAL: 34540
InplaceSwap.sk: AVG: 421.70, TOTAL: 42170
InplaceSwap_Repeat.sk: AVG: 548.22, TOTAL: 54822
LeastSig0Bit.sk: AVG: 566.61, TOTAL: 56661
LeastSig1Bit_Generator.sk: AVG: 4422.39, TOTAL: 442239
ListReverse.sk: AVG: 4569.76, TOTAL: 456976
```

* [Results](img/run3/results.txt)

![LineGraph](img/run3/line_graph.png)

**Fibonacci.sk**
> ![FibBox](img/run3/Fibonacci.sk_boxplot.png)
> ![FibHist](img/run3/Fibonacci.sk_histogram.png)

**ListReverse.sk**
> ![ListBox](img/run3/ListReverse.sk_boxplot.png)
> ![ListHist](img/run3/ListReverse.sk_histogram.png)

**LeastSig1Bit_Generator.sk**
>![LeastSig1Box](img/run3/LeastSig1Bit_Generator.sk_boxplot.png)
> ![LeastSig1Hist](img/run3/LeastSig1Bit_Generator.sk_histogram.png)

**LeastSig0Bit.sk**
> ![LeastSig0Box](img/run3/LeastSig0Bit.sk_boxplot.png)
> ![LeastSig0Hist](img/run3/LeastSig0Bit.sk_histogram.png)

**HelloWorld.sk**
> ![HelloWorldBox](img/run3/HelloWorld.sk_boxplot.png)
> ![HelloWorldHist](img/run3/HelloWorld.sk_histogram.png)

**InplaceSwap.sk**
> ![InplaceSwapBox](img/run3/InplaceSwap.sk_boxplot.png)
> ![InplaceSwapHist](img/run3/InplaceSwap.sk_histogram.png)

**InplaceSwap_Repeat.sk**
> ![InplaceSwapRBox](img/run3/InplaceSwap_Repeat.sk_boxplot.png)
> ![InplaceSwapRHist](img/run3/InplaceSwap_Repeat.sk_histogram.png)
