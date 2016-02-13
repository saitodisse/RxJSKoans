var Rx = require('rx'),
  Observable = Rx.Observable;

QUnit.module('Mapping');

var __ = 'Fill in the blank';

test('flatMap can be a cartesian product', function () {
  var results = [];
  Observable.range(1, 3)
    .flatMap(function (x, i) {
      return Observable.range(x, i);
      //   return Observable.range(x, i)
      //   > range(1, 0)  --------------
      //   > range(2, 1)  --2-----------
      //   > range(3, 2)  ------3---4---
      //   flatMap        --2---3---4---
    })
    .subscribe(results.push.bind(results));

  equal('234', results.join(''));
});


// http://stackoverflow.com/questions/33246978/understanding-rxjss-flatmap-flatmaplatest-in-c-sharp-terms
//
// flatMapLatest is a flatMap where only the items of the current observable are emitted.
// If a new observable comes, the values of the previous one are ignored.
//
// --A------------------- // First stream
// --a1----a2----a3------ // flatMapLatest's function result
// -----B---------------- // Second stream
// -----b1----b2----b3--- // flatMapLatest's function result
// --a1-b1----b2----b3--- // flatMapLatest
test('flatMapLatest only gets us the latest value', function () {
  var results = [];
  Observable.range(1, 3)
    .flatMapLatest(function (x) {
      // return Observable.range(x, x) // first  resolution
      return Observable.range(x, 3)    // second resolution
    })
    .subscribe(results.push.bind(results));
    //   return Observable.range(x, x)
    //   > range(1, 1)  --1--------------------
    //   > range(2, 2)  ------2---3------------
    //   >              ----------x------------ ignored
    //   > range(3, 3)  ----------3---4---5----
    //   flatMapLatest  --1---2---3---4---5----
    //
    //   return Observable.range(x, 3)
    //   > range(1, 3)  --1---2---3------------
    //   >              ------x---x------------ ignored
    //   > range(2, 3)  ------2---3---4--------
    //   >              ----------x---x-------- ignored
    //   > range(3, 3)  ----------3---4---5----
    //   flatMapLatest  --1---2---3---4---5----
  equal('12345', results.join(''));
});
