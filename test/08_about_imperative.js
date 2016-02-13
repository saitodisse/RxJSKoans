var Rx = require('rx'),
    Observable = Rx.Observable;

QUnit.module('Imperative');

var __ = 'Fill in the blank';

test('can make a decision with an if with no else', function () {
  var results = [];
  Observable.range(1, 10)
    .flatMap(function (x) {
      return Rx.Observable.if(
        function () { return x % 2 === 0; },
        Observable.just(x)
      );
    })
    .subscribe(results.push.bind(results));

  equal('2,4,6,8,10', results.join(','));
});

test('can make a decision with an if with an else', function () {
  var results = [];
  Observable.range(1, 5)
    .flatMap(function (x, i) {
      return Rx.Observable.if(
        function () { return x % 2 === 0; },
        Observable.just(x),
        Observable.range(x, i)
        // range(1, 0): ------------
        //     just(2): --2---------
        // range(3, 2): --3-4-------
        //     just(4): --4---------
        // range(5, 4): --5-6-7-8---
      );
    })
    .subscribe(results.push.bind(results));

  equal('2,3,4,4,5,6,7,8', results.join(','));
});

test('we can make test cases', function () {
  var result = '';

  var cases = {
    matt: Observable.just(1),
    erik: Observable.just(2),
    bart: Observable.just(3),
    wes: Observable.just(4)
  };

  Observable.just('wes')
    .flatMap(function (x) {
      // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/case.md
      return Observable.case(
        function () { return x; },
        cases
      );
    })
    .subscribe(function (x) { result = x; });

  equal(4, result);
});

test('we can also have a default case', function () {
  var cases = {
    'matt': Observable.just(1),
    'erik': Observable.just(2),
    'bart': Observable.just(3),
    'wes': Observable.just(4)
  };

  Observable.just('RxJS')
    .flatMap(function (x) {
      return Observable.case(
        function () { return x; },
        cases,
        Observable.just(5)
      );
    })
    .reduce((prev, curr) => prev + curr, 0)
    .subscribe((x) => {
      equal(5, x);
    });

});

test('while does something until proven false', function () {
  var i = 0;
  var result = [];

  Rx.Observable
    // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/while.md
    .while(
      function () {
        i = i + 1;
        return i < 3
      },
      Rx.Observable.just(42)
    )
    .subscribe(result.push.bind(result));

  equal('42,42', result.join(','));
});
