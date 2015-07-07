# wag
Hackathon: relatively painless estimation by relative-sizing all the things

Sean Heuer's pitch:

*New teams suck at estimating.  Relative sizing is foreign to them and practices like planning poker just make
it more painful and time consuming.  Don't even get me started on Feature estimating... everyone sucks at that.
So let's build something that makes sizing painless and FAST so we can stop wasting time estimating!*

Based on node 0.10.35 and npm 2.7.5.

Be sure to:
```
  npm install js-yaml
```
Run tests:
```
  node test.js
```
The tests calculate the root-mean-squared of the results as compared to sample inputs. Worst-case RMS for our current data set is 7.0027, based on not estimating (setting all estimates to the same size). Lower is better. 0 can only be achieved by cheating. 2.83 is the best fit for our current data set while sizing to nearest fibonacci numbers. How low can we go?
