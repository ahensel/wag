const _ = require('lodash');
const fibonaccis = [1,2,3,5,8,13,20,40];

function estimate(artifacts, compare) {
  //return _cheatToNearestFibonacci(artifacts, compare);
  //return _allSameSize(artifacts, compare);
  //return _3fixedBucketsFirstInMiddle(artifacts, compare);
  return _flexibleBuckets(artifacts, compare);
}

// This is the flexible bucket solution, where all artifacts are binary-insertion sorted into a list
// Result is about 2.82 with our current data set.
function _flexibleBuckets(artifacts, compare) {
  var buckets = [[artifacts[0]]];

  for (var i = 1; i < artifacts.length; i++) {
    var artifact = artifacts[i];

    _insertIntoBuckets(buckets, artifact, compare);
  }

  _logBuckets(buckets);

  return _spread(buckets);
}

function _logBuckets(buckets) {
  console.log("Number of buckets: " + buckets.length);
  console.log("----------------------------");
  for (var b = 0; b < buckets.length; b++) {
    console.log(fibonaccis[b] + ": " + JSON.stringify(_.pluck(buckets[b], 'actual')));
    console.log("-");
  }
}

function _insertIntoBuckets(buckets, artifact, compare) {
  _insertIntoBucketsRecursive(buckets, artifact, compare, 0, buckets.length);
}

function _insertIntoBucketsRecursive(buckets, artifact, compare, considerationStart, considerationLength) {
  var middleBucketIndex = (considerationStart + Math.floor(considerationLength / 2));

  var comparisonResult = compare(artifact, buckets[middleBucketIndex][0]);
  if (comparisonResult === 0) {
    buckets[middleBucketIndex].push(artifact);
  }
  else if (comparisonResult === 1) {
    if (considerationLength < 2) {  // insert
      buckets.splice(middleBucketIndex + 1, 0, [artifact]);
    }
    else {
      var newStart = middleBucketIndex + 1;
      var rightLength = considerationStart + considerationLength - middleBucketIndex - 1;
      if (rightLength === 0) {  // on right edge
        buckets.splice(middleBucketIndex + 1, 0, [artifact]);
      }
      else { // recurse -- more cases to consider
        _insertIntoBucketsRecursive(buckets, artifact, compare, newStart, rightLength);
      }
    }
  }
  else if (comparisonResult === -1) {
    if (considerationLength < 2) {  // insert
      buckets.splice(middleBucketIndex, 0, [artifact]);
    }
    else {
      var newStart = considerationStart;
      var leftLength = middleBucketIndex - considerationStart;
      if (leftLength === 0) {  // on left edge
        buckets.splice(middleBucketIndex, 0, [artifact]);
      }
      else {  // recurse -- more cases to consider
        _insertIntoBucketsRecursive(buckets, artifact, compare, newStart, leftLength);
      }
    }
  }
}


// This is a 3-bucket solution, where all artifacts are compared to the first one, and then
// estimated as a "1" for small, "2" for medium, and "3" for large. Result is about 4.03 with our current data set.
function _3fixedBucketsFirstInMiddle(artifacts, compare) {
  var buckets = [[], [artifacts[0]], []];

  var middle = 1;

  for (var i = 1; i < artifacts.length; i++) {
    var artifact = artifacts[i];

    var comparisonResult = compare(artifact, buckets[middle][0]);
    if (comparisonResult === 0) {  // about equal
      buckets[middle].push(artifact);
    }
    else if (comparisonResult === -1) {  // less than
      buckets[0].push(artifact);
    }
    else if (comparisonResult === 1) {  // greater than
      buckets[2].push(artifact);
    }
  }

  return _spread(buckets);
}


function _spread(buckets) {
  var results = [];
  var bucketNum = 0;
  buckets.forEach(function(bucket) {
    var bucketEstimate = fibonaccis[bucketNum];
    bucket.forEach(function(artifact) {
      results.push({name: artifact.name, estimate: bucketEstimate});
    });
    bucketNum ++;
  });
  return results;
}

// This is our theoretical best if we restrict ourselves to fibonacci. Result is 2.832 with our current data set.
function _cheatToNearestFibonacci(artifacts, compare) {
  var results = [];

  for (var i = 0; i < artifacts.length; i++) {
    var artifact = artifacts[i];

    var actual = artifact.actual;

    var nearest = 1;
    for (var j = 0; j < fibonaccis.length; j++) {
      if (Math.abs(fibonaccis[j] - actual) < Math.abs(nearest - actual)) {
        nearest = fibonaccis[j];
      }
    }

    results.push({name: artifact.name, estimate: nearest});
  }
  return results;
}

// This is our worst case scenario - all are considered equal. Result is 7.003 with our current data set.
function _allSameSize(artifacts, compare) {
  var results = [];

  for (var i = 0; i < artifacts.length; i++) {
    var artifact = artifacts[i];

    results.push({name: artifact.name, estimate: 5});
  }
  return results;
}
exports.estimate = estimate;
