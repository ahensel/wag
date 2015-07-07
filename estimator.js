function estimate(artifacts, compare) {
  var results = [];

  for (var i = 0; i < artifacts.length; i++) {
    var artifact = artifacts[i];
    results.push({name: artifact.name, estimate: 5});
  }
  return results;
}

exports.estimate = estimate;
