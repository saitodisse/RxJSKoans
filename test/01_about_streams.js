"use strict";

var Rx = require('rx'),
  Observable = Rx.Observable,
  Subject = Rx.Subject,
  Range = require('../util/range');

QUnit.module('Observable Streams');

var __ = 'Fill in the blank';

// https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/return.md
test('simple subscription', function () {
  Observable.just(42).subscribe(function (x) { equal(x, 42); });
});

test('what comes in goes out', function () {
  Observable.just(101).subscribe(function (x) { equal(x, 101); });
});

// Which interface Rx apply? (hint: what does "just()" return)
test('this is the same as an event stream', function () {
  // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/subject.md
  var events = new Subject();
  events.subscribe(function (x) { equal(37, x); });
  events.onNext(37);
});

// What is the relationship between "this is the same as an event stream" and "simple subscription"?
test('how event streams relate to observables', function () {
  var observableResult = 1;
  Observable.just(73).subscribe(function (x) { observableResult = x; });

  var eventStreamResult = 1;
  var events = new Subject();
  events.subscribe(function (x) { eventStreamResult = x; });
  events.onNext(73);

  equal(observableResult, eventStreamResult);
});

// What does Observable.just() map to for a Subject?
test('event streams have multiple results', function () {
  var eventStreamResult = 0;
  var events = new Subject();
  events.subscribe(function (x) { eventStreamResult += x; });

  events.onNext(10);
  events.onNext(7);

  equal(17, eventStreamResult);
});

// What does Observable.just() map to for a Subject?
test('simple return', function () {
  var received = '';
  Observable.just('foo').subscribe(function (x) { received = x; });

  equal('foo', received);
});

test('the last event', function () {
  var received = '';
  var names = ['foo', 'bar'];
  Observable.fromArray(names).subscribe(function (x) { received = x; });

  equal('bar', received);
});

test('everything counts', function () {
  var received = 0;
  var numbers = [3, 4];
  Observable.fromArray(numbers).subscribe(function (x) { received += x; });

  equal(7, received);
});

test('this is still an event stream', function () {
  var received = 0;
  var numbers = new Subject();
  numbers.subscribe(function (x) { received += x; });

  numbers.onNext(10);
  numbers.onNext(5);

  equal(15, received);
});

test('all events will be received', function () {
  var numbers = Range.create(9, 5);
  var sum = 0;

  Observable.fromArray(numbers).subscribe(function (x) { sum += x; });

  equal(Number(9 + 8 + 7 + 6 + 5), sum);
});

test('do things in the middle', function () {
  var status = [];
  var daysTilTest = Observable.fromArray(Range.create(4, 1));

  daysTilTest.do(function (d) {
    let whatToDo = 'Party';
    if (d === 1) {
      whatToDo = 'Study Like Mad';
    }
    status.push(`${d}=${whatToDo}`);
  }).subscribe();

  equal('4=Party,3=Party,2=Party,1=Study Like Mad', status.toString());
});

test('nothing listens until you subscribe', function () {
  var sum = 0,
    numbers = Observable.fromArray(Range.create(1, 10)),
    observable = numbers.do(function (n) { sum += n; });

  equal(0, sum);
  observable.subscribe();

  equal(1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10, sum);
});

test('events before you subscribe do not count', function () {
  var sum = 0,
    numbers = new Subject(),
    observable = numbers.do(function (n) { sum += n; });

  numbers.onNext(1);
  numbers.onNext(2);

  observable.subscribe();

  numbers.onNext(3);
  numbers.onNext(4);

  equal(7, sum);
});

test('events after you unsubscribe dont count', function () {
  var sum = 0,
    numbers = new Subject(),
    observable = numbers.do(function (n) { sum += n; }),
    subscription = observable.subscribe();

  numbers.onNext(1);
  numbers.onNext(2);

  subscription.dispose();

  numbers.onNext(3);
  numbers.onNext(4);

  equal(3, sum);
});

test('events while subscribing', function () {
  var received = [],
    words = new Subject(),
    observable = words.do(received.push.bind(received));

  words.onNext('Peter');
  words.onNext('said');

  var subscription = observable.subscribe();

  words.onNext('you');
  words.onNext('look');
  words.onNext('pretty');

  subscription.dispose();

  words.onNext('ugly');

  equal('you look pretty', received.join(' '));
});
