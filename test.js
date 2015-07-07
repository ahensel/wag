const fs = require('fs');
const yaml = require('js-yaml');
const estimator = require('./estimator.js');
var comparisons = 0;

const actuals = yaml.load(fs.readFileSync('sample.yaml'));

var estimates = estimator.estimate(actuals, compare);

var rms = calculate_rms(actuals, estimates);

if (rms < 0) {
  process.exit(1);
}

console.log("RMS: " + rms + " in " + comparisons + " comparisons for " + actuals.length + " artifacts");

//--------------------------------------------------------------------------------------------
const phi = (Math.sqrt(5) + 1) / 2;
const GREATER_THAN = 1;
const LESS_THAN = -1;
const ABOUT_EQUAL = 0;

function compare(a, b) {
  comparisons ++;

  var ratio = a.actual / b.actual;  // estimator knows NOTHING about these actuals... they are part of the test harness
  if (ratio > phi) {
    return GREATER_THAN;
  }
  if (ratio < 1/phi) {
    return LESS_THAN;
  }
  return ABOUT_EQUAL;
}

//--------------------------------------------------------------------------------------------
function calculate_rms(actuals, estimates) {
  if (!estimates || isNaN(estimates.length) || estimates.length === 0) {
    console.log(" ***** ERROR! Got no estimates for " + actuals.length + " artifacts. *****");
    return -1;
  }
  if (actuals.length != estimates.length) {
    console.log(" ***** ERROR! Got " + estimates.length + " estimates for " + actuals.length + " artifacts. *****");
    return -1;
  }

  return Math.sqrt(sum_of_squares(actuals, estimates) / actuals.length);
}

function sum_of_squares(actuals, estimates) {
  const number_of_artifacts = actuals.length;
  var actuals_hash = {};
  var estimates_hash = {};
  var actuals_sum = 0;
  var estimates_sum = 0;
  for (var i = 0; i < number_of_artifacts; i++) {
    var actual = actuals[i].actual;
    actuals_hash[actuals[i].name] = actual;
    actuals_sum += actual;

    var estimate = estimates[i].estimate;
    estimates_hash[estimates[i].name] = estimate;
    estimates_sum += estimate;
  }
  var normalization_ratio = actuals_sum / estimates_sum;
  var sum_of_squares = 0;
  for (var j = 0; j < number_of_artifacts; j++) {
    var name = actuals[j].name;
    var actual = actuals_hash[name];
    if (isNaN(actual)) {
      console.log(" ***** ERROR! Actual for " + name + " is not a number *****");
    }
    var estimate = estimates_hash[name];
    if (isNaN(estimate)) {
      console.log(" ***** ERROR! Estimate for " + name + " is not a number *****");
    }
    var diff = actual - (estimate * normalization_ratio);
    sum_of_squares += (diff * diff);
  }
  return sum_of_squares;
}
