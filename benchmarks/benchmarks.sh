#!/bin/bash

###############################################
##                Benchmarks                 ##
###############################################

# This script is used for running all examples
# that are stored in the /src/examples directory
# for a given number of times and average the
# time for each example afterwards.

# Note: The first run is a warmup run and is
# not added to the total at the end, but
# still logged as a baseline comparison.

# The output is generated in the /results directory
# The top-level results.txt file contains the time
# for each example for each run as well as the
# average time for each example.

# For each iteration <i>, a folder 'iteration_<i>'
# is created that contains the outputs of the sketch
# synthesizer. The total time is extracted from this
# output, so these numbers should be equal.

###############################################
##                  Usage                    ##
###############################################

# ./benchmarks.sh <num_runs>
#     <num_runs>: The number of iterations

###############################################


# The number of times to run each example
NUM_RUNS=$1

# The path to the examples directory
EXAMPLES_DIR=$(echo $(readlink -f "../src/examples"))

# Create an array that has all files in the examples directory
EXAMPLES=($(ls $EXAMPLES_DIR))

mkdir results

# Create an array that saves the total time for each example
declare -A results

for i in $(seq 0 $NUM_RUNS);
do
  if [[ $i -eq 0 ]];
  then
    echo "-----------------"
    echo "|  Warmup Run   |"
    echo "-----------------"
    echo
  else
    mkdir results/iteration_$i
    echo "-----------------"
    echo "|  Iteration $i  |"
    echo "-----------------"
    echo
  fi

  echo "RESULTS RUN $i:" >> results/results.txt
  echo "" >> results/results.txt
  for example in "${EXAMPLES[@]}";
  do
    echo "---- Running $example ----"
    echo

    # Run sketch and capture output
    output=$(sketch $EXAMPLES_DIR/$example 2>&1)

    # If this is the first run, print output to console
    # and don't save the result
    if [[ $i -eq 0 ]];
    then
      echo "$output"
      continue
    fi

    # Save the output
    echo "$output" > results/iteration_$i/$example.txt

    # Extract total time
    total_time=$(echo "$output" | grep 'Total time' | awk '{print $4}')

    echo "Total time: $total_time"

    # Add total time to results array
    # Check whether this is the first run, if so, set the value
    # otherwise add it
    if [ -z "${results[$example]}" ];
    then
      results[$example]=$total_time
    else
      results[$example]=$(echo "${results[$example]} + $total_time" | bc)
    fi

    echo
    echo

    echo "$example: $total_time" >> results/results.txt
    echo "" >> results/results.txt

  done
done

echo
echo

# Create a new array that has the average time for each example
declare -A avg

# Divide total time by number of runs
for example in "${EXAMPLES[@]}";
do
  avg[$example]=$(echo "scale=2; ${results[$example]} / $NUM_RUNS" | bc)
done

# Print results
echo "--------------------------------"
echo "|  Average Time (miliseconds)  |"
echo "--------------------------------"
echo

for example in "${EXAMPLES[@]}";
do
  echo "$example: ${avg[$example]}"
done

# Write the results to a file
echo
echo "Writing results to results.txt"
echo

echo "TOTAL RUNS = $NUM_RUNS" >> results/results.txt
for example in "${EXAMPLES[@]}";
do
  echo "$example: AVG: ${avg[$example]}, TOTAL: ${results[$example]}" >> results/results.txt
done
