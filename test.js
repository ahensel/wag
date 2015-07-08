const fs = require('fs');
const yaml = require('js-yaml');
const _ = require('lodash');
const estimator = require('./estimator.js');
var comparisons = 0;

var actuals = yaml.load(fs.readFileSync('sample.yaml'));

const tries = 1;
var rms_sum = 0;
for (var i=0; i<tries; i++) {
  actuals = _.shuffle(actuals);
  var estimates = estimator.estimate(actuals, compare);
  rms_sum += calculate_rms(actuals, estimates);
}
var rms_average = rms_sum / tries;

console.log("RMS: " + rms_average + " in " + comparisons/tries + " comparisons for " + actuals.length + " artifacts averaged over " + tries + " tries");

//--------------------------------------------------------------------------------------------

function compare(a, b) {
  comparisons++;
  const targetRatio = 1.4;

  var ratio = a.actual / b.actual;  // estimator knows NOTHING about these actuals... they are part of the test harness
  if (ratio > targetRatio) {
    return 1;
  }
  if (ratio < 1/targetRatio) {
    return -1;
  }
  return 0;
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
