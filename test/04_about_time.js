var Rx = require('rx'),
  Observable = Rx.Observable,
  Subject = Rx.Subject,
  Scheduler = Rx.Scheduler;

QUnit.module('Time');

var __ = 'Fill in the blank';

// https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/schedulers/scheduler.md

asyncTest('launching an event via a scheduler', function () {
  var state = null;
  var received = '';
  var delay = 40; // Fix this value
  Scheduler.default.scheduleFuture(state, delay, function (scheduler, state) {
    received = 'Finished';
  });

  setTimeout(function () {
    start();
    equal('Finished', received);
  }, 50);
});

asyncTest('launching an event in the future', function () {
  var received = null;
  var time = 10;

  var people = new Subject();
  people.delay(time)
    .subscribe(function (x) { received = x; });

  people.onNext('Godot');

  equal(null, received);

  setTimeout(function () {
    equal('Godot', received);
    start();
  }, 20)
});

asyncTest('a watched pot', function () {
  var received = '';
  var delay = 50;
  var timeout = 100;
  var timeoutEvent = Observable.just('Tepid');

  Observable
    .just('Boiling')
    .delay(delay)
    .timeout(timeout, timeoutEvent)
    .subscribe(function (x) { received = x; });

  setTimeout(function () {
    equal(received, 'Boiling');
    start();
  }, 50);
});

asyncTest('you can place a time limit on how long an event should take', function () {
  var received = [];
  var timeout = 20;
  var timeoutEvent = Observable.just('Tepid');
  var temperatures = new Subject();

  temperatures.timeout(timeout, timeoutEvent)
    .subscribe(received.push.bind(received));

  temperatures.onNext('Started');

  setTimeout(function () {
    temperatures.onNext('Boiling');
  }, 30);

  setTimeout(function () {
    equal('Started, Tepid', received.join(', '));
    start();
  }, 40);
});

asyncTest('debouncing', function () {
  expect(3);

  var received = [];
  var events = new Subject();

  events.debounce(10)
    .subscribe(received.push.bind(received));

  events.onNext('f');
  events.onNext('fr');
  events.onNext('fro');
  events.onNext('from');
  equal('', received.join(' '));

  setTimeout(function () {
    events.onNext('r');
    events.onNext('rx');
    events.onNext('rxj');
    events.onNext('rxjs');
    equal('from', received.join(' '));

    setTimeout(function () {
      equal('from rxjs', received.join(' '));
      start();
    }, 15);
  }, 15);
});

asyncTest('buffering', function () {
  var received = [];
  var events = new Subject();
  events.bufferWithTime(50)
    .map(function (c) { return c.join(''); })
    .subscribe(received.push.bind(received));

  events.onNext('R');
  events.onNext('x');
  events.onNext('J');
  events.onNext('S');
  equal('', received.join(' '));

  setTimeout(function () {
    events.onNext('R');
    events.onNext('o');
    events.onNext('c');
    events.onNext('k');
    events.onNext('s');
    equal('RxJS', received.join(' '));

    setTimeout(function () {
      equal('RxJS Rocks', received.join(' '));
      start();
    }, 70);
  }, 70);
});

asyncTest('time between calls', function () {
  var received = [];
  var events = new Subject();

  events.timeInterval()
    .filter(function (t) { return t.interval > 50; })
    // .do((t) => console.log('time between calls:', t))
    .subscribe(function (t) { received.push(t.value); });

  events.onNext('too');
  events.onNext('fast');

  setTimeout(function () {
    events.onNext('slow');

    setTimeout(function () {
      events.onNext('down');

      equal('slow down', received.join(' '));
      start();
    }, 70);
  }, 70);
});

asyncTest('results can be ambiguous timing', function () {
  var results = 0;
  var fst = Observable.timer(10).map(-1);
  var snd = Observable.timer(100).map(1);

  // https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/core/operators/amb.md
  fst.amb(snd)
    .subscribe(function (x) { results = x; });

  setTimeout(function () {
    equal(results, -1);
    start();
  }, 50);
});
