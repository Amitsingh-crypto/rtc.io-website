(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
// rtc-quickconnect requires a signalling server location and a room name.
var quickConnectMod = require('rtc-quickconnect');
var quickConnectObj = quickConnectMod('//switchboard.rtc.io', { room: 'rtcio-text-demo' });

// Create the text area for chatting
var messageWindow = document.createElement('textarea');
messageWindow.rows = 20;
messageWindow.cols = 80;

var bodyElement = document.getElementsByTagName('body')[0];
bodyElement.appendChild(messageWindow);

// Create a data channel and bind to it's events
quickConnectObj.createDataChannel('shared-text');
quickConnectObj.on('channel:opened:shared-text', function (id, dataChannel) {
  	bindDataEvents(dataChannel);
});

function bindDataEvents(channel) {
	// Receive message
	channel.onmessage = function (evt) {
		messageWindow.value = evt.data;
	};

	// Send message
	messageWindow.onkeyup = function (evt) {
		channel.send(this.value);
	};
}

},{"rtc-quickconnect":13}],3:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
## cog/defaults

```js
var defaults = require('cog/defaults');
```

### defaults(target, *)

Shallow copy object properties from the supplied source objects (*) into
the target object, returning the target object once completed.  Do not,
however, overwrite existing keys with new values:

```js
defaults({ a: 1, b: 2 }, { c: 3 }, { d: 4 }, { b: 5 }));
```

See an example on [requirebin](http://requirebin.com/?gist=6079475).
**/
module.exports = function(target) {
  // ensure we have a target
  target = target || {};

  // iterate through the sources and copy to the target
  [].slice.call(arguments, 1).forEach(function(source) {
    if (! source) {
      return;
    }

    for (var prop in source) {
      if (target[prop] === void 0) {
        target[prop] = source[prop];
      }
    }
  });

  return target;
};
},{}],4:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
## cog/extend

```js
var extend = require('cog/extend');
```

### extend(target, *)

Shallow copy object properties from the supplied source objects (*) into
the target object, returning the target object once completed:

```js
extend({ a: 1, b: 2 }, { c: 3 }, { d: 4 }, { b: 5 }));
```

See an example on [requirebin](http://requirebin.com/?gist=6079475).
**/
module.exports = function(target) {
  [].slice.call(arguments, 1).forEach(function(source) {
    if (! source) {
      return;
    }

    for (var prop in source) {
      target[prop] = source[prop];
    }
  });

  return target;
};
},{}],5:[function(require,module,exports){
/**
  ## cog/getable

  Take an object and provide a wrapper that allows you to `get` and
  `set` values on that object.

**/
module.exports = function(target) {
  function get(key) {
    return target[key];
  }

  function set(key, value) {
    target[key] = value;
  }

  function remove(key) {
    return delete target[key];
  }

  function keys() {
    return Object.keys(target);
  };

  function values() {
    return Object.keys(target).map(function(key) {
      return target[key];
    });
  };

  if (typeof target != 'object') {
    return target;
  }

  return {
    get: get,
    set: set,
    remove: remove,
    delete: remove,
    keys: keys,
    values: values
  };
};

},{}],6:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/jsonparse

  ```js
  var jsonparse = require('cog/jsonparse');
  ```

  ### jsonparse(input)

  This function will attempt to automatically detect stringified JSON, and
  when detected will parse into JSON objects.  The function looks for strings
  that look and smell like stringified JSON, and if found attempts to
  `JSON.parse` the input into a valid object.

**/
module.exports = function(input) {
  var isString = typeof input == 'string' || (input instanceof String);
  var reNumeric = /^\-?\d+\.?\d*$/;
  var shouldParse ;
  var firstChar;
  var lastChar;

  if ((! isString) || input.length < 2) {
    if (isString && reNumeric.test(input)) {
      return parseFloat(input);
    }

    return input;
  }

  // check for true or false
  if (input === 'true' || input === 'false') {
    return input === 'true';
  }

  // check for null
  if (input === 'null') {
    return null;
  }

  // get the first and last characters
  firstChar = input.charAt(0);
  lastChar = input.charAt(input.length - 1);

  // determine whether we should JSON.parse the input
  shouldParse =
    (firstChar == '{' && lastChar == '}') ||
    (firstChar == '[' && lastChar == ']') ||
    (firstChar == '"' && lastChar == '"');

  if (shouldParse) {
    try {
      return JSON.parse(input);
    }
    catch (e) {
      // apparently it wasn't valid json, carry on with regular processing
    }
  }


  return reNumeric.test(input) ? parseFloat(input) : input;
};
},{}],7:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/logger

  ```js
  var logger = require('cog/logger');
  ```

  Simple browser logging offering similar functionality to the
  [debug](https://github.com/visionmedia/debug) module.

  ### Usage

  Create your self a new logging instance and give it a name:

  ```js
  var debug = logger('phil');
  ```

  Now do some debugging:

  ```js
  debug('hello');
  ```

  At this stage, no log output will be generated because your logger is
  currently disabled.  Enable it:

  ```js
  logger.enable('phil');
  ```

  Now do some more logger:

  ```js
  debug('Oh this is so much nicer :)');
  // --> phil: Oh this is some much nicer :)
  ```

  ### Reference
**/

var active = [];
var unleashListeners = [];
var targets = [ console ];

/**
  #### logger(name)

  Create a new logging instance.
**/
var logger = module.exports = function(name) {
  // initial enabled check
  var enabled = checkActive();

  function checkActive() {
    return enabled = active.indexOf('*') >= 0 || active.indexOf(name) >= 0;
  }

  // register the check active with the listeners array
  unleashListeners[unleashListeners.length] = checkActive;

  // return the actual logging function
  return function() {
    var args = [].slice.call(arguments);

    // if we have a string message
    if (typeof args[0] == 'string' || (args[0] instanceof String)) {
      args[0] = name + ': ' + args[0];
    }

    // if not enabled, bail
    if (! enabled) {
      return;
    }

    // log
    targets.forEach(function(target) {
      target.log.apply(target, args);
    });
  };
};

/**
  #### logger.reset()

  Reset logging (remove the default console logger, flag all loggers as
  inactive, etc, etc.
**/
logger.reset = function() {
  // reset targets and active states
  targets = [];
  active = [];

  return logger.enable();
};

/**
  #### logger.to(target)

  Add a logging target.  The logger must have a `log` method attached.

**/
logger.to = function(target) {
  targets = targets.concat(target || []);

  return logger;
};

/**
  #### logger.enable(names*)

  Enable logging via the named logging instances.  To enable logging via all
  instances, you can pass a wildcard:

  ```js
  logger.enable('*');
  ```

  __TODO:__ wildcard enablers
**/
logger.enable = function() {
  // update the active
  active = active.concat([].slice.call(arguments));

  // trigger the unleash listeners
  unleashListeners.forEach(function(listener) {
    listener();
  });

  return logger;
};
},{}],8:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ## cog/throttle

  ```js
  var throttle = require('cog/throttle');
  ```

  ### throttle(fn, delay, opts)

  A cherry-pickable throttle function.  Used to throttle `fn` to ensure
  that it can be called at most once every `delay` milliseconds.  Will
  fire first event immediately, ensuring the next event fired will occur
  at least `delay` milliseconds after the first, and so on.

**/
module.exports = function(fn, delay, opts) {
  var lastExec = (opts || {}).leading !== false ? 0 : Date.now();
  var trailing = (opts || {}).trailing;
  var timer;
  var queuedArgs;
  var queuedScope;

  // trailing defaults to true
  trailing = trailing || trailing === undefined;
  
  function invokeDefered() {
    fn.apply(queuedScope, queuedArgs || []);
    lastExec = Date.now();
  }

  return function() {
    var tick = Date.now();
    var elapsed = tick - lastExec;

    // always clear the defered timer
    clearTimeout(timer);

    if (elapsed < delay) {
      queuedArgs = [].slice.call(arguments, 0);
      queuedScope = this;

      return trailing && (timer = setTimeout(invokeDefered, delay - elapsed));
    }

    // call the function
    lastExec = tick;
    fn.apply(this, arguments);
  };
};
},{}],9:[function(require,module,exports){
/* jshint node: true */
/* global window: false */
/* global navigator: false */

'use strict';

var browser = require('detect-browser');

/**
  ### `rtc-core/detect`

  A browser detection helper for accessing prefix-free versions of the various
  WebRTC types.

  ### Example Usage

  If you wanted to get the native `RTCPeerConnection` prototype in any browser
  you could do the following:

  ```js
  var detect = require('rtc-core/detect'); // also available in rtc/detect
  var RTCPeerConnection = detect('RTCPeerConnection');
  ```

  This would provide whatever the browser prefixed version of the
  RTCPeerConnection is available (`webkitRTCPeerConnection`,
  `mozRTCPeerConnection`, etc).
**/
var detect = module.exports = function(target, opts) {
  var attach = (opts || {}).attach;
  var prefixIdx;
  var prefix;
  var testName;
  var hostObject = this || (typeof window != 'undefined' ? window : undefined);

  // initialise to default prefixes
  // (reverse order as we use a decrementing for loop)
  var prefixes = ((opts || {}).prefixes || ['ms', 'o', 'moz', 'webkit']).concat('');

  // if we have no host object, then abort
  if (! hostObject) {
    return;
  }

  // iterate through the prefixes and return the class if found in global
  for (prefixIdx = prefixes.length; prefixIdx--; ) {
    prefix = prefixes[prefixIdx];

    // construct the test class name
    // if we have a prefix ensure the target has an uppercase first character
    // such that a test for getUserMedia would result in a
    // search for webkitGetUserMedia
    testName = prefix + (prefix ?
                            target.charAt(0).toUpperCase() + target.slice(1) :
                            target);

    if (typeof hostObject[testName] != 'undefined') {
      // update the last used prefix
      detect.browser = detect.browser || prefix.toLowerCase();

      if (attach) {
         hostObject[target] = hostObject[testName];
      }

      return hostObject[testName];
    }
  }
};

// detect mozilla (yes, this feels dirty)
detect.moz = typeof navigator != 'undefined' && !!navigator.mozGetUserMedia;

// set the browser and browser version
detect.browser = browser.name;
detect.browserVersion = detect.version = browser.version;

},{"detect-browser":11}],10:[function(require,module,exports){
/**
  ### `rtc-core/genice`

  Respond appropriately to options that are passed to packages like
  `rtc-quickconnect` and trigger a `callback` (error first) with iceServer
  values.

  The function looks for either of the following keys in the options, in
  the following order or precedence:

  1. `ice` - this can either be an array of ice server values or a generator
     function (in the same format as this function).  If this key contains a
     value then any servers specified in the `iceServers` key (2) will be
     ignored.

  2. `iceServers` - an array of ice server values.
**/
module.exports = function(opts, callback) {
  var ice = (opts || {}).ice;
  var iceServers = (opts || {}).iceServers;

  if (typeof ice == 'function') {
    return ice(opts, callback);
  }
  else if (Array.isArray(ice)) {
    return callback(null, [].concat(ice));
  }

  callback(null, [].concat(iceServers || []));
};

},{}],11:[function(require,module,exports){
var browsers = [
  [ 'chrome', /Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/ ],
  [ 'firefox', /Firefox\/([0-9\.]+)(?:\s|$)/ ],
  [ 'opera', /Opera\/([0-9\.]+)(?:\s|$)/ ],
  [ 'ie', /Trident\/7\.0.*rv\:([0-9\.]+)\).*Gecko$/ ],
  [ 'ie', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/ ],
  [ 'ie', /MSIE\s(7\.0)/ ],
  [ 'bb10', /BB10;\sTouch.*Version\/([0-9\.]+)/ ],
  [ 'android', /Android\s([0-9\.]+)/ ],
  [ 'ios', /iPad\;\sCPU\sOS\s([0-9\._]+)/ ],
  [ 'ios',  /iPhone\;\sCPU\siPhone\sOS\s([0-9\._]+)/ ],
  [ 'safari', /Safari\/([0-9\._]+)/ ]
];

var match = browsers.map(match).filter(isMatch)[0];
var parts = match && match[3].split(/[._]/).slice(0,3);

while (parts && parts.length < 3) {
  parts.push('0');
}

// set the name and version
exports.name = match && match[0];
exports.version = parts && parts.join('.');

function match(pair) {
  return pair.concat(pair[1].exec(navigator.userAgent));
}

function isMatch(pair) {
  return !!pair[2];
}

},{}],12:[function(require,module,exports){
var detect = require('./detect');
var requiredFunctions = [
  'init'
];

function isSupported(plugin) {
  return plugin && typeof plugin.supported == 'function' && plugin.supported(detect);
}

function isValid(plugin) {
  var supportedFunctions = requiredFunctions.filter(function(fn) {
    return typeof plugin[fn] == 'function';
  });

  return supportedFunctions.length === requiredFunctions.length;
}

module.exports = function(plugins) {
  return [].concat(plugins || []).filter(isSupported).filter(isValid)[0];
}

},{"./detect":9}],13:[function(require,module,exports){
(function (process){
/* jshint node: true */
'use strict';

var rtc = require('rtc-tools');
var mbus = require('mbus');
var cleanup = require('rtc-tools/cleanup');
var detectPlugin = require('rtc-core/plugin');
var debug = rtc.logger('rtc-quickconnect');
var defaults = require('cog/defaults');
var extend = require('cog/extend');
var getable = require('cog/getable');
var messenger = require('./messenger');
var reTrailingSlash = /\/$/;

/**
  # rtc-quickconnect

  This is a high level helper module designed to help you get up
  an running with WebRTC really, really quickly.  By using this module you
  are trading off some flexibility, so if you need a more flexible
  configuration you should drill down into lower level components of the
  [rtc.io](http://www.rtc.io) suite.  In particular you should check out
  [rtc](https://github.com/rtc-io/rtc).

  ## Example Usage

  In the simplest case you simply call quickconnect with a single string
  argument which tells quickconnect which server to use for signaling:

  <<< examples/simple.js

  <<< docs/events.md

  <<< docs/examples.md

  ## Regarding Signalling and a Signalling Server

  Signaling is an important part of setting up a WebRTC connection and for
  our examples we use our own test instance of the
  [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard). For your
  testing and development you are more than welcome to use this also, but
  just be aware that we use this for our testing so it may go up and down
  a little.  If you need something more stable, why not consider deploying
  an instance of the switchboard yourself - it's pretty easy :)

  ## Reference

  ```
  quickconnect(signalhost, opts?) => rtc-sigaller instance (+ helpers)
  ```

  ### Valid Quick Connect Options

  The options provided to the `rtc-quickconnect` module function influence the
  behaviour of some of the underlying components used from the rtc.io suite.

  Listed below are some of the commonly used options:

  - `ns` (default: '')

    An optional namespace for your signalling room.  While quickconnect
    will generate a unique hash for the room, this can be made to be more
    unique by providing a namespace.  Using a namespace means two demos
    that have generated the same hash but use a different namespace will be
    in different rooms.

  - `room` (default: null) _added 0.6_

    Rather than use the internal hash generation
    (plus optional namespace) for room name generation, simply use this room
    name instead.  __NOTE:__ Use of the `room` option takes precendence over
    `ns`.

  - `debug` (default: false)

  Write rtc.io suite debug output to the browser console.

  - `expectedLocalStreams` (default: not specified) _added 3.0_

    By providing a positive integer value for this option will mean that
    the created quickconnect instance will wait until the specified number of
    streams have been added to the quickconnect "template" before announcing
    to the signaling server.

  - `manualJoin` (default: `false`)

    Set this value to `true` if you would prefer to call the `join` function
    to connecting to the signalling server, rather than having that happen
    automatically as soon as quickconnect is ready to.

  #### Options for Peer Connection Creation

  Options that are passed onto the
  [rtc.createConnection](https://github.com/rtc-io/rtc#createconnectionopts-constraints)
  function:

  - `iceServers`

  This provides a list of ice servers that can be used to help negotiate a
  connection between peers.

  #### Options for P2P negotiation

  Under the hood, quickconnect uses the
  [rtc/couple](https://github.com/rtc-io/rtc#rtccouple) logic, and the options
  passed to quickconnect are also passed onto this function.

**/
module.exports = function(signalhost, opts) {
  var hash = typeof location != 'undefined' && location.hash.slice(1);
  var signaller = require('rtc-signaller')(messenger(signalhost), opts);

  // init configurable vars
  var ns = (opts || {}).ns || '';
  var room = (opts || {}).room;
  var debugging = (opts || {}).debug;
  var allowJoin = !(opts || {}).manualJoin;
  var heartbeat = (opts || {}).heartbeat || 2500;
  var profile = {};
  var announced = false;

  // initialise iceServers to undefined
  // we will not announce until these have been properly initialised
  var iceServers;

  // collect the local streams
  var localStreams = [];

  // create the calls map
  var calls = signaller.calls = getable({});

  // create the known data channels registry
  var channels = {};

  // save the plugins passed to the signaller
  var plugins = signaller.plugins = (opts || {}).plugins || [];
  var plugin = detectPlugin(signaller.plugins);
  var pluginReady;

  // check how many local streams have been expected (default: 0)
  var expectedLocalStreams = parseInt((opts || {}).expectedLocalStreams, 10) || 0;
  var announceTimer = 0;
  var heartbeatTimer = 0;
  var updateTimer = 0;

  function callCreate(id, pc) {
    calls.set(id, {
      active: false,
      pc: pc,
      channels: getable({}),
      streams: [],
      lastping: Date.now()
    });
  }

  function callEnd(id) {
    var call = calls.get(id);

    // if we have no data, then do nothing
    if (! call) {
      return;
    }

    debug('ending call to: ' + id);

    // if we have no data, then return
    call.channels.keys().forEach(function(label) {
      var channel = call.channels.get(label);
      var args = [id, channel, label];

      // emit the plain channel:closed event
      signaller.apply(signaller, ['channel:closed'].concat(args));

      // emit the labelled version of the event
      signaller.apply(signaller, ['channel:closed:' + label].concat(args));

      // decouple the events
      channel.onopen = null;
    });

    // trigger stream:removed events for each of the remotestreams in the pc
    call.streams.forEach(function(stream) {
      signaller('stream:removed', id, stream);
    });

    // delete the call data
    calls.delete(id);

    // if we have no more calls, disable the heartbeat
    if (calls.keys().length === 0) {
      hbReset();
    }

    // trigger the call:ended event
    signaller('call:ended', id, call.pc);

    // ensure the peer connection is properly cleaned up
    cleanup(call.pc);
  }

  function callStart(id, pc, data) {
    var call = calls.get(id);
    var streams = [].concat(pc.getRemoteStreams());

    // flag the call as active
    call.active = true;
    call.streams = [].concat(pc.getRemoteStreams());

    pc.onaddstream = createStreamAddHandler(id);
    pc.onremovestream = createStreamRemoveHandler(id);

    debug(signaller.id + ' - ' + id + ' call start: ' + streams.length + ' streams');
    signaller('call:started', id, pc, data);

    // configure the heartbeat timer
    hbInit();

    // examine the existing remote streams after a short delay
    process.nextTick(function() {
      // iterate through any remote streams
      streams.forEach(receiveRemoteStream(id));
    });
  }

  function checkReadyToAnnounce() {
    clearTimeout(announceTimer);
    // if we have already announced do nothing!
    if (announced) {
      return;
    }

    if (! allowJoin) {
      return;
    }

    // if we have a plugin but it's not initialized we aren't ready
    if (plugin && (! pluginReady)) {
      return;
    }

    // if we have no iceServers we aren't ready
    if (! iceServers) {
      return;
    }

    // if we are waiting for a set number of streams, then wait until we have
    // the required number
    if (expectedLocalStreams && localStreams.length < expectedLocalStreams) {
      return;
    }

    // announce ourselves to our new friend
    announceTimer = setTimeout(function() {
      var data = extend({ room: room }, profile);

      // announce and emit the local announce event
      signaller.announce(data);
      announced = true;
    }, 0);
  }

 function connect(id) {
    var data = getPeerData(id);
    var pc;
    var monitor;

    // if the room is not a match, abort
    if (data.room !== room) {
      return;
    }

    // end any call to this id so we know we are starting fresh
    callEnd(id);

    // create a peer connection
    // iceServers that have been created using genice taking precendence
    pc = rtc.createConnection(
      extend({}, opts, { iceServers: iceServers }),
      (opts || {}).constraints
    );

    signaller('peer:connect', data.id, pc, data);

    // add this connection to the calls list
    callCreate(data.id, pc);

    // add the local streams
    localStreams.forEach(function(stream, idx) {
      pc.addStream(stream);
    });

    // add the data channels
    // do this differently based on whether the connection is a
    // master or a slave connection
    if (signaller.isMaster(data.id)) {
      debug('is master, creating data channels: ', Object.keys(channels));

      // create the channels
      Object.keys(channels).forEach(function(label) {
       gotPeerChannel(pc.createDataChannel(label, channels[label]), pc, data);
      });
    }
    else {
      pc.ondatachannel = function(evt) {
        var channel = evt && evt.channel;

        // if we have no channel, abort
        if (! channel) {
          return;
        }

        if (channels[channel.label] !== undefined) {
          gotPeerChannel(channel, pc, getPeerData(id));
        }
      };
    }

    // couple the connections
    debug('coupling ' + signaller.id + ' to ' + data.id);
    monitor = rtc.couple(pc, id, signaller, extend({}, opts, {
      logger: mbus('pc.' + id, signaller)
    }));

    signaller('peer:couple', id, pc, data, monitor);

    // once active, trigger the peer connect event
    monitor.once('connected', callStart.bind(null, id, pc, data))
    monitor.once('closed', callEnd.bind(null, id));

    // if we are the master connnection, create the offer
    // NOTE: this only really for the sake of politeness, as rtc couple
    // implementation handles the slave attempting to create an offer
    if (signaller.isMaster(id)) {
      monitor.createOffer();
    }
  }

  function createStreamAddHandler(id) {
    return function(evt) {
      debug('peer ' + id + ' added stream');
      updateRemoteStreams(id);
      receiveRemoteStream(id)(evt.stream);
    }
  }

  function createStreamRemoveHandler(id) {
    return function(evt) {
      debug('peer ' + id + ' removed stream');
      updateRemoteStreams(id);
      signaller('stream:removed', id, evt.stream);
    };
  }

  function getActiveCall(peerId) {
    var call = calls.get(peerId);

    if (! call) {
      throw new Error('No active call for peer: ' + peerId);
    }

    return call;
  }

  function getPeerData(id) {
    var peer = signaller.peers.get(id);

    return peer && peer.data;
  }

  function gotPeerChannel(channel, pc, data) {
    var channelMonitor;

    function channelReady() {
      var call = calls.get(data.id);
      var args = [ data.id, channel, data, pc ];

      // decouple the channel.onopen listener
      debug('reporting channel "' + channel.label + '" ready, have call: ' + (!!call));
      clearInterval(channelMonitor);
      channel.onopen = null;

      // save the channel
      if (call) {
        call.channels.set(channel.label, channel);
      }

      // trigger the %channel.label%:open event
      debug('triggering channel:opened events for channel: ' + channel.label);

      // emit the plain channel:opened event
      signaller.apply(signaller, ['channel:opened'].concat(args));

      // emit the channel:opened:%label% eve
      signaller.apply(
        signaller,
        ['channel:opened:' + channel.label].concat(args)
      );
    }

    debug('channel ' + channel.label + ' discovered for peer: ' + data.id);
    if (channel.readyState === 'open') {
      return channelReady();
    }

    debug('channel not ready, current state = ' + channel.readyState);
    channel.onopen = channelReady;

    // monitor the channel open (don't trust the channel open event just yet)
    channelMonitor = setInterval(function() {
      debug('checking channel state, current state = ' + channel.readyState);
      if (channel.readyState === 'open') {
        channelReady();
      }
    }, 500);
  }

  function hbInit() {
    // if the heartbeat timer is active, or heartbeat has been disabled (0, false, etc) return
    if (heartbeatTimer || (! heartbeat)) {
      return;
    }

    heartbeatTimer = setInterval(hbSend, heartbeat);
  }

  function hbSend() {
    var tickInactive = (Date.now() - (heartbeat * 4));

    // iterate through our established calls
    calls.keys().forEach(function(id) {
      var call = calls.get(id);

      // if the call ping is too old, end the call
      if (call.lastping < tickInactive) {
        return callEnd(id);
      }

      // send a ping message
      signaller.to(id).send('/ping');
    });
  }

  function hbReset() {
    clearInterval(heartbeatTimer);
    heartbeatTimer = 0;
  }

  function initPlugin() {
    return plugin && plugin.init(opts, function(err) {
      if (err) {
        return console.error('Could not initialize plugin: ', err);
      }

      pluginReady = true;
      checkReadyToAnnounce();
    });
  }

  function handleLocalAnnounce(data) {
    // if we send an announce with an updated room then update our local room name
    if (data && typeof data.room != 'undefined') {
      room = data.room;
    }
  }

  function handlePeerFilter(id, data) {
    // only connect with the peer if we are ready
    data.allow = data.allow && (localStreams.length >= expectedLocalStreams);
  }

  function handlePeerUpdate(data) {
    var id = data && data.id;
    var activeCall = id && calls.get(id);

    // if we have received an update for a peer that has no active calls,
    // then pass this onto the announce handler
    if (id && (! activeCall)) {
      debug('received peer update from peer ' + id + ', no active calls');
      signaller.to(id).send('/reconnect');
      return connect(id);
    }
  }

  function handlePing(sender) {
    var call = calls.get(sender && sender.id);

    // set the last ping for the data
    if (call) {
      call.lastping = Date.now();
    }
  }

  function receiveRemoteStream(id) {
    var call = calls.get(id);

    return function(stream) {
      signaller('stream:added', id, stream, getPeerData(id));
    };
  }

  function updateRemoteStreams(id) {
    var call = calls.get(id);

    if (call && call.pc) {
      call.streams = [].concat(call.pc.getRemoteStreams());
    }
  }

  // if the room is not defined, then generate the room name
  if (! room) {
    // if the hash is not assigned, then create a random hash value
    if (typeof location != 'undefined' && (! hash)) {
      hash = location.hash = '' + (Math.pow(2, 53) * Math.random());
    }

    room = ns + '#' + hash;
  }

  if (debugging) {
    rtc.logger.enable.apply(rtc.logger, Array.isArray(debug) ? debugging : ['*']);
  }

  signaller.on('peer:announce', function(data) {
    connect(data.id);
  });

  signaller.on('peer:update', handlePeerUpdate);

  signaller.on('message:reconnect', function(sender) {
    connect(sender.id);
  });



  /**
    ### Quickconnect Broadcast and Data Channel Helper Functions

    The following are functions that are patched into the `rtc-signaller`
    instance that make working with and creating functional WebRTC applications
    a lot simpler.

  **/

  /**
    #### addStream

    ```
    addStream(stream:MediaStream) => qc
    ```

    Add the stream to active calls and also save the stream so that it
    can be added to future calls.

  **/
  signaller.broadcast = signaller.addStream = function(stream) {
    localStreams.push(stream);

    // if we have any active calls, then add the stream
    calls.values().forEach(function(data) {
      data.pc.addStream(stream);
    });

    checkReadyToAnnounce();
    return signaller;
  };

  /**
    #### endCalls()

    The `endCalls` function terminates all the active calls that have been
    created in this quickconnect instance.  Calling `endCalls` does not
    kill the connection with the signalling server.

  **/
  signaller.endCalls = function() {
    calls.keys().forEach(callEnd);
  };

  /**
    #### close()

    The `close` function provides a convenient way of closing all associated
    peer connections.  This function simply uses the `endCalls` function and
    the underlying `leave` function of the signaller to do a "full cleanup"
    of all connections.
  **/
  signaller.close = function() {
    signaller.endCalls();
    signaller.leave();
  };

  /**
    #### createDataChannel(label, config)

    Request that a data channel with the specified `label` is created on
    the peer connection.  When the data channel is open and available, an
    event will be triggered using the label of the data channel.

    For example, if a new data channel was requested using the following
    call:

    ```js
    var qc = quickconnect('https://switchboard.rtc.io/').createDataChannel('test');
    ```

    Then when the data channel is ready for use, a `test:open` event would
    be emitted by `qc`.

  **/
  signaller.createDataChannel = function(label, opts) {
    // create a channel on all existing calls
    calls.keys().forEach(function(peerId) {
      var call = calls.get(peerId);
      var dc;

      // if we are the master connection, create the data channel
      if (call && call.pc && signaller.isMaster(peerId)) {
        dc = call.pc.createDataChannel(label, opts);
        gotPeerChannel(dc, call.pc, getPeerData(peerId));
      }
    });

    // save the data channel opts in the local channels dictionary
    channels[label] = opts || null;

    return signaller;
  };

  /**
    #### join()

    The `join` function is used when `manualJoin` is set to true when creating
    a quickconnect instance.  Call the `join` function once you are ready to
    join the signalling server and initiate connections with other people.

  **/
  signaller.join = function() {
    allowJoin = true;
    checkReadyToAnnounce();
  };

  /**
    #### `get(name)`

    The `get` function returns the property value for the specified property name.
  **/
  signaller.get = function(name) {
    return profile[name];
  };

  /**
    #### `getLocalStreams()`

    Return a copy of the local streams that have currently been configured
  **/
  signaller.getLocalStreams = function() {
    return [].concat(localStreams);
  };

  /**
    #### reactive()

    Flag that this session will be a reactive connection.

  **/
  signaller.reactive = function() {
    // add the reactive flag
    opts = opts || {};
    opts.reactive = true;

    // chain
    return signaller;
  };

  /**
    #### removeStream

    ```
    removeStream(stream:MediaStream)
    ```

    Remove the specified stream from both the local streams that are to
    be connected to new peers, and also from any active calls.

  **/
  signaller.removeStream = function(stream) {
    var localIndex = localStreams.indexOf(stream);

    // remove the stream from any active calls
    calls.values().forEach(function(call) {
      call.pc.removeStream(stream);
    });

    // remove the stream from the localStreams array
    if (localIndex >= 0) {
      localStreams.splice(localIndex, 1);
    }

    return signaller;
  };

  /**
    #### requestChannel

    ```
    requestChannel(targetId, label, callback)
    ```

    This is a function that can be used to respond to remote peers supplying
    a data channel as part of their configuration.  As per the `receiveStream`
    function this function will either fire the callback immediately if the
    channel is already available, or once the channel has been discovered on
    the call.

  **/
  signaller.requestChannel = function(targetId, label, callback) {
    var call = getActiveCall(targetId);
    var channel = call && call.channels.get(label);

    // if we have then channel trigger the callback immediately
    if (channel) {
      callback(null, channel);
      return signaller;
    }

    // if not, wait for it
    signaller.once('channel:opened:' + label, function(id, dc) {
      callback(null, dc);
    });

    return signaller;
  };

  /**
    #### requestStream

    ```
    requestStream(targetId, idx, callback)
    ```

    Used to request a remote stream from a quickconnect instance. If the
    stream is already available in the calls remote streams, then the callback
    will be triggered immediately, otherwise this function will monitor
    `stream:added` events and wait for a match.

    In the case that an unknown target is requested, then an exception will
    be thrown.
  **/
  signaller.requestStream = function(targetId, idx, callback) {
    var call = getActiveCall(targetId);
    var stream;

    function waitForStream(peerId) {
      if (peerId !== targetId) {
        return;
      }

      // get the stream
      stream = call.pc.getRemoteStreams()[idx];

      // if we have the stream, then remove the listener and trigger the cb
      if (stream) {
        signaller.removeListener('stream:added', waitForStream);
        callback(null, stream);
      }
    }

    // look for the stream in the remote streams of the call
    stream = call.pc.getRemoteStreams()[idx];

    // if we found the stream then trigger the callback
    if (stream) {
      callback(null, stream);
      return signaller;
    }

    // otherwise wait for the stream
    signaller.on('stream:added', waitForStream);
    return signaller;
  };

  /**
    #### profile(data)

    Update the profile data with the attached information, so when
    the signaller announces it includes this data in addition to any
    room and id information.

  **/
  signaller.profile = function(data) {
    extend(profile, data);

    // if we have already announced, then reannounce our profile to provide
    // others a `peer:update` event
    if (announced) {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(function() {
        signaller.announce(profile);
      }, (opts || {}).updateDelay || 1000);
    }

    return signaller;
  };

  /**
    #### waitForCall

    ```
    waitForCall(targetId, callback)
    ```

    Wait for a call from the specified targetId.  If the call is already
    active the callback will be fired immediately, otherwise we will wait
    for a `call:started` event that matches the requested `targetId`

  **/
  signaller.waitForCall = function(targetId, callback) {
    var call = calls.get(targetId);

    if (call && call.active) {
      callback(null, call.pc);
      return signaller;
    }

    signaller.on('call:started', function handleNewCall(id) {
      if (id === targetId) {
        signaller.removeListener('call:started', handleNewCall);
        callback(null, calls.get(id).pc);
      }
    });
  };

  // if we have an expected number of local streams, then use a filter to
  // check if we should respond
  if (expectedLocalStreams) {
    signaller.on('peer:filter', handlePeerFilter);
  }

  // respond to local announce messages
  signaller.on('local:announce', handleLocalAnnounce);

  // handle ping messages
  signaller.on('message:ping', handlePing);

  // use genice to find our iceServers
  require('rtc-core/genice')(opts, function(err, servers) {
    if (err) {
      return console.error('could not find iceServers: ', err);
    }

    iceServers = servers;
    checkReadyToAnnounce();
  });

  // if we plugin is active, then initialize it
  if (plugin) {
    initPlugin();
  }

  // pass the signaller on
  return signaller;
};

}).call(this,require('_process'))

},{"./messenger":14,"_process":1,"cog/defaults":3,"cog/extend":4,"cog/getable":5,"mbus":15,"rtc-core/genice":10,"rtc-core/plugin":12,"rtc-signaller":30,"rtc-tools":53,"rtc-tools/cleanup":49}],14:[function(require,module,exports){
module.exports = function(messenger) {
  if (typeof messenger == 'function') {
    return messenger;
  }

  return require('rtc-switchboard-messenger')(messenger);
};

},{"rtc-switchboard-messenger":18}],15:[function(require,module,exports){
var createTrie = require('array-trie');
var reDelim = /[\.\:]/;

/**
  # mbus

  If Node's EventEmitter and Eve were to have a child, it might look something like this.
  No wildcard support at this stage though...

  ## Example Usage

  <<< docs/usage.md

  ## Reference

  ### `mbus(namespace?, parent?, scope?)`

  Create a new message bus with `namespace` inheriting from the `parent`
  mbus instance.  If events from this message bus should be triggered with
  a specific `this` scope, then specify it using the `scope` argument.

**/

var createBus = module.exports = function(namespace, parent, scope) {
  var registry = createTrie();
  var feeds = [];

  function bus(name) {
    var args = [].slice.call(arguments, 1);
    var parts = getNameParts(name);
    var delimited = parts.join('.');
    var handlers = registry.get(parts) || [];
    var results;

    // send through the feeds
    feeds.forEach(function(feed) {
      feed({ name: delimited, args: args });
    });

    // run the registered handlers
    results = [].concat(handlers).map(function(handler) {
      return handler.apply(scope || this, args);
    });

    // run the parent handlers
    if (bus.parent) {
      results = results.concat(
        bus.parent.apply(scope || this, [namespace.concat(parts)].concat(args))
      );
    }

    return results;
  }

  /**
    ### `mbus#clear()`

    Reset the handler registry, which essential deregisters all event listeners.

    _Alias:_ `removeAllListeners`
  **/
  function clear(name) {
    // if we have a name, reset handlers for that handler
    if (name) {
      registry.set(getNameParts(name), []);
    }
    // otherwise, reset the entire handler registry
    else {
      registry = createTrie();
    }
  }

  /**
    ### `mbus#feed(handler)`

    Attach a handler function that will see all events that are sent through
    this bus in an "object stream" format that matches the following format:

    ```
    { name: 'event.name', args: [ 'event', 'args' ] }
    ```

    The feed function returns a function that can be called to stop the feed
    sending data.

  **/
  function feed(handler) {
    function stop() {
      feeds.splice(feeds.indexOf(handler), 1);
    }

    feeds.push(handler);
    return stop;
  }

  function getNameParts(name) {
    return Array.isArray(name) ? name : (name ? name.split(reDelim) : []);
  }

  /**
    ### `mbus#off(name, handler)`

    Deregister an event handler.
  **/
  function off(name, handler) {
    var handlers = registry.get(getNameParts(name));
    var idx = handlers ? handlers.indexOf(handler) : -1;

    if (idx >= 0) {
      handlers.splice(idx, 1);
    }
  }

  /**
    ### `mbus#on(name, handler)`

    Register an event handler for the event `name`.

  **/
  function on(name, handler) {
    var parts = getNameParts(name);
    var handlers = registry.get(parts);

    if (handlers) {
      handlers.push(handler);
    }
    else {
      registry.set(parts, [ handler ]);
    }

    return bus;
  }


  /**
    ### `mbus#once(name, handler)`

    Register an event handler for the event `name` that will only
    trigger once (i.e. the handler will be deregistered immediately after
    being triggered the first time).

  **/
  function once(name, handler) {
    return on(name, function handleEvent() {
      var result = handler.apply(this, arguments);
      bus.off(name, handleEvent);

      return result;
    });
  }

  if (typeof namespace == 'function') {
    parent = namespace;
    namespace = '';
  }

  namespace = (namespace && namespace.split(reDelim)) || [];

  bus.clear = bus.removeAllListeners = clear;
  bus.feed = feed;
  bus.on = bus.addListener = on;
  bus.once = once;
  bus.off = bus.removeListener = off;
  bus.parent = parent || (namespace && namespace.length > 0 && createBus());

  return bus;
};

},{"array-trie":17}],16:[function(require,module,exports){
"use strict"

function compileSearch(funcName, predicate, reversed, extraArgs, useNdarray, earlyOut) {
  var code = [
    "function ", funcName, "(a,l,h,", extraArgs.join(","),  "){",
earlyOut ? "" : "var i=", (reversed ? "l-1" : "h+1"),
";while(l<=h){\
var m=(l+h)>>>1,x=a", useNdarray ? ".get(m)" : "[m]"]
  if(earlyOut) {
    if(predicate.indexOf("c") < 0) {
      code.push(";if(x===y){return m}else if(x<=y){")
    } else {
      code.push(";var p=c(x,y);if(p===0){return m}else if(p<=0){")
    }
  } else {
    code.push(";if(", predicate, "){i=m;")
  }
  if(reversed) {
    code.push("l=m+1}else{h=m-1}")
  } else {
    code.push("h=m-1}else{l=m+1}")
  }
  code.push("}")
  if(earlyOut) {
    code.push("return -1};")
  } else {
    code.push("return i};")
  }
  return code.join("")
}

function compileBoundsSearch(predicate, reversed, suffix, earlyOut) {
  var result = new Function([
  compileSearch("A", "x" + predicate + "y", reversed, ["y"], false, earlyOut),
  compileSearch("B", "x" + predicate + "y", reversed, ["y"], true, earlyOut),
  compileSearch("P", "c(x,y)" + predicate + "0", reversed, ["y", "c"], false, earlyOut),
  compileSearch("Q", "c(x,y)" + predicate + "0", reversed, ["y", "c"], true, earlyOut),
"function dispatchBsearch", suffix, "(a,y,c,l,h){\
if(a.shape){\
if(typeof(c)==='function'){\
return Q(a,(l===undefined)?0:l|0,(h===undefined)?a.shape[0]-1:h|0,y,c)\
}else{\
return B(a,(c===undefined)?0:c|0,(l===undefined)?a.shape[0]-1:l|0,y)\
}}else{\
if(typeof(c)==='function'){\
return P(a,(l===undefined)?0:l|0,(h===undefined)?a.length-1:h|0,y,c)\
}else{\
return A(a,(c===undefined)?0:c|0,(l===undefined)?a.length-1:l|0,y)\
}}}\
return dispatchBsearch", suffix].join(""))
  return result()
}

module.exports = {
  ge: compileBoundsSearch(">=", false, "GE"),
  gt: compileBoundsSearch(">", false, "GT"),
  lt: compileBoundsSearch("<", true, "LT"),
  le: compileBoundsSearch("<=", true, "LE"),
  eq: compileBoundsSearch("-", true, "EQ", true)
}

},{}],17:[function(require,module,exports){
"use strict"

var bounds = require("binary-search-bounds")

module.exports = createTrie

function Trie(symbols, children, value) {
  this.symbols = symbols
  this.children = children
  this.value = value
}

var proto = Trie.prototype

proto.set = function(s, value) {
  if(s.shape) {
    var v = this
    var n = s.shape[0]
    for(var i=0; i<n; ++i) {
      var c = s.get(i)
      var j = bounds.ge(v.symbols, c)
      if(j < v.symbols.length && v.symbols[j] === c) {
        v = v.children[j]
      } else {
        var l = new Trie([], [], value)
        for(var k=n-1; k>i; --k) {
          l = new Trie([s.get(k)], [l])
        }
        v.symbols.splice(j, 0, c)
        v.children.splice(j, 0, l)
        return value
      }
    }
    return v.value = value
  } else {
    var v = this
    var n = s.length
    for(var i=0; i<n; ++i) {
      var c = s[i]
      var j = bounds.ge(v.symbols, c)
      if(j < v.symbols.length && v.symbols[j] === c) {
        v = v.children[j]
      } else {
        var l = new Trie([], [], value)
        for(var k=n-1; k>i; --k) {
          l = new Trie([s[k]], [l])
        }
        v.symbols.splice(j, 0, c)
        v.children.splice(j, 0, l)
        return value
      }
    }
    return v.value = value
  }
}

proto.get = function(s) {
  if(s.shape) {
    var v = this
    var n = s.shape[0]
    for(var i=0; i<n; ++i) {
      var c = s.get(i)
      var j = bounds.eq(v.symbols, c)
      if(j < 0) {
        return
      }
      v = v.children[j]
    }
    return v.value
  } else {
    var v = this
    var n = s.length
    for(var i=0; i<n; ++i) {
      var c = s[i]
      var j = bounds.eq(v.symbols, c)
      if(j < 0) {
        return
      }
      v = v.children[j]
    }
    return v.value
  }
}

function createTrie() {
  return new Trie([],[])
}
},{"binary-search-bounds":16}],18:[function(require,module,exports){
var extend = require('cog/extend');

/**
  # rtc-switchboard-messenger

  A specialised version of
  [`messenger-ws`](https://github.com/DamonOehlman/messenger-ws) designed to
  connect to [`rtc-switchboard`](http://github.com/rtc-io/rtc-switchboard)
  instances.

**/
module.exports = function(switchboard, opts) {
  return require('messenger-ws')(switchboard, extend({
    endpoints: ['/primus', '/']
  }, opts));
};

},{"cog/extend":4,"messenger-ws":19}],19:[function(require,module,exports){
var WebSocket = require('ws');
var wsurl = require('wsurl');
var ps = require('pull-ws');
var defaults = require('cog/defaults');
var reTrailingSlash = /\/$/;

/**
  # messenger-ws

  This is a simple messaging implementation for sending and receiving data
  via websockets.

  Follows the [messenger-archetype](https://github.com/DamonOehlman/messenger-archetype)

  ## Example Usage

  <<< examples/simple.js

**/
module.exports = function(url, opts) {
  var timeout = (opts || {}).timeout || 1000;
  var endpoints = ((opts || {}).endpoints || ['/']).map(function(endpoint) {
    return url.replace(reTrailingSlash, '') + endpoint;
  });

  function connect(callback) {
    var queue = [].concat(endpoints);
    var receivedData = false;
    var failTimer;
    var successTimer;

    function attemptNext() {
      var socket;

      function registerMessage(evt) {
        receivedData = true;
        (socket.removeEventListener || socket.removeListener)('message', registerMessage);
      }

      // if we have no more valid endpoints, then erorr out
      if (queue.length === 0) {
        return callback(new Error('Unable to connect to url: ' + url));
      }

      socket = new WebSocket(wsurl(queue.shift()));
      socket.addEventListener('error', handleError);
      socket.addEventListener('close', handleAbnormalClose);
      socket.addEventListener('open', function() {
        // create the source immediately to buffer any data
        var source = ps.source(socket, opts);

        // monitor data flowing from the socket
        socket.addEventListener('message', registerMessage);

        successTimer = setTimeout(function() {
          clearTimeout(failTimer);
          callback(null, source, ps.sink(socket, opts));
        }, 100);
      });

      failTimer = setTimeout(attemptNext, timeout);
    }

    function handleAbnormalClose(evt) {
      // if this was a clean close do nothing
      if (evt.wasClean && receivedData && queue.length === 0) {
        return;
      }

      return handleError();
    }

    function handleError() {
      clearTimeout(successTimer);
      clearTimeout(failTimer);
      attemptNext();
    }

    attemptNext();
  }

  return connect;
};

},{"cog/defaults":3,"pull-ws":20,"ws":25,"wsurl":26}],20:[function(require,module,exports){
exports = module.exports = duplex;

exports.source = require('./source');
exports.sink = require('./sink');

function duplex (ws, opts) {
  return {
    source: exports.source(ws),
    sink: exports.sink(ws, opts)
  };
};

},{"./sink":23,"./source":24}],21:[function(require,module,exports){
exports.id = 
function (item) {
  return item
}

exports.prop = 
function (map) {  
  if('string' == typeof map) {
    var key = map
    return function (data) { return data[key] }
  }
  return map
}

exports.tester = function (test) {
  if(!test) return exports.id
  if('object' === typeof test
    && 'function' === typeof test.test)
      return test.test.bind(test)
  return exports.prop(test) || exports.id
}

exports.addPipe = addPipe

function addPipe(read) {
  if('function' !== typeof read)
    return read

  read.pipe = read.pipe || function (reader) {
    if('function' != typeof reader && 'function' != typeof reader.sink)
      throw new Error('must pipe to reader')
    var pipe = addPipe(reader.sink ? reader.sink(read) : reader(read))
    return reader.source || pipe;
  }
  
  read.type = 'Source'
  return read
}

var Source =
exports.Source =
function Source (createRead) {
  function s() {
    var args = [].slice.call(arguments)
    return addPipe(createRead.apply(null, args))
  }
  s.type = 'Source'
  return s
}


var Through =
exports.Through = 
function (createRead) {
  return function () {
    var args = [].slice.call(arguments)
    var piped = []
    function reader (read) {
      args.unshift(read)
      read = createRead.apply(null, args)
      while(piped.length)
        read = piped.shift()(read)
      return read
      //pipeing to from this reader should compose...
    }
    reader.pipe = function (read) {
      piped.push(read) 
      if(read.type === 'Source')
        throw new Error('cannot pipe ' + reader.type + ' to Source')
      reader.type = read.type === 'Sink' ? 'Sink' : 'Through'
      return reader
    }
    reader.type = 'Through'
    return reader
  }
}

var Sink =
exports.Sink = 
function Sink(createReader) {
  return function () {
    var args = [].slice.call(arguments)
    if(!createReader)
      throw new Error('must be createReader function')
    function s (read) {
      args.unshift(read)
      return createReader.apply(null, args)
    }
    s.type = 'Sink'
    return s
  }
}


exports.maybeSink = 
exports.maybeDrain = 
function (createSink, cb) {
  if(!cb)
    return Through(function (read) {
      var ended
      return function (close, cb) {
        if(close) return read(close, cb)
        if(ended) return cb(ended)

        createSink(function (err, data) {
          ended = err || true
          if(!err) cb(null, data)
          else     cb(ended)
        }) (read)
      }
    })()

  return Sink(function (read) {
    return createSink(cb) (read)
  })()
}


},{}],22:[function(require,module,exports){
module.exports = function(socket, callback) {
  var remove = socket && (socket.removeEventListener || socket.removeListener);

  function cleanup () {
    if (typeof remove == 'function') {
      remove.call(socket, 'open', handleOpen);
      remove.call(socket, 'error', handleErr);
    }
  }

  function handleOpen(evt) {
    cleanup(); callback();
  }

  function handleErr (evt) {
    cleanup(); callback(evt);
  }

  // if the socket is closing or closed, return end
  if (socket.readyState >= 2) {
    return callback(true);
  }

  // if open, trigger the callback
  if (socket.readyState === 1) {
    return callback();
  }

  socket.addEventListener('open', handleOpen);
  socket.addEventListener('error', handleErr);
};

},{}],23:[function(require,module,exports){
(function (process){
var pull = require('pull-core');
var ready = require('./ready');

/**
  ### `sink(socket, opts?)`

  Create a pull-stream `Sink` that will write data to the `socket`.

  <<< examples/write.js

**/
module.exports = pull.Sink(function(read, socket, opts) {
  opts = opts || {}
  var closeOnEnd = opts.closeOnEnd !== false;
  var onClose = 'function' === typeof opts ? opts : opts.onClose;

  function next(end, data) {
    // if the stream has ended, simply return
    if (end) {
      if (closeOnEnd && socket.readyState <= 1) {
        if(onClose)
          socket.addEventListener('close', function (ev) {
            if(ev.wasClean) onClose()
            else {
              var err = new Error('ws error')
              err.event = ev
              onClose(err)
            }
          });

        socket.close();
      }

      return;
    }

    // socket ready?
    ready(socket, function(end) {
      if (end) {
        return read(end, function () {});
      }

      socket.send(data);
      process.nextTick(function() {
        read(null, next);
      });
    });
  }

  read(null, next);
});

}).call(this,require('_process'))

},{"./ready":22,"_process":1,"pull-core":21}],24:[function(require,module,exports){
var pull = require('pull-core');
var ready = require('./ready');

/**
  ### `source(socket)`

  Create a pull-stream `Source` that will read data from the `socket`.

  <<< examples/read.js

**/
module.exports = pull.Source(function(socket) {
  var buffer = [];
  var receiver;
  var ended;

  socket.addEventListener('message', function(evt) {
    if (receiver) {
      return receiver(null, evt.data);
    }

    buffer.push(evt.data);
  });

  socket.addEventListener('close', function(evt) {
    if (ended) return;
    if (receiver) {
      return receiver(ended = true);
    }
  });

  socket.addEventListener('error', function (evt) {
    if (ended) return;
    ended = evt;
    if (receiver) {
      receiver(ended);
    }
  });

  function read(abort, cb) {
    receiver = null;

    //if stream has already ended.
    if (ended)
      return cb(ended)

    // if ended, abort
    if (abort) {
      //this will callback when socket closes
      receiver = cb
      return socket.close()
    }

    ready(socket, function(end) {
      if (end) {
        return cb(ended = end);
      }

      // read from the socket
      if (ended && ended !== true) {
        return cb(ended);
      }
      else if (buffer.length > 0) {
        return cb(null, buffer.shift());
      }
      else if (ended) {
        return cb(true);
      }

      receiver = cb;
    });
  };

  return read;
});

},{"./ready":22,"pull-core":21}],25:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}],26:[function(require,module,exports){
var reHttpUrl = /^http(.*)$/;

/**
  # wsurl

  Given a url (including protocol relative urls - i.e. `//`), generate an appropriate
  url for a WebSocket endpoint (`ws` or `wss`).

  ## Example Usage

  <<< examples/relative.js

**/

module.exports = function(url, opts) {
  var current = (opts || {}).current || (typeof location != 'undefined' && location.href);
  var currentProtocol = current && current.slice(0, current.indexOf(':'));
  var insecure = (opts || {}).insecure;
  var isRelative = url.slice(0, 2) == '//';
  var forceWS = (! currentProtocol) || currentProtocol === 'file:';

  if (isRelative) {
    return forceWS ?
      ((insecure ? 'ws:' : 'wss:') + url) :
      (currentProtocol.replace(reHttpUrl, 'ws$1') + ':' + url);
  }

  return url.replace(reHttpUrl, 'ws$1');
};

},{}],27:[function(require,module,exports){
module.exports = {
  // messenger events
  dataEvent: 'data',
  openEvent: 'open',
  closeEvent: 'close',
  errorEvent: 'error',

  // messenger functions
  writeMethod: 'write',
  closeMethod: 'close',

  // leave timeout (ms)
  leaveTimeout: 3000
};

},{}],28:[function(require,module,exports){
/* jshint node: true */
'use strict';

var extend = require('cog/extend');

/**
  #### announce

  ```
  /announce|%metadata%|{"id": "...", ... }
  ```

  When an announce message is received by the signaller, the attached
  object data is decoded and the signaller emits an `announce` message.

**/
module.exports = function(signaller) {

  function dataAllowed(data) {
    var cloned = extend({ allow: true }, data);
    signaller('peer:filter', data.id, cloned);

    return cloned.allow;
  }

  return function(args, messageType, srcData, srcState, isDM) {
    var data = args[0];
    var peer;

    // if we have valid data then process
    if (data && data.id && data.id !== signaller.id) {
      if (! dataAllowed(data)) {
        return;
      }
      // check to see if this is a known peer
      peer = signaller.peers.get(data.id);

      // trigger the peer connected event to flag that we know about a
      // peer connection. The peer has passed the "filter" check but may
      // be announced / updated depending on previous connection status
      signaller('peer:connected', data.id, data);

      // if the peer is existing, then update the data
      if (peer && (! peer.inactive)) {
        // update the data
        extend(peer.data, data);

        // trigger the peer update event
        return signaller('peer:update', data, srcData);
      }

      // create a new peer
      peer = {
        id: data.id,

        // initialise the local role index
        roleIdx: [data.id, signaller.id].sort().indexOf(data.id),

        // initialise the peer data
        data: {}
      };

      // initialise the peer data
      extend(peer.data, data);

      // reset inactivity state
      clearTimeout(peer.leaveTimer);
      peer.inactive = false;

      // set the peer data
      signaller.peers.set(data.id, peer);

      // if this is an initial announce message (no vector clock attached)
      // then send a announce reply
      if (signaller.autoreply && (! isDM)) {
        signaller
          .to(data.id)
          .send('/announce', signaller.attributes);
      }

      // emit a new peer announce event
      return signaller('peer:announce', data, peer);
    }
  };
};

},{"cog/extend":4}],29:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ### signaller message handlers

**/

module.exports = function(signaller, opts) {
  return {
    announce: require('./announce')(signaller, opts)
  };
};

},{"./announce":28}],30:[function(require,module,exports){
/* jshint node: true */
'use strict';

var detect = require('rtc-core/detect');
var defaults = require('cog/defaults');
var extend = require('cog/extend');
var mbus = require('mbus');
var getable = require('cog/getable');
var uuid = require('cuid');
var pull = require('pull-stream');
var pushable = require('pull-pushable');

// ready state constants
var RS_DISCONNECTED = 0;
var RS_CONNECTING = 1;
var RS_CONNECTED = 2;

// initialise signaller metadata so we don't have to include the package.json
// TODO: make this checkable with some kind of prepublish script
var metadata = {
  version: '5.2.2'
};

/**
  # rtc-signaller

  The `rtc-signaller` module provides a transportless signalling
  mechanism for WebRTC.

  ## Purpose

  <<< docs/purpose.md

  ## Getting Started

  While the signaller is capable of communicating by a number of different
  messengers (i.e. anything that can send and receive messages over a wire)
  it comes with support for understanding how to connect to an
  [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard) out of the box.

  The following code sample demonstrates how:

  <<< examples/getting-started.js

  <<< docs/events.md

  <<< docs/signalflow-diagrams.md

  ## Reference

  The `rtc-signaller` module is designed to be used primarily in a functional
  way and when called it creates a new signaller that will enable
  you to communicate with other peers via your messaging network.

  ```js
  // create a signaller from something that knows how to send messages
  var signaller = require('rtc-signaller')(messenger);
  ```

  As demonstrated in the getting started guide, you can also pass through
  a string value instead of a messenger instance if you simply want to
  connect to an existing `rtc-switchboard` instance.

**/
module.exports = function(messenger, opts) {
  // get the autoreply setting
  var autoreply = (opts || {}).autoreply;
  var autoconnect = (opts || {}).autoconnect;
  var reconnect = (opts || {}).reconnect;

  // initialise the metadata
  var localMeta = {};

  // create the signaller
  var signaller = mbus('', (opts || {}).logger);

  // initialise the id
  var id = signaller.id = (opts || {}).id || uuid();

  // initialise the attributes
  var attributes = signaller.attributes = {
    browser: detect.browser,
    browserVersion: detect.browserVersion,
    id: id,
    agent: 'signaller@' + metadata.version
  };

  // create the peers map
  var peers = signaller.peers = getable({});

  // create the outbound message queue
  var queue = require('pull-pushable')();

  var processor;
  var announceTimer = 0;
  var readyState = RS_DISCONNECTED;

  function announceOnReconnect() {
    signaller.announce();
  }

  function bufferMessage(args) {
    queue.push(createDataLine(args));

    // if we are not connected (and should autoconnect), then attempt connection
    if (readyState === RS_DISCONNECTED && (autoconnect === undefined || autoconnect)) {
      connect();
    }
  }

  function createDataLine(args) {
    return args.map(prepareArg).join('|');
  }

  function createMetadata() {
    return extend({}, localMeta, { id: signaller.id });
  }

  function handleDisconnect() {
    if (reconnect === undefined || reconnect) {
      setTimeout(connect, 50);
    }
  }

  function prepareArg(arg) {
    if (typeof arg == 'object' && (! (arg instanceof String))) {
      return JSON.stringify(arg);
    }
    else if (typeof arg == 'function') {
      return null;
    }

    return arg;
  }

  /**
    ### `signaller.connect()`

    Manually connect the signaller using the supplied messenger.

    __NOTE:__ This should never have to be called if the default setting
    for `autoconnect` is used.
  **/
  var connect = signaller.connect = function() {
    // if we are already connecting then do nothing
    if (readyState === RS_CONNECTING) {
      return;
    }

    // initiate the messenger
    readyState = RS_CONNECTING;
    messenger(function(err, source, sink) {
      if (err) {
        readyState = RS_DISCONNECTED;
        return signaller('error', err);
      }

      // flag as connected
      readyState = RS_CONNECTED;

      // pass messages to the processor
      pull(
        source,

        // monitor disconnection
        pull.through(null, function() {
          readyState = RS_DISCONNECTED;
          signaller('disconnected');
        }),
        pull.drain(processor)
      );

      // pass the queue to the sink
      pull(queue, sink);

      // handle disconnection
      signaller.removeListener('disconnected', handleDisconnect);
      signaller.on('disconnected', handleDisconnect);

      // trigger the connected event
      signaller('connected');
    });
  };

  /**
    ### signaller#send(message, data*)

    Use the send function to send a message to other peers in the current
    signalling scope (if announced in a room this will be a room, otherwise
    broadcast to all peers connected to the signalling server).

  **/
  var send = signaller.send = function() {
    // iterate over the arguments and stringify as required
    // var metadata = { id: signaller.id };
    var args = [].slice.call(arguments);

    // inject the metadata
    args.splice(1, 0, createMetadata());
    bufferMessage(args);
  };

  /**
    ### announce(data?)

    The `announce` function of the signaller will pass an `/announce` message
    through the messenger network.  When no additional data is supplied to
    this function then only the id of the signaller is sent to all active
    members of the messenging network.

    #### Joining Rooms

    To join a room using an announce call you simply provide the name of the
    room you wish to join as part of the data block that you annouce, for
    example:

    ```js
    signaller.announce({ room: 'testroom' });
    ```

    Signalling servers (such as
    [rtc-switchboard](https://github.com/rtc-io/rtc-switchboard)) will then
    place your peer connection into a room with other peers that have also
    announced in this room.

    Once you have joined a room, the server will only deliver messages that
    you `send` to other peers within that room.

    #### Providing Additional Announce Data

    There may be instances where you wish to send additional data as part of
    your announce message in your application.  For instance, maybe you want
    to send an alias or nick as part of your announce message rather than just
    use the signaller's generated id.

    If for instance you were writing a simple chat application you could join
    the `webrtc` room and tell everyone your name with the following announce
    call:

    ```js
    signaller.announce({
      room: 'webrtc',
      nick: 'Damon'
    });
    ```

    #### Announcing Updates

    The signaller is written to distinguish between initial peer announcements
    and peer data updates (see the docs on the announce handler below). As
    such it is ok to provide any data updates using the announce method also.

    For instance, I could send a status update as an announce message to flag
    that I am going offline:

    ```js
    signaller.announce({ status: 'offline' });
    ```

  **/
  signaller.announce = function(data, sender) {

    function sendAnnounce() {
      (sender || send)('/announce', attributes);
      signaller('local:announce', attributes);
    }

    // if we are already connected, then ensure we announce on reconnect
    if (readyState === RS_CONNECTED) {
      // always announce on reconnect
      signaller.removeListener('connected', announceOnReconnect);
      signaller.on('connected', announceOnReconnect);
    }

    clearTimeout(announceTimer);

    // update internal attributes
    extend(attributes, data, { id: signaller.id });

    // send the attributes over the network
    return announceTimer = setTimeout(sendAnnounce, (opts || {}).announceDelay || 10);
  };

  /**
    ### isMaster(targetId)

    A simple function that indicates whether the local signaller is the master
    for it's relationship with peer signaller indicated by `targetId`.  Roles
    are determined at the point at which signalling peers discover each other,
    and are simply worked out by whichever peer has the lowest signaller id
    when lexigraphically sorted.

    For example, if we have two signaller peers that have discovered each
    others with the following ids:

    - `b11f4fd0-feb5-447c-80c8-c51d8c3cced2`
    - `8a07f82e-49a5-4b9b-a02e-43d911382be6`

    They would be assigned roles:

    - `b11f4fd0-feb5-447c-80c8-c51d8c3cced2`
    - `8a07f82e-49a5-4b9b-a02e-43d911382be6` (master)

  **/
  signaller.isMaster = function(targetId) {
    var peer = peers.get(targetId);

    return peer && peer.roleIdx !== 0;
  };

  /**
    ### leave()

    Tell the signalling server we are leaving.  Calling this function is
    usually not required though as the signalling server should issue correct
    `/leave` messages when it detects a disconnect event.

  **/
  signaller.leave = signaller.close = function() {
    // send the leave signal
    send('/leave', { id: id });

    // stop announcing on reconnect
    signaller.removeListener('disconnected', handleDisconnect);
    signaller.removeListener('connected', announceOnReconnect);

    // end our current queue
    queue.end();

    // create a new queue to buffer new messages
    queue = pushable();

    // set connected to false
    readyState = RS_DISCONNECTED;
  };

  /**
    ### metadata(data?)

    Get (pass no data) or set the metadata that is passed through with each
    request sent by the signaller.

    __NOTE:__ Regardless of what is passed to this function, metadata
    generated by the signaller will **always** include the id of the signaller
    and this cannot be modified.
  **/
  signaller.metadata = function(data) {
    if (arguments.length === 0) {
      return extend({}, localMeta);
    }

    localMeta = extend({}, data);
  };

  /**
    ### to(targetId)

    Use the `to` function to send a message to the specified target peer.
    A large parge of negotiating a WebRTC peer connection involves direct
    communication between two parties which must be done by the signalling
    server.  The `to` function provides a simple way to provide a logical
    communication channel between the two parties:

    ```js
    var send = signaller.to('e95fa05b-9062-45c6-bfa2-5055bf6625f4').send;

    // create an offer on a local peer connection
    pc.createOffer(
      function(desc) {
        // set the local description using the offer sdp
        // if this occurs successfully send this to our peer
        pc.setLocalDescription(
          desc,
          function() {
            send('/sdp', desc);
          },
          handleFail
        );
      },
      handleFail
    );
    ```

  **/
  signaller.to = function(targetId) {
    // create a sender that will prepend messages with /to|targetId|
    var sender = function() {
      // get the peer (yes when send is called to make sure it hasn't left)
      var peer = signaller.peers.get(targetId);
      var args;

      if (! peer) {
        throw new Error('Unknown peer: ' + targetId);
      }

      // if the peer is inactive, then abort
      if (peer.inactive) {
        return;
      }

      args = [
        '/to',
        targetId
      ].concat([].slice.call(arguments));

      // inject metadata
      args.splice(3, 0, createMetadata());
      bufferMessage(args);
    };

    return {
      announce: function(data) {
        return signaller.announce(data, sender);
      },

      send: sender,
    };
  };

  // initialise opts defaults
  opts = defaults({}, opts, require('./defaults'));

  // set the autoreply flag
  signaller.autoreply = autoreply === undefined || autoreply;

  // create the processor
  signaller.process = processor = require('./processor')(signaller, opts);

  // autoconnect
  if (autoconnect === undefined || autoconnect) {
    connect();
  }

  return signaller;
};

},{"./defaults":27,"./processor":48,"cog/defaults":3,"cog/extend":4,"cog/getable":5,"cuid":31,"mbus":32,"pull-pushable":35,"pull-stream":42,"rtc-core/detect":9}],31:[function(require,module,exports){
/**
 * cuid.js
 * Collision-resistant UID generator for browsers and node.
 * Sequential for fast db lookups and recency sorting.
 * Safe for element IDs and server-side lookups.
 *
 * Extracted from CLCTR
 * 
 * Copyright (c) Eric Elliott 2012
 * MIT License
 */

/*global window, navigator, document, require, process, module */
(function (app) {
  'use strict';
  var namespace = 'cuid',
    c = 0,
    blockSize = 4,
    base = 36,
    discreteValues = Math.pow(base, blockSize),

    pad = function pad(num, size) {
      var s = "000000000" + num;
      return s.substr(s.length-size);
    },

    randomBlock = function randomBlock() {
      return pad((Math.random() *
            discreteValues << 0)
            .toString(base), blockSize);
    },

    safeCounter = function () {
      c = (c < discreteValues) ? c : 0;
      c++; // this is not subliminal
      return c - 1;
    },

    api = function cuid() {
      // Starting with a lowercase letter makes
      // it HTML element ID friendly.
      var letter = 'c', // hard-coded allows for sequential access

        // timestamp
        // warning: this exposes the exact date and time
        // that the uid was created.
        timestamp = (new Date().getTime()).toString(base),

        // Prevent same-machine collisions.
        counter,

        // A few chars to generate distinct ids for different
        // clients (so different computers are far less
        // likely to generate the same id)
        fingerprint = api.fingerprint(),

        // Grab some more chars from Math.random()
        random = randomBlock() + randomBlock();

        counter = pad(safeCounter().toString(base), blockSize);

      return  (letter + timestamp + counter + fingerprint + random);
    };

  api.slug = function slug() {
    var date = new Date().getTime().toString(36),
      counter,
      print = api.fingerprint().slice(0,1) +
        api.fingerprint().slice(-1),
      random = randomBlock().slice(-2);

      counter = safeCounter().toString(36).slice(-4);

    return date.slice(-2) + 
      counter + print + random;
  };

  api.globalCount = function globalCount() {
    // We want to cache the results of this
    var cache = (function calc() {
        var i,
          count = 0;

        for (i in window) {
          count++;
        }

        return count;
      }());

    api.globalCount = function () { return cache; };
    return cache;
  };

  api.fingerprint = function browserPrint() {
    return pad((navigator.mimeTypes.length +
      navigator.userAgent.length).toString(36) +
      api.globalCount().toString(36), 4);
  };

  // don't change anything from here down.
  if (app.register) {
    app.register(namespace, api);
  } else if (typeof module !== 'undefined') {
    module.exports = api;
  } else {
    app[namespace] = api;
  }

}(this.applitude || this));

},{}],32:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"array-trie":34,"dup":15}],33:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"dup":16}],34:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"binary-search-bounds":33,"dup":17}],35:[function(require,module,exports){
var pull = require('pull-stream')

module.exports = pull.Source(function (onClose) {
  var buffer = [], cbs = [], waiting = [], ended

  function drain() {
    var l
    while(waiting.length && ((l = buffer.length) || ended)) {
      var data = buffer.shift()
      var cb   = cbs.shift()
      waiting.shift()(l ? null : ended, data)
      cb && cb(ended === true ? null : ended)
    }
  }

  function read (end, cb) {
    ended = ended || end
    waiting.push(cb)
    drain()
    if(ended)
      onClose && onClose(ended === true ? null : ended)
  }

  read.push = function (data, cb) {
    if(ended)
      return cb && cb(ended === true ? null : ended)
    buffer.push(data); cbs.push(cb)
    drain()
  }

  read.end = function (end, cb) {
    if('function' === typeof end)
      cb = end, end = true
    ended = ended || end || true;
    if(cb) cbs.push(cb)
    drain()
    if(ended)
      onClose && onClose(ended === true ? null : ended)
  }

  return read
})


},{"pull-stream":36}],36:[function(require,module,exports){

var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')
var u        = require('pull-core')

for(var k in sources)
  exports[k] = u.Source(sources[k])

for(var k in throughs)
  exports[k] = u.Through(throughs[k])

for(var k in sinks)
  exports[k] = u.Sink(sinks[k])

var maybe = require('./maybe')(exports)

for(var k in maybe)
  exports[k] = maybe[k]

exports.Duplex  = 
exports.Through = exports.pipeable       = u.Through
exports.Source  = exports.pipeableSource = u.Source
exports.Sink    = exports.pipeableSink   = u.Sink



},{"./maybe":37,"./sinks":39,"./sources":40,"./throughs":41,"pull-core":38}],37:[function(require,module,exports){
var u = require('pull-core')
var prop = u.prop
var id   = u.id
var maybeSink = u.maybeSink

module.exports = function (pull) {

  var exports = {}
  var drain = pull.drain

  var find = 
  exports.find = function (test, cb) {
    return maybeSink(function (cb) {
      var ended = false
      if(!cb)
        cb = test, test = id
      else
        test = prop(test) || id

      return drain(function (data) {
        if(test(data)) {
          ended = true
          cb(null, data)
        return false
        }
      }, function (err) {
        if(ended) return //already called back
        cb(err === true ? null : err, null)
      })

    }, cb)
  }

  var reduce = exports.reduce = 
  function (reduce, acc, cb) {
    
    return maybeSink(function (cb) {
      return drain(function (data) {
        acc = reduce(acc, data)
      }, function (err) {
        cb(err, acc)
      })

    }, cb)
  }

  var collect = exports.collect = exports.writeArray =
  function (cb) {
    return reduce(function (arr, item) {
      arr.push(item)
      return arr
    }, [], cb)
  }

  return exports
}

},{"pull-core":38}],38:[function(require,module,exports){
exports.id = 
function (item) {
  return item
}

exports.prop = 
function (map) {  
  if('string' == typeof map) {
    var key = map
    return function (data) { return data[key] }
  }
  return map
}

exports.tester = function (test) {
  if(!test) return exports.id
  if('object' === typeof test
    && 'function' === typeof test.test)
      return test.test.bind(test)
  return exports.prop(test) || exports.id
}

exports.addPipe = addPipe

function addPipe(read) {
  if('function' !== typeof read)
    return read

  read.pipe = read.pipe || function (reader) {
    if('function' != typeof reader)
      throw new Error('must pipe to reader')
    return addPipe(reader(read))
  }
  read.type = 'Source'
  return read
}

var Source =
exports.Source =
function Source (createRead) {
  function s() {
    var args = [].slice.call(arguments)
    return addPipe(createRead.apply(null, args))
  }
  s.type = 'Source'
  return s
}


var Through =
exports.Through = 
function (createRead) {
  return function () {
    var args = [].slice.call(arguments)
    var piped = []
    function reader (read) {
      args.unshift(read)
      read = createRead.apply(null, args)
      while(piped.length)
        read = piped.shift()(read)
      return read
      //pipeing to from this reader should compose...
    }
    reader.pipe = function (read) {
      piped.push(read) 
      if(read.type === 'Source')
        throw new Error('cannot pipe ' + reader.type + ' to Source')
      reader.type = read.type === 'Sink' ? 'Sink' : 'Through'
      return reader
    }
    reader.type = 'Through'
    return reader
  }
}

var Sink =
exports.Sink = 
function Sink(createReader) {
  return function () {
    var args = [].slice.call(arguments)
    if(!createReader)
      throw new Error('must be createReader function')
    function s (read) {
      args.unshift(read)
      return createReader.apply(null, args)
    }
    s.type = 'Sink'
    return s
  }
}


exports.maybeSink = 
exports.maybeDrain = 
function (createSink, cb) {
  if(!cb)
    return Through(function (read) {
      var ended
      return function (close, cb) {
        if(close) return read(close, cb)
        if(ended) return cb(ended)

        createSink(function (err, data) {
          ended = err || true
          if(!err) cb(null, data)
          else     cb(ended)
        }) (read)
      }
    })()

  return Sink(function (read) {
    return createSink(cb) (read)
  })()
}


},{}],39:[function(require,module,exports){
var drain = exports.drain = function (read, op, done) {

  ;(function next() {
    var loop = true, cbed = false
    while(loop) {
      cbed = false
      read(null, function (end, data) {
        cbed = true
        if(end) {
          loop = false
          done && done(end === true ? null : end)
        }
        else if(op && false === op(data)) {
          loop = false
          read(true, done || function () {})
        }
        else if(!loop){
          next()
        }
      })
      if(!cbed) {
        loop = false
        return
      }
    }
  })()
}

var onEnd = exports.onEnd = function (read, done) {
  return drain(read, null, done)
}

var log = exports.log = function (read, done) {
  return drain(read, function (data) {
    console.log(data)
  }, done)
}


},{}],40:[function(require,module,exports){

var keys = exports.keys =
function (object) {
  return values(Object.keys(object))
}

var once = exports.once =
function (value) {
  return function (abort, cb) {
    if(abort) return cb(abort)
    if(value != null) {
      var _value = value; value = null
      cb(null, _value)
    } else
      cb(true)
  }
}

var values = exports.values = exports.readArray =
function (array) {
  if(!Array.isArray(array))
    array = Object.keys(array).map(function (k) {
      return array[k]
    })
  var i = 0
  return function (end, cb) {
    if(end)
      return cb && cb(end)  
    cb(i >= array.length || null, array[i++])
  }
}


var count = exports.count = 
function (max) {
  var i = 0; max = max || Infinity
  return function (end, cb) {
    if(end) return cb && cb(end)
    if(i > max)
      return cb(true)
    cb(null, i++)
  }
}

var infinite = exports.infinite = 
function (generate) {
  generate = generate || Math.random
  return function (end, cb) {
    if(end) return cb && cb(end)
    return cb(null, generate())
  }
}

var defer = exports.defer = function () {
  var _read, cbs = [], _end

  var read = function (end, cb) {
    if(!_read) {
      _end = end
      cbs.push(cb)
    } 
    else _read(end, cb)
  }
  read.resolve = function (read) {
    if(_read) throw new Error('already resolved')
    _read = read
    if(!_read) throw new Error('no read cannot resolve!' + _read)
    while(cbs.length)
      _read(_end, cbs.shift())
  }
  read.abort = function(err) {
    read.resolve(function (_, cb) {
      cb(err || true)
    })
  }
  return read
}

var empty = exports.empty = function () {
  return function (abort, cb) {
    cb(true)
  }
}

var depthFirst = exports.depthFirst =
function (start, createStream) {
  var reads = []

  reads.unshift(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        //if this stream has ended, go to the next queue
        reads.shift()
        return next(null, cb)
      }
      reads.unshift(createStream(data))
      cb(end, data)
    })
  }
}
//width first is just like depth first,
//but push each new stream onto the end of the queue
var widthFirst = exports.widthFirst = 
function (start, createStream) {
  var reads = []

  reads.push(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        return next(null, cb)
      }
      reads.push(createStream(data))
      cb(end, data)
    })
  }
}

//this came out different to the first (strm)
//attempt at leafFirst, but it's still a valid
//topological sort.
var leafFirst = exports.leafFirst = 
function (start, createStream) {
  var reads = []
  var output = []
  reads.push(once(start))
  
  return function next (end, cb) {
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        if(!output.length)
          return cb(true)
        return cb(null, output.shift())
      }
      reads.unshift(createStream(data))
      output.unshift(data)
      next(null, cb)
    })
  }
}


},{}],41:[function(require,module,exports){
(function (process){
var u      = require('pull-core')
var sources = require('./sources')
var sinks = require('./sinks')

var prop   = u.prop
var id     = u.id
var tester = u.tester

var map = exports.map = 
function (read, map) {
  map = prop(map) || id
  return function (end, cb) {
    read(end, function (end, data) {
      var data = !end ? map(data) : null
      cb(end, data)
    })
  }
}

var asyncMap = exports.asyncMap =
function (read, map) {
  if(!map) return read
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    read(null, function (end, data) {
      if(end) return cb(end, data)
      map(data, cb)
    })
  }
}

var paraMap = exports.paraMap =
function (read, map, width) {
  if(!map) return read
  var ended = false, queue = [], _cb

  function drain () {
    if(!_cb) return
    var cb = _cb
    _cb = null
    if(queue.length)
      return cb(null, queue.shift())
    else if(ended && !n)
      return cb(ended)
    _cb = cb
  }

  function pull () {
    read(null, function (end, data) {
      if(end) {
        ended = end
        return drain()
      }
      n++
      map(data, function (err, data) {
        n--

        queue.push(data)
        drain()
      })

      if(n < width && !ended)
        pull()
    })
  }

  var n = 0
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    //continue to read while there are less than 3 maps in flight
    _cb = cb
    if(queue.length || ended)
      pull(), drain()
    else pull()
  }
  return highWaterMark(asyncMap(read, map), width)
}

var filter = exports.filter =
function (read, test) {
  //regexp
  test = tester(test)
  return function next (end, cb) {
    read(end, function (end, data) {
      if(!end && !test(data))
        return next(end, cb)
      cb(end, data)
    })
  }
}

var filterNot = exports.filterNot =
function (read, test) {
  test = tester(test)
  return filter(read, function (e) {
    return !test(e)
  })
}

var through = exports.through = 
function (read, op, onEnd) {
  var a = false
  function once (abort) {
    if(a || !onEnd) return
    a = true
    onEnd(abort === true ? null : abort)
  }

  return function (end, cb) {
    if(end) once(end)
    return read(end, function (end, data) {
      if(!end) op && op(data)
      else once(end)
      cb(end, data)
    })
  }
}

var take = exports.take =
function (read, test) {
  var ended = false
  if('number' === typeof test) {
    var n = test; test = function () {
      return n --
    }
  }

  return function (end, cb) {
    if(ended) return cb(ended)
    if(ended = end) return read(ended, cb)

    read(null, function (end, data) {
      if(ended = ended || end) return cb(ended)
      if(!test(data)) {
        ended = true
        read(true, function (end, data) {
          cb(ended, data)
        })
      }
      else
        cb(null, data)
    })
  }
}

var unique = exports.unique = function (read, field, invert) {
  field = prop(field) || id
  var seen = {}
  return filter(read, function (data) {
    var key = field(data)
    if(seen[key]) return !!invert //false, by default
    else seen[key] = true
    return !invert //true by default
  })
}

var nonUnique = exports.nonUnique = function (read, field) {
  return unique(read, field, true)
}

var group = exports.group =
function (read, size) {
  var ended; size = size || 5
  var queue = []

  return function (end, cb) {
    //this means that the upstream is sending an error.
    if(end) return read(ended = end, cb)
    //this means that we read an end before.
    if(ended) return cb(ended)

    read(null, function next(end, data) {
      if(ended = ended || end) {
        if(!queue.length)
          return cb(ended)

        var _queue = queue; queue = []
        return cb(null, _queue)
      }
      queue.push(data)
      if(queue.length < size)
        return read(null, next)

      var _queue = queue; queue = []
      cb(null, _queue)
    })
  }
}

var flatten = exports.flatten = function (read) {
  var _read
  return function (abort, cb) {
    if(_read) nextChunk()
    else      nextStream()

    function nextChunk () {
      _read(null, function (end, data) {
        if(end) nextStream()
        else    cb(null, data)
      })
    }
    function nextStream () {
      read(null, function (end, stream) {
        if(end)
          return cb(end)
        if(Array.isArray(stream))
          stream = sources.values(stream)
        else if('function' != typeof stream)
          throw new Error('expected stream of streams')
        
        _read = stream
        nextChunk()
      })
    }
  }
}

var prepend =
exports.prepend =
function (read, head) {

  return function (abort, cb) {
    if(head !== null) {
      if(abort)
        return read(abort, cb)
      var _head = head
      head = null
      cb(null, _head)
    } else {
      read(abort, cb)
    }
  }

}

//var drainIf = exports.drainIf = function (op, done) {
//  sinks.drain(
//}

var _reduce = exports._reduce = function (read, reduce, initial) {
  return function (close, cb) {
    if(close) return read(close, cb)
    if(ended) return cb(ended)

    sinks.drain(function (item) {
      initial = reduce(initial, item)
    }, function (err, data) {
      ended = err || true
      if(!err) cb(null, initial)
      else     cb(ended)
    })
    (read)
  }
}

var nextTick = process.nextTick

var highWaterMark = exports.highWaterMark = 
function (read, highWaterMark) {
  var buffer = [], waiting = [], ended, reading = false
  highWaterMark = highWaterMark || 10

  function readAhead () {
    while(waiting.length && (buffer.length || ended))
      waiting.shift()(ended, ended ? null : buffer.shift())
  }

  function next () {
    if(ended || reading || buffer.length >= highWaterMark)
      return
    reading = true
    return read(ended, function (end, data) {
      reading = false
      ended = ended || end
      if(data != null) buffer.push(data)
      
      next(); readAhead()
    })
  }

  nextTick(next)

  return function (end, cb) {
    ended = ended || end
    waiting.push(cb)

    next(); readAhead()
  }
}




}).call(this,require('_process'))

},{"./sinks":39,"./sources":40,"_process":1,"pull-core":38}],42:[function(require,module,exports){
var sources  = require('./sources')
var sinks    = require('./sinks')
var throughs = require('./throughs')
var u        = require('pull-core')

function isFunction (fun) {
  return 'function' === typeof fun
}

function isReader (fun) {
  return fun && (fun.type === "Through" || fun.length === 1)
}
var exports = module.exports = function pull () {
  var args = [].slice.call(arguments)

  if(isReader(args[0]))
    return function (read) {
      args.unshift(read)
      return pull.apply(null, args)
    }

  var read = args.shift()

  //if the first function is a duplex stream,
  //pipe from the source.
  if(isFunction(read.source))
    read = read.source

  function next () {
    var s = args.shift()

    if(null == s)
      return next()

    if(isFunction(s)) return s

    return function (read) {
      s.sink(read)
      //this supports pipeing through a duplex stream
      //pull(a, b, a) "telephone style".
      //if this stream is in the a (first & last position)
      //s.source will have already been used, but this should never be called
      //so that is okay.
      return s.source
    }
  }

  while(args.length)
    read = next() (read)

  return read
}


for(var k in sources)
  exports[k] = u.Source(sources[k])

for(var k in throughs)
  exports[k] = u.Through(throughs[k])

for(var k in sinks)
  exports[k] = u.Sink(sinks[k])

var maybe = require('./maybe')(exports)

for(var k in maybe)
  exports[k] = maybe[k]

exports.Duplex  = 
exports.Through = exports.pipeable       = u.Through
exports.Source  = exports.pipeableSource = u.Source
exports.Sink    = exports.pipeableSink   = u.Sink



},{"./maybe":43,"./sinks":45,"./sources":46,"./throughs":47,"pull-core":44}],43:[function(require,module,exports){
var u = require('pull-core')
var prop = u.prop
var id   = u.id
var maybeSink = u.maybeSink

module.exports = function (pull) {

  var exports = {}
  var drain = pull.drain

  var find =
  exports.find = function (test, cb) {
    return maybeSink(function (cb) {
      var ended = false
      if(!cb)
        cb = test, test = id
      else
        test = prop(test) || id

      return drain(function (data) {
        if(test(data)) {
          ended = true
          cb(null, data)
        return false
        }
      }, function (err) {
        if(ended) return //already called back
        cb(err === true ? null : err, null)
      })

    }, cb)
  }

  var reduce = exports.reduce =
  function (reduce, acc, cb) {

    return maybeSink(function (cb) {
      return drain(function (data) {
        acc = reduce(acc, data)
      }, function (err) {
        cb(err, acc)
      })

    }, cb)
  }

  var collect = exports.collect = exports.writeArray =
  function (cb) {
    return reduce(function (arr, item) {
      arr.push(item)
      return arr
    }, [], cb)
  }

  var concat = exports.concat =
  function (cb) {
    return reduce(function (a, b) {
      return a + b
    }, '', cb)
  }

  return exports
}

},{"pull-core":44}],44:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"dup":38}],45:[function(require,module,exports){
var drain = exports.drain = function (read, op, done) {

  ;(function next() {
    var loop = true, cbed = false
    while(loop) {
      cbed = false
      read(null, function (end, data) {
        cbed = true
        if(end) {
          loop = false
          if(done) done(end === true ? null : end)
          else if(end && end !== true)
            throw end
        }
        else if(op && false === op(data)) {
          loop = false
          read(true, done || function () {})
        }
        else if(!loop){
          next()
        }
      })
      if(!cbed) {
        loop = false
        return
      }
    }
  })()
}

var onEnd = exports.onEnd = function (read, done) {
  return drain(read, null, done)
}

var log = exports.log = function (read, done) {
  return drain(read, function (data) {
    console.log(data)
  }, done)
}


},{}],46:[function(require,module,exports){

var keys = exports.keys =
function (object) {
  return values(Object.keys(object))
}

var once = exports.once =
function (value) {
  return function (abort, cb) {
    if(abort) return cb(abort)
    if(value != null) {
      var _value = value; value = null
      cb(null, _value)
    } else
      cb(true)
  }
}

var values = exports.values = exports.readArray =
function (array) {
  if(!Array.isArray(array))
    array = Object.keys(array).map(function (k) {
      return array[k]
    })
  var i = 0
  return function (end, cb) {
    if(end)
      return cb && cb(end)
    cb(i >= array.length || null, array[i++])
  }
}


var count = exports.count =
function (max) {
  var i = 0; max = max || Infinity
  return function (end, cb) {
    if(end) return cb && cb(end)
    if(i > max)
      return cb(true)
    cb(null, i++)
  }
}

var infinite = exports.infinite =
function (generate) {
  generate = generate || Math.random
  return function (end, cb) {
    if(end) return cb && cb(end)
    return cb(null, generate())
  }
}

var defer = exports.defer = function () {
  var _read, cbs = [], _end

  var read = function (end, cb) {
    if(!_read) {
      _end = end
      cbs.push(cb)
    } 
    else _read(end, cb)
  }
  read.resolve = function (read) {
    if(_read) throw new Error('already resolved')
    _read = read
    if(!_read) throw new Error('no read cannot resolve!' + _read)
    while(cbs.length)
      _read(_end, cbs.shift())
  }
  read.abort = function(err) {
    read.resolve(function (_, cb) {
      cb(err || true)
    })
  }
  return read
}

var empty = exports.empty = function () {
  return function (abort, cb) {
    cb(true)
  }
}

var error = exports.error = function (err) {
  return function (abort, cb) {
    cb(err)
  }
}

var depthFirst = exports.depthFirst =
function (start, createStream) {
  var reads = []

  reads.unshift(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        //if this stream has ended, go to the next queue
        reads.shift()
        return next(null, cb)
      }
      reads.unshift(createStream(data))
      cb(end, data)
    })
  }
}
//width first is just like depth first,
//but push each new stream onto the end of the queue
var widthFirst = exports.widthFirst =
function (start, createStream) {
  var reads = []

  reads.push(once(start))

  return function next (end, cb) {
    if(!reads.length)
      return cb(true)
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        return next(null, cb)
      }
      reads.push(createStream(data))
      cb(end, data)
    })
  }
}

//this came out different to the first (strm)
//attempt at leafFirst, but it's still a valid
//topological sort.
var leafFirst = exports.leafFirst =
function (start, createStream) {
  var reads = []
  var output = []
  reads.push(once(start))

  return function next (end, cb) {
    reads[0](end, function (end, data) {
      if(end) {
        reads.shift()
        if(!output.length)
          return cb(true)
        return cb(null, output.shift())
      }
      reads.unshift(createStream(data))
      output.unshift(data)
      next(null, cb)
    })
  }
}


},{}],47:[function(require,module,exports){
(function (process){
var u      = require('pull-core')
var sources = require('./sources')
var sinks = require('./sinks')

var prop   = u.prop
var id     = u.id
var tester = u.tester

var map = exports.map =
function (read, map) {
  map = prop(map) || id
  return function (abort, cb) {
    read(abort, function (end, data) {
      try {
      data = !end ? map(data) : null
      } catch (err) {
        return read(err, function () {
          return cb(err)
        })
      }
      cb(end, data)
    })
  }
}

var asyncMap = exports.asyncMap =
function (read, map) {
  if(!map) return read
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    read(null, function (end, data) {
      if(end) return cb(end, data)
      map(data, cb)
    })
  }
}

var paraMap = exports.paraMap =
function (read, map, width) {
  if(!map) return read
  var ended = false, queue = [], _cb

  function drain () {
    if(!_cb) return
    var cb = _cb
    _cb = null
    if(queue.length)
      return cb(null, queue.shift())
    else if(ended && !n)
      return cb(ended)
    _cb = cb
  }

  function pull () {
    read(null, function (end, data) {
      if(end) {
        ended = end
        return drain()
      }
      n++
      map(data, function (err, data) {
        n--

        queue.push(data)
        drain()
      })

      if(n < width && !ended)
        pull()
    })
  }

  var n = 0
  return function (end, cb) {
    if(end) return read(end, cb) //abort
    //continue to read while there are less than 3 maps in flight
    _cb = cb
    if(queue.length || ended)
      pull(), drain()
    else pull()
  }
  return highWaterMark(asyncMap(read, map), width)
}

var filter = exports.filter =
function (read, test) {
  //regexp
  test = tester(test)
  return function next (end, cb) {
    var sync, loop = true
    while(loop) {
      loop = false
      sync = true
      read(end, function (end, data) {
        if(!end && !test(data))
          return sync ? loop = true : next(end, cb)
        cb(end, data)
      })
      sync = false
    }
  }
}

var filterNot = exports.filterNot =
function (read, test) {
  test = tester(test)
  return filter(read, function (e) {
    return !test(e)
  })
}

var through = exports.through =
function (read, op, onEnd) {
  var a = false
  function once (abort) {
    if(a || !onEnd) return
    a = true
    onEnd(abort === true ? null : abort)
  }

  return function (end, cb) {
    if(end) once(end)
    return read(end, function (end, data) {
      if(!end) op && op(data)
      else once(end)
      cb(end, data)
    })
  }
}

var take = exports.take =
function (read, test) {
  var ended = false
  if('number' === typeof test) {
    var n = test; test = function () {
      return n --
    }
  }

  return function (end, cb) {
    if(ended) return cb(ended)
    if(ended = end) return read(ended, cb)

    read(null, function (end, data) {
      if(ended = ended || end) return cb(ended)
      if(!test(data)) {
        ended = true
        read(true, function (end, data) {
          cb(ended, data)
        })
      }
      else
        cb(null, data)
    })
  }
}

var unique = exports.unique = function (read, field, invert) {
  field = prop(field) || id
  var seen = {}
  return filter(read, function (data) {
    var key = field(data)
    if(seen[key]) return !!invert //false, by default
    else seen[key] = true
    return !invert //true by default
  })
}

var nonUnique = exports.nonUnique = function (read, field) {
  return unique(read, field, true)
}

var group = exports.group =
function (read, size) {
  var ended; size = size || 5
  var queue = []

  return function (end, cb) {
    //this means that the upstream is sending an error.
    if(end) return read(ended = end, cb)
    //this means that we read an end before.
    if(ended) return cb(ended)

    read(null, function next(end, data) {
      if(ended = ended || end) {
        if(!queue.length)
          return cb(ended)

        var _queue = queue; queue = []
        return cb(null, _queue)
      }
      queue.push(data)
      if(queue.length < size)
        return read(null, next)

      var _queue = queue; queue = []
      cb(null, _queue)
    })
  }
}

var flatten = exports.flatten = function (read) {
  var _read
  return function (abort, cb) {
    if(_read) nextChunk()
    else      nextStream()

    function nextChunk () {
      _read(null, function (end, data) {
        if(end) nextStream()
        else    cb(null, data)
      })
    }
    function nextStream () {
      read(null, function (end, stream) {
        if(end)
          return cb(end)
        if(Array.isArray(stream) || stream && 'object' === typeof stream)
          stream = sources.values(stream)
        else if('function' != typeof stream)
          throw new Error('expected stream of streams')
        _read = stream
        nextChunk()
      })
    }
  }
}

var prepend =
exports.prepend =
function (read, head) {

  return function (abort, cb) {
    if(head !== null) {
      if(abort)
        return read(abort, cb)
      var _head = head
      head = null
      cb(null, _head)
    } else {
      read(abort, cb)
    }
  }

}

//var drainIf = exports.drainIf = function (op, done) {
//  sinks.drain(
//}

var _reduce = exports._reduce = function (read, reduce, initial) {
  return function (close, cb) {
    if(close) return read(close, cb)
    if(ended) return cb(ended)

    sinks.drain(function (item) {
      initial = reduce(initial, item)
    }, function (err, data) {
      ended = err || true
      if(!err) cb(null, initial)
      else     cb(ended)
    })
    (read)
  }
}

var nextTick = process.nextTick

var highWaterMark = exports.highWaterMark =
function (read, highWaterMark) {
  var buffer = [], waiting = [], ended, ending, reading = false
  highWaterMark = highWaterMark || 10

  function readAhead () {
    while(waiting.length && (buffer.length || ended))
      waiting.shift()(ended, ended ? null : buffer.shift())

    if (!buffer.length && ending) ended = ending;
  }

  function next () {
    if(ended || ending || reading || buffer.length >= highWaterMark)
      return
    reading = true
    return read(ended || ending, function (end, data) {
      reading = false
      ending = ending || end
      if(data != null) buffer.push(data)

      next(); readAhead()
    })
  }

  process.nextTick(next)

  return function (end, cb) {
    ended = ended || end
    waiting.push(cb)

    next(); readAhead()
  }
}

var flatMap = exports.flatMap =
function (read, mapper) {
  mapper = mapper || id
  var queue = [], ended

  return function (abort, cb) {
    if(queue.length) return cb(null, queue.shift())
    else if(ended)   return cb(ended)

    read(abort, function next (end, data) {
      if(end) ended = end
      else {
        var add = mapper(data)
        while(add && add.length)
          queue.push(add.shift())
      }

      if(queue.length) cb(null, queue.shift())
      else if(ended)   cb(ended)
      else             read(null, next)
    })
  }
}


}).call(this,require('_process'))

},{"./sinks":45,"./sources":46,"_process":1,"pull-core":44}],48:[function(require,module,exports){
/* jshint node: true */
'use strict';

var jsonparse = require('cog/jsonparse');

/**
  ### signaller process handling

  When a signaller's underling messenger emits a `data` event this is
  delegated to a simple message parser, which applies the following simple
  logic:

  - Is the message a `/to` message. If so, see if the message is for this
    signaller (checking the target id - 2nd arg).  If so pass the
    remainder of the message onto the standard processing chain.  If not,
    discard the message.

  - Is the message a command message (prefixed with a forward slash). If so,
    look for an appropriate message handler and pass the message payload on
    to it.

  - Finally, does the message match any patterns that we are listening for?
    If so, then pass the entire message contents onto the registered handler.
**/
module.exports = function(signaller, opts) {
  var handlers = require('./handlers')(signaller, opts);

  function sendEvent(parts, srcState, data) {
    // initialise the event name
    var evtName = 'message:' + parts[0].slice(1);

    // convert any valid json objects to json
    var args = parts.slice(2).map(jsonparse);

    signaller.apply(
      signaller,
      [evtName].concat(args).concat([srcState, data])
    );
  }

  return function(originalData) {
    var data = originalData;
    var isMatch = true;
    var parts;
    var handler;
    var srcData;
    var srcState;
    var isDirectMessage = false;

    // discard primus messages
    if (data && data.slice(0, 6) === 'primus') {
      return;
    }

    // force the id into string format so we can run length and comparison tests on it
    var id = signaller.id + '';

    // process /to messages
    if (data.slice(0, 3) === '/to') {
      isMatch = data.slice(4, id.length + 4) === id;
      if (isMatch) {
        parts = data.slice(5 + id.length).split('|').map(jsonparse);

        // get the source data
        isDirectMessage = true;

        // extract the vector clock and update the parts
        parts = parts.map(jsonparse);
      }
    }

    // if this is not a match, then bail
    if (! isMatch) {
      return;
    }

    // chop the data into parts
    signaller('rawdata', data);
    parts = parts || data.split('|').map(jsonparse);

    // if we have a specific handler for the action, then invoke
    if (typeof parts[0] == 'string') {
      // extract the metadata from the input data
      srcData = parts[1];

      // if we got data from ourself, then this is pretty dumb
      // but if we have then throw it away
      if (srcData && srcData.id === signaller.id) {
        return console.warn('got data from ourself, discarding');
      }

      // get the source state
      srcState = signaller.peers.get(srcData && srcData.id) || srcData;

      // handle commands
      if (parts[0].charAt(0) === '/') {
        // look for a handler for the message type
        handler = handlers[parts[0].slice(1)];

        if (typeof handler == 'function') {
          handler(
            parts.slice(2),
            parts[0].slice(1),
            srcData,
            srcState,
            isDirectMessage
          );
        }
        else {
          sendEvent(parts, srcState, originalData);
        }
      }
      // otherwise, emit data
      else {
        signaller(
          'data',
          parts.slice(0, 1).concat(parts.slice(2)),
          srcData,
          srcState,
          isDirectMessage
        );
      }
    }
  };
};

},{"./handlers":29,"cog/jsonparse":6}],49:[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('rtc/cleanup');

var CANNOT_CLOSE_STATES = [
  'closed'
];

var EVENTS_DECOUPLE_BC = [
  'addstream',
  'datachannel',
  'icecandidate',
  'negotiationneeded',
  'removestream',
  'signalingstatechange'
];

var EVENTS_DECOUPLE_AC = [
  'iceconnectionstatechange'
];

/**
  ### rtc-tools/cleanup

  ```
  cleanup(pc)
  ```

  The `cleanup` function is used to ensure that a peer connection is properly
  closed and ready to be cleaned up by the browser.

**/
module.exports = function(pc) {
  // see if we can close the connection
  var currentState = pc.iceConnectionState;
  var canClose = CANNOT_CLOSE_STATES.indexOf(currentState) < 0;

  function decouple(events) {
    events.forEach(function(evtName) {
      if (pc['on' + evtName]) {
        pc['on' + evtName] = null;
      }
    });
  }

  // decouple "before close" events
  decouple(EVENTS_DECOUPLE_BC);

  if (canClose) {
    debug('attempting connection close, current state: '+ pc.iceConnectionState);
    pc.close();
  }

  // remove the event listeners
  // after a short delay giving the connection time to trigger
  // close and iceconnectionstatechange events
  setTimeout(function() {
    decouple(EVENTS_DECOUPLE_AC);
  }, 100);
};

},{"cog/logger":7}],50:[function(require,module,exports){
/* jshint node: true */
'use strict';

var mbus = require('mbus');
var queue = require('rtc-taskqueue');
var cleanup = require('./cleanup');
var monitor = require('./monitor');
var throttle = require('cog/throttle');
var CLOSED_STATES = [ 'closed', 'failed' ];
var CHECKING_STATES = [ 'checking' ];

/**
  ### rtc-tools/couple

  #### couple(pc, targetId, signaller, opts?)

  Couple a WebRTC connection with another webrtc connection identified by
  `targetId` via the signaller.

  The following options can be provided in the `opts` argument:

  - `sdpfilter` (default: null)

    A simple function for filtering SDP as part of the peer
    connection handshake (see the Using Filters details below).

  ##### Example Usage

  ```js
  var couple = require('rtc/couple');

  couple(pc, '54879965-ce43-426e-a8ef-09ac1e39a16d', signaller);
  ```

  ##### Using Filters

  In certain instances you may wish to modify the raw SDP that is provided
  by the `createOffer` and `createAnswer` calls.  This can be done by passing
  a `sdpfilter` function (or array) in the options.  For example:

  ```js
  // run the sdp from through a local tweakSdp function.
  couple(pc, '54879965-ce43-426e-a8ef-09ac1e39a16d', signaller, {
    sdpfilter: tweakSdp
  });
  ```

**/
function couple(pc, targetId, signaller, opts) {
  var debugLabel = (opts || {}).debugLabel || 'rtc';
  var debug = require('cog/logger')(debugLabel + '/couple');

  // create a monitor for the connection
  var mon = monitor(pc, targetId, signaller, (opts || {}).logger);
  var emit = mbus('', mon);
  var reactive = (opts || {}).reactive;
  var endOfCandidates = true;

  // configure the time to wait between receiving a 'disconnect'
  // iceConnectionState and determining that we are closed
  var disconnectTimeout = (opts || {}).disconnectTimeout || 10000;
  var disconnectTimer;

  // initilaise the negotiation helpers
  var isMaster = signaller.isMaster(targetId);

  // initialise the processing queue (one at a time please)
  var q = queue(pc, opts);

  var createOrRequestOffer = throttle(function() {
    if (! isMaster) {
      return signaller.to(targetId).send('/negotiate');
    }

    q.createOffer();
  }, 100, { leading: false });

  var debounceOffer = throttle(q.createOffer, 100, { leading: false });

  function decouple() {
    debug('decoupling ' + signaller.id + ' from ' + targetId);

    // stop the monitor
//     mon.removeAllListeners();
    mon.stop();

    // cleanup the peerconnection
    cleanup(pc);

    // remove listeners
    signaller.removeListener('sdp', handleSdp);
    signaller.removeListener('candidate', handleCandidate);
    signaller.removeListener('negotiate', handleNegotiateRequest);

    // remove listeners (version >= 5)
    signaller.removeListener('message:sdp', handleSdp);
    signaller.removeListener('message:candidate', handleCandidate);
    signaller.removeListener('message:negotiate', handleNegotiateRequest);
  }

  function handleCandidate(data) {
    q.addIceCandidate(data);
  }

  function handleSdp(sdp, src) {
    emit('sdp.remote', sdp);

    // if the source is unknown or not a match, then don't process
    if ((! src) || (src.id !== targetId)) {
      return;
    }

    q.setRemoteDescription(sdp);
  }

  function handleConnectionClose() {
    debug('captured pc close, iceConnectionState = ' + pc.iceConnectionState);
    decouple();
  }

  function handleDisconnect() {
    debug('captured pc disconnect, monitoring connection status');

    // start the disconnect timer
    disconnectTimer = setTimeout(function() {
      debug('manually closing connection after disconnect timeout');
      cleanup(pc);
    }, disconnectTimeout);

    mon.on('statechange', handleDisconnectAbort);
  }

  function handleDisconnectAbort() {
    debug('connection state changed to: ' + pc.iceConnectionState);

    // if the state is checking, then do not reset the disconnect timer as
    // we are doing our own checking
    if (CHECKING_STATES.indexOf(pc.iceConnectionState) >= 0) {
      return;
    }

    resetDisconnectTimer();

    // if we have a closed or failed status, then close the connection
    if (CLOSED_STATES.indexOf(pc.iceConnectionState) >= 0) {
      return mon('closed');
    }

    mon.once('disconnect', handleDisconnect);
  }

  function handleLocalCandidate(evt) {
    var data;

    if (evt.candidate) {
      resetDisconnectTimer();

      // formulate into a specific data object so we won't be upset by plugin
      // specific implementations of the candidate data format (i.e. extra fields)
      data = {
        candidate: evt.candidate.candidate,
        sdpMid: evt.candidate.sdpMid,
        sdpMLineIndex: evt.candidate.sdpMLineIndex
      };

      emit('ice.local', data);
      signaller.to(targetId).send('/candidate', data);
      endOfCandidates = false;
    }
    else if (! endOfCandidates) {
      endOfCandidates = true;
      emit('ice.gathercomplete');
      signaller.to(targetId).send('/endofcandidates', {});
    }
  }

  function handleNegotiateRequest(src) {
    if (src.id === targetId) {
      emit('negotiate.request', src.id);
      debounceOffer();
    }
  }

  function resetDisconnectTimer() {
    mon.off('statechange', handleDisconnectAbort);

    // clear the disconnect timer
    debug('reset disconnect timer, state: ' + pc.iceConnectionState);
    clearTimeout(disconnectTimer);
  }

  // when regotiation is needed look for the peer
  if (reactive) {
    pc.onnegotiationneeded = function() {
      emit('negotiate.renegotiate');
      createOrRequestOffer();
    };
  }

  pc.onicecandidate = handleLocalCandidate;

  // when the task queue tells us we have sdp available, send that over the wire
  q.on('sdp.local', function(desc) {
    signaller.to(targetId).send('/sdp', desc);
  });

  // when we receive sdp, then
  signaller.on('sdp', handleSdp);
  signaller.on('candidate', handleCandidate);

  // listeners (signaller >= 5)
  signaller.on('message:sdp', handleSdp);
  signaller.on('message:candidate', handleCandidate);

  // if this is a master connection, listen for negotiate events
  if (isMaster) {
    signaller.on('negotiate', handleNegotiateRequest);
    signaller.on('message:negotiate', handleNegotiateRequest); // signaller >= 5
  }

  // when the connection closes, remove event handlers
  mon.once('closed', handleConnectionClose);
  mon.once('disconnected', handleDisconnect);

  // patch in the create offer functions
  mon.createOffer = createOrRequestOffer;

  return mon;
}

module.exports = couple;

},{"./cleanup":49,"./monitor":54,"cog/logger":7,"cog/throttle":8,"mbus":55,"rtc-taskqueue":58}],51:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  ### rtc-tools/detect

  Provide the [rtc-core/detect](https://github.com/rtc-io/rtc-core#detect)
  functionality.
**/
module.exports = require('rtc-core/detect');

},{"rtc-core/detect":9}],52:[function(require,module,exports){
/* jshint node: true */
'use strict';

var debug = require('cog/logger')('generators');
var detect = require('./detect');
var defaults = require('cog/defaults');

var mappings = {
  create: {
    dtls: function(c) {
      if (! detect.moz) {
        c.optional = (c.optional || []).concat({ DtlsSrtpKeyAgreement: true });
      }
    }
  }
};

/**
  ### rtc-tools/generators

  The generators package provides some utility methods for generating
  constraint objects and similar constructs.

  ```js
  var generators = require('rtc/generators');
  ```

**/

/**
  #### generators.config(config)

  Generate a configuration object suitable for passing into an W3C
  RTCPeerConnection constructor first argument, based on our custom config.

  In the event that you use short term authentication for TURN, and you want
  to generate new `iceServers` regularly, you can specify an iceServerGenerator
  that will be used prior to coupling. This generator should return a fully
  compliant W3C (RTCIceServer dictionary)[http://www.w3.org/TR/webrtc/#idl-def-RTCIceServer].

  If you pass in both a generator and iceServers, the iceServers _will be
  ignored and the generator used instead.
**/

exports.config = function(config) {
  var iceServerGenerator = (config || {}).iceServerGenerator;

  return defaults({}, config, {
    iceServers: typeof iceServerGenerator == 'function' ? iceServerGenerator() : []
  });
};

/**
  #### generators.connectionConstraints(flags, constraints)

  This is a helper function that will generate appropriate connection
  constraints for a new `RTCPeerConnection` object which is constructed
  in the following way:

  ```js
  var conn = new RTCPeerConnection(flags, constraints);
  ```

  In most cases the constraints object can be left empty, but when creating
  data channels some additional options are required.  This function
  can generate those additional options and intelligently combine any
  user defined constraints (in `constraints`) with shorthand flags that
  might be passed while using the `rtc.createConnection` helper.
**/
exports.connectionConstraints = function(flags, constraints) {
  var generated = {};
  var m = mappings.create;
  var out;

  // iterate through the flags and apply the create mappings
  Object.keys(flags || {}).forEach(function(key) {
    if (m[key]) {
      m[key](generated);
    }
  });

  // generate the connection constraints
  out = defaults({}, constraints, generated);
  debug('generated connection constraints: ', out);

  return out;
};

},{"./detect":51,"cog/defaults":3,"cog/logger":7}],53:[function(require,module,exports){
/* jshint node: true */

'use strict';

/**
  # rtc-tools

  The `rtc-tools` module does most of the heavy lifting within the
  [rtc.io](http://rtc.io) suite.  Primarily it handles the logic of coupling
  a local `RTCPeerConnection` with it's remote counterpart via an
  [rtc-signaller](https://github.com/rtc-io/rtc-signaller) signalling
  channel.

  ## Getting Started

  If you decide that the `rtc-tools` module is a better fit for you than either
  [rtc-quickconnect](https://github.com/rtc-io/rtc-quickconnect) or
  [rtc](https://github.com/rtc-io/rtc) then the code snippet below
  will provide you a guide on how to get started using it in conjunction with
  the [rtc-signaller](https://github.com/rtc-io/rtc-signaller) (version 5.0 and above)
  and [rtc-media](https://github.com/rtc-io/rtc-media) modules:

  <<< examples/getting-started.js

  This code definitely doesn't cover all the cases that you need to consider
  (i.e. peers leaving, etc) but it should demonstrate how to:

  1. Capture video and add it to a peer connection
  2. Couple a local peer connection with a remote peer connection
  3. Deal with the remote steam being discovered and how to render
     that to the local interface.

  ## Reference

**/

var gen = require('./generators');

// export detect
var detect = exports.detect = require('./detect');
var findPlugin = require('rtc-core/plugin');

// export cog logger for convenience
exports.logger = require('cog/logger');

// export peer connection
var RTCPeerConnection =
exports.RTCPeerConnection = detect('RTCPeerConnection');

// add the couple utility
exports.couple = require('./couple');

/**
  ### createConnection

  ```
  createConnection(opts?, constraints?) => RTCPeerConnection
  ```

  Create a new `RTCPeerConnection` auto generating default opts as required.

  ```js
  var conn;

  // this is ok
  conn = rtc.createConnection();

  // and so is this
  conn = rtc.createConnection({
    iceServers: []
  });
  ```
**/
exports.createConnection = function(opts, constraints) {
  var plugin = findPlugin((opts || {}).plugins);
  var PeerConnection = (opts || {}).RTCPeerConnection || RTCPeerConnection;

  // generate the config based on options provided
  var config = gen.config(opts);

  // generate appropriate connection constraints
  constraints = gen.connectionConstraints(opts, constraints);

  if (plugin && typeof plugin.createConnection == 'function') {
    return plugin.createConnection(config, constraints);
  }

  return new PeerConnection(config, constraints);
};

},{"./couple":50,"./detect":51,"./generators":52,"cog/logger":7,"rtc-core/plugin":12}],54:[function(require,module,exports){
/* jshint node: true */
'use strict';

var mbus = require('mbus');

// define some state mappings to simplify the events we generate
var stateMappings = {
  completed: 'connected'
};

// define the events that we need to watch for peer connection
// state changes
var peerStateEvents = [
  'signalingstatechange',
  'iceconnectionstatechange',
];

/**
  ### rtc-tools/monitor

  ```
  monitor(pc, targetId, signaller, parentBus) => mbus
  ```

  The monitor is a useful tool for determining the state of `pc` (an
  `RTCPeerConnection`) instance in the context of your application. The
  monitor uses both the `iceConnectionState` information of the peer
  connection and also the various
  [signaller events](https://github.com/rtc-io/rtc-signaller#signaller-events)
  to determine when the connection has been `connected` and when it has
  been `disconnected`.

  A monitor created `mbus` is returned as the result of a
  [couple](https://github.com/rtc-io/rtc#rtccouple) between a local peer
  connection and it's remote counterpart.

**/
module.exports = function(pc, targetId, signaller, parentBus) {
  var monitor = mbus('', parentBus);
  var state;

  function checkState() {
    var newState = getMappedState(pc.iceConnectionState);

    // flag the we had a state change
    monitor('statechange', pc, newState);

    // if the active state has changed, then send the appopriate message
    if (state !== newState) {
      monitor(newState);
      state = newState;
    }
  }

  function handleClose() {
    monitor('closed');
  }

  pc.onclose = handleClose;
  peerStateEvents.forEach(function(evtName) {
    pc['on' + evtName] = checkState;
  });

  monitor.stop = function() {
    pc.onclose = null;
    peerStateEvents.forEach(function(evtName) {
      pc['on' + evtName] = null;
    });
  };

  monitor.checkState = checkState;

  // if we haven't been provided a valid peer connection, abort
  if (! pc) {
    return monitor;
  }

  // determine the initial is active state
  state = getMappedState(pc.iceConnectionState);

  return monitor;
};

/* internal helpers */

function getMappedState(state) {
  return stateMappings[state] || state;
}

},{"mbus":55}],55:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"array-trie":57,"dup":15}],56:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"dup":16}],57:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"binary-search-bounds":56,"dup":17}],58:[function(require,module,exports){
var detect = require('rtc-core/detect');
var findPlugin = require('rtc-core/plugin');
var PriorityQueue = require('priorityqueuejs');

// some validation routines
var checkCandidate = require('rtc-validator/candidate');

// the sdp cleaner
var sdpclean = require('rtc-sdpclean');

var PRIORITY_LOW = 100;
var PRIORITY_WAIT = 1000;

// priority order (lower is better)
var DEFAULT_PRIORITIES = [
  'candidate',
  'setLocalDescription',
  'setRemoteDescription',
  'createAnswer',
  'createOffer'
];

// define event mappings
var METHOD_EVENTS = {
  setLocalDescription: 'setlocaldesc',
  setRemoteDescription: 'setremotedesc',
  createOffer: 'offer',
  createAnswer: 'answer'
};

// define states in which we will attempt to finalize a connection on receiving a remote offer
var VALID_RESPONSE_STATES = ['have-remote-offer', 'have-local-pranswer'];

/**
  # rtc-taskqueue

  This is a package that assists with applying actions to an `RTCPeerConnection`
  in as reliable order as possible. It is primarily used by the coupling logic
  of the [`rtc-tools`](https://github.com/rtc-io/rtc-tools).

  ## Example Usage

  For the moment, refer to the simple coupling test as an example of how to use
  this package (see below):

  <<< test/couple.js

**/
module.exports = function(pc, opts) {
  // create the task queue
  var queue = new PriorityQueue(orderTasks);
  var tq = require('mbus')('', (opts || {}).logger);

  // initialise task importance
  var priorities = (opts || {}).priorities || DEFAULT_PRIORITIES;

  // check for plugin usage
  var plugin = findPlugin((opts || {}).plugins);

  // initialise state tracking
  var checkQueueTimer = 0;
  var currentTask;
  var defaultFail = tq.bind(tq, 'fail');

  // look for an sdpfilter function (allow slight mis-spellings)
  var sdpFilter = (opts || {}).sdpfilter || (opts || {}).sdpFilter;

  // initialise session description and icecandidate objects
  var RTCSessionDescription = (opts || {}).RTCSessionDescription ||
    detect('RTCSessionDescription');

  var RTCIceCandidate = (opts || {}).RTCIceCandidate ||
    detect('RTCIceCandidate');

  function abortQueue(err) {
    console.error(err);
  }

  function applyCandidate(task, next) {
    var data = task.args[0];
    var candidate = data && data.candidate && createIceCandidate(data);

    function handleOk() {
      tq('ice.remote.applied', candidate);
      next();
    }

    function handleFail(err) {
      tq('ice.remote.invalid', candidate);
      next(err);
    }

    // we have a null candidate, we have finished gathering candidates
    if (! candidate) {
      return next();
    }

    pc.addIceCandidate(candidate, handleOk, handleFail);
  }

  function checkQueue() {
    // peek at the next item on the queue
    var next = (! queue.isEmpty()) && (! currentTask) && queue.peek();
    var ready = next && testReady(next);
    var retry = (! queue.isEmpty()) && isNotClosed(pc);

    // reset the queue timer
    checkQueueTimer = 0;

    // if we don't have a task ready, then abort
    if (! ready) {
      return retry && triggerQueueCheck();
    }

    // update the current task (dequeue)
    currentTask = queue.deq();

    // process the task
    currentTask.fn(currentTask, function(err) {
      var fail = currentTask.fail || defaultFail;
      var pass = currentTask.pass;
      var taskName = currentTask.name;

      // if errored, fail
      if (err) {
        console.error(taskName + ' task failed: ', err);
        return fail(err);
      }

      if (typeof pass == 'function') {
        pass.apply(currentTask, [].slice.call(arguments, 1));
      }

      setTimeout(function() {
        currentTask = null;
        triggerQueueCheck();
      }, 0);
    });
  }

  function cleansdp(desc) {
    // ensure we have clean sdp
    var sdpErrors = [];
    var sdp = desc && sdpclean(desc.sdp, { collector: sdpErrors });

    // if we don't have a match, log some info
    if (desc && sdp !== desc.sdp) {
      console.info('invalid lines removed from sdp: ', sdpErrors);
      desc.sdp = sdp;
    }

    // if a filter has been specified, then apply the filter
    if (typeof sdpFilter == 'function') {
      desc.sdp = sdpFilter(desc.sdp, pc);
    }

    return desc;
  }

  function completeConnection() {
    if (VALID_RESPONSE_STATES.indexOf(pc.signalingState) >= 0) {
      return tq.createAnswer();
    }
  }

  function createIceCandidate(data) {
    if (plugin && typeof plugin.createIceCandidate == 'function') {
      return plugin.createIceCandidate(data);
    }

    return new RTCIceCandidate(data);
  }

  function createSessionDescription(data) {
    if (plugin && typeof plugin.createSessionDescription == 'function') {
      return plugin.createSessionDescription(data);
    }

    return new RTCSessionDescription(data);
  }

  function emitSdp() {
    tq('sdp.local', this.args[0]);
  }

  function enqueue(name, handler, opts) {
    return function() {
      var args = [].slice.call(arguments);

      if (opts && typeof opts.processArgs == 'function') {
        args = args.map(opts.processArgs);
      }

      queue.enq({
        args: args,
        name: name,
        fn: handler,

        // initilaise any checks that need to be done prior
        // to the task executing
        checks: [ isNotClosed ].concat((opts || {}).checks || []),

        // initialise the pass and fail handlers
        pass: (opts || {}).pass,
        fail: (opts || {}).fail
      });

      triggerQueueCheck();
    };
  }

  function execMethod(task, next) {
    var fn = pc[task.name];
    var eventName = METHOD_EVENTS[task.name] || (task.name || '').toLowerCase();
    var cbArgs = [ success, fail ];
    var isOffer = task.name === 'createOffer';

    function fail(err) {
      tq.apply(tq, [ 'negotiate.error', task.name, err ].concat(task.args));
      next(err);
    }

    function success() {
      tq.apply(tq, [ ['negotiate', eventName, 'ok'], task.name ].concat(task.args));
      next.apply(null, [null].concat([].slice.call(arguments)));
    }

    if (typeof fn != 'function') {
      return next(new Error('cannot call "' + task.name + '" on RTCPeerConnection'));
    }

    // invoke the function
    tq.apply(tq, ['negotiate.' + eventName].concat(task.args));
    fn.apply(
      pc,
      task.args.concat(cbArgs).concat(isOffer ? generateConstraints() : [])
    );
  }

  function extractCandidateEventData(data) {
    // extract nested candidate data (like we will see in an event being passed to this function)
    while (data && data.candidate && data.candidate.candidate) {
      data = data.candidate;
    }

    return data;
  }

  function generateConstraints() {
    var allowedKeys = {
      offertoreceivevideo: 'OfferToReceiveVideo',
      offertoreceiveaudio: 'OfferToReceiveAudio',
      icerestart: 'IceRestart',
      voiceactivitydetection: 'VoiceActivityDetection'
    };

    var constraints = {
      OfferToReceiveVideo: true,
      OfferToReceiveAudio: true
    };

    // update known keys to match
    Object.keys(opts || {}).forEach(function(key) {
      if (allowedKeys[key.toLowerCase()]) {
        constraints[allowedKeys[key.toLowerCase()]] = opts[key];
      }
    });

    return { mandatory: constraints };
  }

  function hasLocalOrRemoteDesc(pc, task) {
    return pc.__hasDesc || (pc.__hasDesc = !!pc.remoteDescription);
  }

  function isNotNegotiating(pc) {
    return pc.signalingState !== 'have-local-offer';
  }

  function isNotClosed(pc) {
    return pc.signalingState !== 'closed';
  }

  function isStable(pc) {
    return pc.signalingState === 'stable';
  }

  function isValidCandidate(pc, data) {
    return data.__valid ||
      (data.__valid = checkCandidate(data.args[0]).length === 0);
  }

  function orderTasks(a, b) {
    // apply each of the checks for each task
    var tasks = [a,b];
    var readiness = tasks.map(testReady);
    var taskPriorities = tasks.map(function(task, idx) {
      var ready = readiness[idx];
      var priority = ready && priorities.indexOf(task.name);

      return ready ? (priority >= 0 ? priority : PRIORITY_LOW) : PRIORITY_WAIT;
    });

    return taskPriorities[1] - taskPriorities[0];
  }

  // check whether a task is ready (does it pass all the checks)
  function testReady(task) {
    return (task.checks || []).reduce(function(memo, check) {
      return memo && check(pc, task);
    }, true);
  }

  function triggerQueueCheck() {
    if (checkQueueTimer) return;
    checkQueueTimer = setTimeout(checkQueue, 50);
  }

  // patch in the queue helper methods
  tq.addIceCandidate = enqueue('addIceCandidate', applyCandidate, {
    processArgs: extractCandidateEventData,
    checks: [ hasLocalOrRemoteDesc, isValidCandidate ]
  });

  tq.setLocalDescription = enqueue('setLocalDescription', execMethod, {
    processArgs: cleansdp,
    pass: emitSdp
  });

  tq.setRemoteDescription = enqueue('setRemoteDescription', execMethod, {
    processArgs: createSessionDescription,
    pass: completeConnection
  });

  tq.createOffer = enqueue('createOffer', execMethod, {
    checks: [ isNotNegotiating ],
    pass: tq.setLocalDescription
  });

  tq.createAnswer = enqueue('createAnswer', execMethod, {
    pass: tq.setLocalDescription
  });

  return tq;
};

},{"mbus":55,"priorityqueuejs":59,"rtc-core/detect":9,"rtc-core/plugin":12,"rtc-sdpclean":60,"rtc-validator/candidate":61}],59:[function(require,module,exports){
/**
 * Expose `PriorityQueue`.
 */
module.exports = PriorityQueue;

/**
 * Initializes a new empty `PriorityQueue` with the given `comparator(a, b)`
 * function, uses `.DEFAULT_COMPARATOR()` when no function is provided.
 *
 * The comparator function must return a positive number when `a > b`, 0 when
 * `a == b` and a negative number when `a < b`.
 *
 * @param {Function}
 * @return {PriorityQueue}
 * @api public
 */
function PriorityQueue(comparator) {
  this._comparator = comparator || PriorityQueue.DEFAULT_COMPARATOR;
  this._elements = [];
}

/**
 * Compares `a` and `b`, when `a > b` it returns a positive number, when
 * it returns 0 and when `a < b` it returns a negative number.
 *
 * @param {String|Number} a
 * @param {String|Number} b
 * @return {Number}
 * @api public
 */
PriorityQueue.DEFAULT_COMPARATOR = function(a, b) {
  if (a instanceof Number && b instanceof Number) {
    return a - b;
  } else {
    a = a.toString();
    b = b.toString();

    if (a == b) return 0;

    return (a > b) ? 1 : -1;
  }
};

/**
 * Returns whether the priority queue is empty or not.
 *
 * @return {Boolean}
 * @api public
 */
PriorityQueue.prototype.isEmpty = function() {
  return this.size() === 0;
};

/**
 * Peeks at the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.peek = function() {
  if (this.isEmpty()) throw new Error('PriorityQueue is empty');

  return this._elements[0];
};

/**
 * Dequeues the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.deq = function() {
  var first = this.peek();
  var last = this._elements.pop();
  var size = this.size();

  if (size === 0) return first;

  this._elements[0] = last;
  var current = 0;

  while (current < size) {
    var largest = current;
    var left = (2 * current) + 1;
    var right = (2 * current) + 2;

    if (left < size && this._compare(left, largest) > 0) {
      largest = left;
    }

    if (right < size && this._compare(right, largest) > 0) {
      largest = right;
    }

    if (largest === current) break;

    this._swap(largest, current);
    current = largest;
  }

  return first;
};

/**
 * Enqueues the `element` at the priority queue and returns its new size.
 *
 * @param {Object} element
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.enq = function(element) {
  var size = this._elements.push(element);
  var current = size - 1;

  while (current > 0) {
    var parent = Math.floor((current - 1) / 2);

    if (this._compare(current, parent) < 0) break;

    this._swap(parent, current);
    current = parent;
  }

  return size;
};

/**
 * Returns the size of the priority queue.
 *
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.size = function() {
  return this._elements.length;
};

/**
 *  Iterates over queue elements
 *
 *  @param {Function} fn
 */
PriorityQueue.prototype.forEach = function(fn) {
  return this._elements.forEach(fn);
};

/**
 * Compares the values at position `a` and `b` in the priority queue using its
 * comparator function.
 *
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @api private
 */
PriorityQueue.prototype._compare = function(a, b) {
  return this._comparator(this._elements[a], this._elements[b]);
};

/**
 * Swaps the values at position `a` and `b` in the priority queue.
 *
 * @param {Number} a
 * @param {Number} b
 * @api private
 */
PriorityQueue.prototype._swap = function(a, b) {
  var aux = this._elements[a];
  this._elements[a] = this._elements[b];
  this._elements[b] = aux;
};

},{}],60:[function(require,module,exports){
var validators = [
  [ /^(a\=candidate.*)$/, require('rtc-validator/candidate') ]
];

var reSdpLineBreak = /(\r?\n|\\r\\n)/;

/**
  # rtc-sdpclean

  Remove invalid lines from your SDP.

  ## Why?

  This module removes the occasional "bad egg" that will slip into SDP when it
  is generated by the browser.  In particular these situations are catered for:

  - invalid ICE candidates

**/
module.exports = function(input, opts) {
  var lineBreak = detectLineBreak(input);
  var lines = input.split(lineBreak);
  var collector = (opts || {}).collector;

  // filter out invalid lines
  lines = lines.filter(function(line) {
    // iterate through the validators and use the one that matches
    var validator = validators.reduce(function(memo, data, idx) {
      return typeof memo != 'undefined' ? memo : (data[0].exec(line) && {
        line: line.replace(data[0], '$1'),
        fn: data[1]
      });
    }, undefined);

    // if we have a validator, ensure we have no errors
    var errors = validator ? validator.fn(validator.line) : [];

    // if we have errors and an error collector, then add to the collector
    if (collector) {
      errors.forEach(function(err) {
        collector.push(err);
      });
    }

    return errors.length === 0;
  });

  return lines.join(lineBreak);
};

function detectLineBreak(input) {
  var match = reSdpLineBreak.exec(input);

  return match && match[0];
}

},{"rtc-validator/candidate":61}],61:[function(require,module,exports){
var debug = require('cog/logger')('rtc-validator');
var rePrefix = /^(?:a=)?candidate:/;
var reIP = /^(\d+\.){3}\d+$/;

/*

validation rules as per:
http://tools.ietf.org/html/draft-ietf-mmusic-ice-sip-sdp-03#section-8.1

   candidate-attribute   = "candidate" ":" foundation SP component-id SP
                           transport SP
                           priority SP
                           connection-address SP     ;from RFC 4566
                           port         ;port from RFC 4566
                           SP cand-type
                           [SP rel-addr]
                           [SP rel-port]
                           *(SP extension-att-name SP
                                extension-att-value)

   foundation            = 1*32ice-char
   component-id          = 1*5DIGIT
   transport             = "UDP" / transport-extension
   transport-extension   = token              ; from RFC 3261
   priority              = 1*10DIGIT
   cand-type             = "typ" SP candidate-types
   candidate-types       = "host" / "srflx" / "prflx" / "relay" / token
   rel-addr              = "raddr" SP connection-address
   rel-port              = "rport" SP port
   extension-att-name    = token
   extension-att-value   = *VCHAR
   ice-char              = ALPHA / DIGIT / "+" / "/"
*/
var partValidation = [
  [ /.+/, 'invalid foundation component', 'foundation' ],
  [ /\d+/, 'invalid component id', 'component-id' ],
  [ /(UDP|TCP)/i, 'transport must be TCP or UDP', 'transport' ],
  [ /\d+/, 'numeric priority expected', 'priority' ],
  [ reIP, 'invalid connection address', 'connection-address' ],
  [ /\d+/, 'invalid connection port', 'connection-port' ],
  [ /typ/, 'Expected "typ" identifier', 'type classifier' ],
  [ /.+/, 'Invalid candidate type specified', 'candidate-type' ]
];

/**
  ### `rtc-validator/candidate`

  Validate that an `RTCIceCandidate` (or plain old object with data, sdpMid,
  etc attributes) is a valid ice candidate.

  Specs reviewed as part of the validation implementation:

  - <http://tools.ietf.org/html/draft-ietf-mmusic-ice-sip-sdp-03#section-8.1>
  - <http://tools.ietf.org/html/rfc5245>

**/
module.exports = function(data) {
  var errors = [];
  var candidate = data && (data.candidate || data);
  var prefixMatch = candidate && rePrefix.exec(candidate);
  var parts = prefixMatch && candidate.slice(prefixMatch[0].length).split(/\s/);

  if (! candidate) {
    return [ new Error('empty candidate') ];
  }

  // check that the prefix matches expected
  if (! prefixMatch) {
    return [ new Error('candidate did not match expected sdp line format') ];
  }

  // perform the part validation
  errors = errors.concat(parts.map(validateParts)).filter(Boolean);

  return errors;
};

function validateParts(part, idx) {
  var validator = partValidation[idx];

  if (validator && (! validator[0].test(part))) {
    debug(validator[2] + ' part failed validation: ' + part);
    return new Error(validator[1]);
  }
}

},{"cog/logger":7}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy5udm0vdjAuMTAuMzMvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi8uLi8ubnZtL3YwLjEwLjMzL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiY29kZS9zaW1wbGUtdGV4dC1zaGFyZS5qcyIsIm5vZGVfbW9kdWxlcy9jb2cvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvY29nL2V4dGVuZC5qcyIsIm5vZGVfbW9kdWxlcy9jb2cvZ2V0YWJsZS5qcyIsIm5vZGVfbW9kdWxlcy9jb2cvanNvbnBhcnNlLmpzIiwibm9kZV9tb2R1bGVzL2NvZy9sb2dnZXIuanMiLCJub2RlX21vZHVsZXMvY29nL3Rocm90dGxlLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1jb3JlL2RldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtY29yZS9nZW5pY2UuanMiLCJub2RlX21vZHVsZXMvcnRjLWNvcmUvbm9kZV9tb2R1bGVzL2RldGVjdC1icm93c2VyL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcnRjLWNvcmUvcGx1Z2luLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1xdWlja2Nvbm5lY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9tZXNzZW5nZXIuanMiLCJub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvbWJ1cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtcXVpY2tjb25uZWN0L25vZGVfbW9kdWxlcy9tYnVzL25vZGVfbW9kdWxlcy9hcnJheS10cmllL25vZGVfbW9kdWxlcy9iaW5hcnktc2VhcmNoLWJvdW5kcy9zZWFyY2gtYm91bmRzLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1xdWlja2Nvbm5lY3Qvbm9kZV9tb2R1bGVzL21idXMvbm9kZV9tb2R1bGVzL2FycmF5LXRyaWUvdHJpZS5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtcXVpY2tjb25uZWN0L25vZGVfbW9kdWxlcy9ydGMtc3dpdGNoYm9hcmQtbWVzc2VuZ2VyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1xdWlja2Nvbm5lY3Qvbm9kZV9tb2R1bGVzL3J0Yy1zd2l0Y2hib2FyZC1tZXNzZW5nZXIvbm9kZV9tb2R1bGVzL21lc3Nlbmdlci13cy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtcXVpY2tjb25uZWN0L25vZGVfbW9kdWxlcy9ydGMtc3dpdGNoYm9hcmQtbWVzc2VuZ2VyL25vZGVfbW9kdWxlcy9tZXNzZW5nZXItd3Mvbm9kZV9tb2R1bGVzL3B1bGwtd3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvcnRjLXN3aXRjaGJvYXJkLW1lc3Nlbmdlci9ub2RlX21vZHVsZXMvbWVzc2VuZ2VyLXdzL25vZGVfbW9kdWxlcy9wdWxsLXdzL25vZGVfbW9kdWxlcy9wdWxsLWNvcmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvcnRjLXN3aXRjaGJvYXJkLW1lc3Nlbmdlci9ub2RlX21vZHVsZXMvbWVzc2VuZ2VyLXdzL25vZGVfbW9kdWxlcy9wdWxsLXdzL3JlYWR5LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1xdWlja2Nvbm5lY3Qvbm9kZV9tb2R1bGVzL3J0Yy1zd2l0Y2hib2FyZC1tZXNzZW5nZXIvbm9kZV9tb2R1bGVzL21lc3Nlbmdlci13cy9ub2RlX21vZHVsZXMvcHVsbC13cy9zaW5rLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1xdWlja2Nvbm5lY3Qvbm9kZV9tb2R1bGVzL3J0Yy1zd2l0Y2hib2FyZC1tZXNzZW5nZXIvbm9kZV9tb2R1bGVzL21lc3Nlbmdlci13cy9ub2RlX21vZHVsZXMvcHVsbC13cy9zb3VyY2UuanMiLCJub2RlX21vZHVsZXMvcnRjLXF1aWNrY29ubmVjdC9ub2RlX21vZHVsZXMvcnRjLXN3aXRjaGJvYXJkLW1lc3Nlbmdlci9ub2RlX21vZHVsZXMvbWVzc2VuZ2VyLXdzL25vZGVfbW9kdWxlcy93cy9saWIvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtcXVpY2tjb25uZWN0L25vZGVfbW9kdWxlcy9ydGMtc3dpdGNoYm9hcmQtbWVzc2VuZ2VyL25vZGVfbW9kdWxlcy9tZXNzZW5nZXItd3Mvbm9kZV9tb2R1bGVzL3dzdXJsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvZGVmYXVsdHMuanMiLCJub2RlX21vZHVsZXMvcnRjLXNpZ25hbGxlci9oYW5kbGVycy9hbm5vdW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL2hhbmRsZXJzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRjLXNpZ25hbGxlci9ub2RlX21vZHVsZXMvY3VpZC9kaXN0L2Jyb3dzZXItY3VpZC5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL25vZGVfbW9kdWxlcy9wdWxsLXB1c2hhYmxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvbm9kZV9tb2R1bGVzL3B1bGwtcHVzaGFibGUvbm9kZV9tb2R1bGVzL3B1bGwtc3RyZWFtL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvbm9kZV9tb2R1bGVzL3B1bGwtcHVzaGFibGUvbm9kZV9tb2R1bGVzL3B1bGwtc3RyZWFtL21heWJlLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvbm9kZV9tb2R1bGVzL3B1bGwtcHVzaGFibGUvbm9kZV9tb2R1bGVzL3B1bGwtc3RyZWFtL25vZGVfbW9kdWxlcy9wdWxsLWNvcmUvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRjLXNpZ25hbGxlci9ub2RlX21vZHVsZXMvcHVsbC1wdXNoYWJsZS9ub2RlX21vZHVsZXMvcHVsbC1zdHJlYW0vc2lua3MuanMiLCJub2RlX21vZHVsZXMvcnRjLXNpZ25hbGxlci9ub2RlX21vZHVsZXMvcHVsbC1wdXNoYWJsZS9ub2RlX21vZHVsZXMvcHVsbC1zdHJlYW0vc291cmNlcy5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL25vZGVfbW9kdWxlcy9wdWxsLXB1c2hhYmxlL25vZGVfbW9kdWxlcy9wdWxsLXN0cmVhbS90aHJvdWdocy5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL25vZGVfbW9kdWxlcy9wdWxsLXN0cmVhbS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL25vZGVfbW9kdWxlcy9wdWxsLXN0cmVhbS9tYXliZS5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL25vZGVfbW9kdWxlcy9wdWxsLXN0cmVhbS9zaW5rcy5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtc2lnbmFsbGVyL25vZGVfbW9kdWxlcy9wdWxsLXN0cmVhbS9zb3VyY2VzLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvbm9kZV9tb2R1bGVzL3B1bGwtc3RyZWFtL3Rocm91Z2hzLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy1zaWduYWxsZXIvcHJvY2Vzc29yLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy10b29scy9jbGVhbnVwLmpzIiwibm9kZV9tb2R1bGVzL3J0Yy10b29scy9jb3VwbGUuanMiLCJub2RlX21vZHVsZXMvcnRjLXRvb2xzL2RldGVjdC5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtdG9vbHMvZ2VuZXJhdG9ycy5qcyIsIm5vZGVfbW9kdWxlcy9ydGMtdG9vbHMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcnRjLXRvb2xzL21vbml0b3IuanMiLCJub2RlX21vZHVsZXMvcnRjLXRvb2xzL25vZGVfbW9kdWxlcy9ydGMtdGFza3F1ZXVlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy10b29scy9ub2RlX21vZHVsZXMvcnRjLXRhc2txdWV1ZS9ub2RlX21vZHVsZXMvcHJpb3JpdHlxdWV1ZWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy10b29scy9ub2RlX21vZHVsZXMvcnRjLXRhc2txdWV1ZS9ub2RlX21vZHVsZXMvcnRjLXNkcGNsZWFuL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3J0Yy10b29scy9ub2RlX21vZHVsZXMvcnRjLXRhc2txdWV1ZS9ub2RlX21vZHVsZXMvcnRjLXZhbGlkYXRvci9jYW5kaWRhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDOTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuICAgIHZhciBjdXJyZW50UXVldWU7XG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtpXSgpO1xuICAgICAgICB9XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbn1cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgcXVldWUucHVzaChmdW4pO1xuICAgIGlmICghZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIi8vIHJ0Yy1xdWlja2Nvbm5lY3QgcmVxdWlyZXMgYSBzaWduYWxsaW5nIHNlcnZlciBsb2NhdGlvbiBhbmQgYSByb29tIG5hbWUuXG52YXIgcXVpY2tDb25uZWN0TW9kID0gcmVxdWlyZSgncnRjLXF1aWNrY29ubmVjdCcpO1xudmFyIHF1aWNrQ29ubmVjdE9iaiA9IHF1aWNrQ29ubmVjdE1vZCgnLy9zd2l0Y2hib2FyZC5ydGMuaW8nLCB7IHJvb206ICdydGNpby10ZXh0LWRlbW8nIH0pO1xuXG4vLyBDcmVhdGUgdGhlIHRleHQgYXJlYSBmb3IgY2hhdHRpbmdcbnZhciBtZXNzYWdlV2luZG93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKTtcbm1lc3NhZ2VXaW5kb3cucm93cyA9IDIwO1xubWVzc2FnZVdpbmRvdy5jb2xzID0gODA7XG5cbnZhciBib2R5RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF07XG5ib2R5RWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlV2luZG93KTtcblxuLy8gQ3JlYXRlIGEgZGF0YSBjaGFubmVsIGFuZCBiaW5kIHRvIGl0J3MgZXZlbnRzXG5xdWlja0Nvbm5lY3RPYmouY3JlYXRlRGF0YUNoYW5uZWwoJ3NoYXJlZC10ZXh0Jyk7XG5xdWlja0Nvbm5lY3RPYmoub24oJ2NoYW5uZWw6b3BlbmVkOnNoYXJlZC10ZXh0JywgZnVuY3Rpb24gKGlkLCBkYXRhQ2hhbm5lbCkge1xuICBcdGJpbmREYXRhRXZlbnRzKGRhdGFDaGFubmVsKTtcbn0pO1xuXG5mdW5jdGlvbiBiaW5kRGF0YUV2ZW50cyhjaGFubmVsKSB7XG5cdC8vIFJlY2VpdmUgbWVzc2FnZVxuXHRjaGFubmVsLm9ubWVzc2FnZSA9IGZ1bmN0aW9uIChldnQpIHtcblx0XHRtZXNzYWdlV2luZG93LnZhbHVlID0gZXZ0LmRhdGE7XG5cdH07XG5cblx0Ly8gU2VuZCBtZXNzYWdlXG5cdG1lc3NhZ2VXaW5kb3cub25rZXl1cCA9IGZ1bmN0aW9uIChldnQpIHtcblx0XHRjaGFubmVsLnNlbmQodGhpcy52YWx1ZSk7XG5cdH07XG59XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiMjIGNvZy9kZWZhdWx0c1xuXG5gYGBqc1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnY29nL2RlZmF1bHRzJyk7XG5gYGBcblxuIyMjIGRlZmF1bHRzKHRhcmdldCwgKilcblxuU2hhbGxvdyBjb3B5IG9iamVjdCBwcm9wZXJ0aWVzIGZyb20gdGhlIHN1cHBsaWVkIHNvdXJjZSBvYmplY3RzICgqKSBpbnRvXG50aGUgdGFyZ2V0IG9iamVjdCwgcmV0dXJuaW5nIHRoZSB0YXJnZXQgb2JqZWN0IG9uY2UgY29tcGxldGVkLiAgRG8gbm90LFxuaG93ZXZlciwgb3ZlcndyaXRlIGV4aXN0aW5nIGtleXMgd2l0aCBuZXcgdmFsdWVzOlxuXG5gYGBqc1xuZGVmYXVsdHMoeyBhOiAxLCBiOiAyIH0sIHsgYzogMyB9LCB7IGQ6IDQgfSwgeyBiOiA1IH0pKTtcbmBgYFxuXG5TZWUgYW4gZXhhbXBsZSBvbiBbcmVxdWlyZWJpbl0oaHR0cDovL3JlcXVpcmViaW4uY29tLz9naXN0PTYwNzk0NzUpLlxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAvLyBlbnN1cmUgd2UgaGF2ZSBhIHRhcmdldFxuICB0YXJnZXQgPSB0YXJnZXQgfHwge307XG5cbiAgLy8gaXRlcmF0ZSB0aHJvdWdoIHRoZSBzb3VyY2VzIGFuZCBjb3B5IHRvIHRoZSB0YXJnZXRcbiAgW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLmZvckVhY2goZnVuY3Rpb24oc291cmNlKSB7XG4gICAgaWYgKCEgc291cmNlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgIGlmICh0YXJnZXRbcHJvcF0gPT09IHZvaWQgMCkge1xuICAgICAgICB0YXJnZXRbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdGFyZ2V0O1xufTsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiMjIGNvZy9leHRlbmRcblxuYGBganNcbnZhciBleHRlbmQgPSByZXF1aXJlKCdjb2cvZXh0ZW5kJyk7XG5gYGBcblxuIyMjIGV4dGVuZCh0YXJnZXQsICopXG5cblNoYWxsb3cgY29weSBvYmplY3QgcHJvcGVydGllcyBmcm9tIHRoZSBzdXBwbGllZCBzb3VyY2Ugb2JqZWN0cyAoKikgaW50b1xudGhlIHRhcmdldCBvYmplY3QsIHJldHVybmluZyB0aGUgdGFyZ2V0IG9iamVjdCBvbmNlIGNvbXBsZXRlZDpcblxuYGBganNcbmV4dGVuZCh7IGE6IDEsIGI6IDIgfSwgeyBjOiAzIH0sIHsgZDogNCB9LCB7IGI6IDUgfSkpO1xuYGBgXG5cblNlZSBhbiBleGFtcGxlIG9uIFtyZXF1aXJlYmluXShodHRwOi8vcmVxdWlyZWJpbi5jb20vP2dpc3Q9NjA3OTQ3NSkuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKS5mb3JFYWNoKGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgIGlmICghIHNvdXJjZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICB0YXJnZXRbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gdGFyZ2V0O1xufTsiLCIvKipcbiAgIyMgY29nL2dldGFibGVcblxuICBUYWtlIGFuIG9iamVjdCBhbmQgcHJvdmlkZSBhIHdyYXBwZXIgdGhhdCBhbGxvd3MgeW91IHRvIGBnZXRgIGFuZFxuICBgc2V0YCB2YWx1ZXMgb24gdGhhdCBvYmplY3QuXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgZnVuY3Rpb24gZ2V0KGtleSkge1xuICAgIHJldHVybiB0YXJnZXRba2V5XTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgdGFyZ2V0W2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZShrZXkpIHtcbiAgICByZXR1cm4gZGVsZXRlIHRhcmdldFtrZXldO1xuICB9XG5cbiAgZnVuY3Rpb24ga2V5cygpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModGFyZ2V0KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWx1ZXMoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRhcmdldCkubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIHRhcmdldFtrZXldO1xuICAgIH0pO1xuICB9O1xuXG4gIGlmICh0eXBlb2YgdGFyZ2V0ICE9ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0OiBnZXQsXG4gICAgc2V0OiBzZXQsXG4gICAgcmVtb3ZlOiByZW1vdmUsXG4gICAgZGVsZXRlOiByZW1vdmUsXG4gICAga2V5czoga2V5cyxcbiAgICB2YWx1ZXM6IHZhbHVlc1xuICB9O1xufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICAjIyBjb2cvanNvbnBhcnNlXG5cbiAgYGBganNcbiAgdmFyIGpzb25wYXJzZSA9IHJlcXVpcmUoJ2NvZy9qc29ucGFyc2UnKTtcbiAgYGBgXG5cbiAgIyMjIGpzb25wYXJzZShpbnB1dClcblxuICBUaGlzIGZ1bmN0aW9uIHdpbGwgYXR0ZW1wdCB0byBhdXRvbWF0aWNhbGx5IGRldGVjdCBzdHJpbmdpZmllZCBKU09OLCBhbmRcbiAgd2hlbiBkZXRlY3RlZCB3aWxsIHBhcnNlIGludG8gSlNPTiBvYmplY3RzLiAgVGhlIGZ1bmN0aW9uIGxvb2tzIGZvciBzdHJpbmdzXG4gIHRoYXQgbG9vayBhbmQgc21lbGwgbGlrZSBzdHJpbmdpZmllZCBKU09OLCBhbmQgaWYgZm91bmQgYXR0ZW1wdHMgdG9cbiAgYEpTT04ucGFyc2VgIHRoZSBpbnB1dCBpbnRvIGEgdmFsaWQgb2JqZWN0LlxuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgdmFyIGlzU3RyaW5nID0gdHlwZW9mIGlucHV0ID09ICdzdHJpbmcnIHx8IChpbnB1dCBpbnN0YW5jZW9mIFN0cmluZyk7XG4gIHZhciByZU51bWVyaWMgPSAvXlxcLT9cXGQrXFwuP1xcZCokLztcbiAgdmFyIHNob3VsZFBhcnNlIDtcbiAgdmFyIGZpcnN0Q2hhcjtcbiAgdmFyIGxhc3RDaGFyO1xuXG4gIGlmICgoISBpc1N0cmluZykgfHwgaW5wdXQubGVuZ3RoIDwgMikge1xuICAgIGlmIChpc1N0cmluZyAmJiByZU51bWVyaWMudGVzdChpbnB1dCkpIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KGlucHV0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cblxuICAvLyBjaGVjayBmb3IgdHJ1ZSBvciBmYWxzZVxuICBpZiAoaW5wdXQgPT09ICd0cnVlJyB8fCBpbnB1dCA9PT0gJ2ZhbHNlJykge1xuICAgIHJldHVybiBpbnB1dCA9PT0gJ3RydWUnO1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIG51bGxcbiAgaWYgKGlucHV0ID09PSAnbnVsbCcpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8vIGdldCB0aGUgZmlyc3QgYW5kIGxhc3QgY2hhcmFjdGVyc1xuICBmaXJzdENoYXIgPSBpbnB1dC5jaGFyQXQoMCk7XG4gIGxhc3RDaGFyID0gaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aCAtIDEpO1xuXG4gIC8vIGRldGVybWluZSB3aGV0aGVyIHdlIHNob3VsZCBKU09OLnBhcnNlIHRoZSBpbnB1dFxuICBzaG91bGRQYXJzZSA9XG4gICAgKGZpcnN0Q2hhciA9PSAneycgJiYgbGFzdENoYXIgPT0gJ30nKSB8fFxuICAgIChmaXJzdENoYXIgPT0gJ1snICYmIGxhc3RDaGFyID09ICddJykgfHxcbiAgICAoZmlyc3RDaGFyID09ICdcIicgJiYgbGFzdENoYXIgPT0gJ1wiJyk7XG5cbiAgaWYgKHNob3VsZFBhcnNlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGlucHV0KTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIC8vIGFwcGFyZW50bHkgaXQgd2Fzbid0IHZhbGlkIGpzb24sIGNhcnJ5IG9uIHdpdGggcmVndWxhciBwcm9jZXNzaW5nXG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gcmVOdW1lcmljLnRlc3QoaW5wdXQpID8gcGFyc2VGbG9hdChpbnB1dCkgOiBpbnB1dDtcbn07IiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMjIGNvZy9sb2dnZXJcblxuICBgYGBqc1xuICB2YXIgbG9nZ2VyID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpO1xuICBgYGBcblxuICBTaW1wbGUgYnJvd3NlciBsb2dnaW5nIG9mZmVyaW5nIHNpbWlsYXIgZnVuY3Rpb25hbGl0eSB0byB0aGVcbiAgW2RlYnVnXShodHRwczovL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvZGVidWcpIG1vZHVsZS5cblxuICAjIyMgVXNhZ2VcblxuICBDcmVhdGUgeW91ciBzZWxmIGEgbmV3IGxvZ2dpbmcgaW5zdGFuY2UgYW5kIGdpdmUgaXQgYSBuYW1lOlxuXG4gIGBgYGpzXG4gIHZhciBkZWJ1ZyA9IGxvZ2dlcigncGhpbCcpO1xuICBgYGBcblxuICBOb3cgZG8gc29tZSBkZWJ1Z2dpbmc6XG5cbiAgYGBganNcbiAgZGVidWcoJ2hlbGxvJyk7XG4gIGBgYFxuXG4gIEF0IHRoaXMgc3RhZ2UsIG5vIGxvZyBvdXRwdXQgd2lsbCBiZSBnZW5lcmF0ZWQgYmVjYXVzZSB5b3VyIGxvZ2dlciBpc1xuICBjdXJyZW50bHkgZGlzYWJsZWQuICBFbmFibGUgaXQ6XG5cbiAgYGBganNcbiAgbG9nZ2VyLmVuYWJsZSgncGhpbCcpO1xuICBgYGBcblxuICBOb3cgZG8gc29tZSBtb3JlIGxvZ2dlcjpcblxuICBgYGBqc1xuICBkZWJ1ZygnT2ggdGhpcyBpcyBzbyBtdWNoIG5pY2VyIDopJyk7XG4gIC8vIC0tPiBwaGlsOiBPaCB0aGlzIGlzIHNvbWUgbXVjaCBuaWNlciA6KVxuICBgYGBcblxuICAjIyMgUmVmZXJlbmNlXG4qKi9cblxudmFyIGFjdGl2ZSA9IFtdO1xudmFyIHVubGVhc2hMaXN0ZW5lcnMgPSBbXTtcbnZhciB0YXJnZXRzID0gWyBjb25zb2xlIF07XG5cbi8qKlxuICAjIyMjIGxvZ2dlcihuYW1lKVxuXG4gIENyZWF0ZSBhIG5ldyBsb2dnaW5nIGluc3RhbmNlLlxuKiovXG52YXIgbG9nZ2VyID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKSB7XG4gIC8vIGluaXRpYWwgZW5hYmxlZCBjaGVja1xuICB2YXIgZW5hYmxlZCA9IGNoZWNrQWN0aXZlKCk7XG5cbiAgZnVuY3Rpb24gY2hlY2tBY3RpdmUoKSB7XG4gICAgcmV0dXJuIGVuYWJsZWQgPSBhY3RpdmUuaW5kZXhPZignKicpID49IDAgfHwgYWN0aXZlLmluZGV4T2YobmFtZSkgPj0gMDtcbiAgfVxuXG4gIC8vIHJlZ2lzdGVyIHRoZSBjaGVjayBhY3RpdmUgd2l0aCB0aGUgbGlzdGVuZXJzIGFycmF5XG4gIHVubGVhc2hMaXN0ZW5lcnNbdW5sZWFzaExpc3RlbmVycy5sZW5ndGhdID0gY2hlY2tBY3RpdmU7XG5cbiAgLy8gcmV0dXJuIHRoZSBhY3R1YWwgbG9nZ2luZyBmdW5jdGlvblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIGEgc3RyaW5nIG1lc3NhZ2VcbiAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT0gJ3N0cmluZycgfHwgKGFyZ3NbMF0gaW5zdGFuY2VvZiBTdHJpbmcpKSB7XG4gICAgICBhcmdzWzBdID0gbmFtZSArICc6ICcgKyBhcmdzWzBdO1xuICAgIH1cblxuICAgIC8vIGlmIG5vdCBlbmFibGVkLCBiYWlsXG4gICAgaWYgKCEgZW5hYmxlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGxvZ1xuICAgIHRhcmdldHMuZm9yRWFjaChmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgIHRhcmdldC5sb2cuYXBwbHkodGFyZ2V0LCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbi8qKlxuICAjIyMjIGxvZ2dlci5yZXNldCgpXG5cbiAgUmVzZXQgbG9nZ2luZyAocmVtb3ZlIHRoZSBkZWZhdWx0IGNvbnNvbGUgbG9nZ2VyLCBmbGFnIGFsbCBsb2dnZXJzIGFzXG4gIGluYWN0aXZlLCBldGMsIGV0Yy5cbioqL1xubG9nZ2VyLnJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gIC8vIHJlc2V0IHRhcmdldHMgYW5kIGFjdGl2ZSBzdGF0ZXNcbiAgdGFyZ2V0cyA9IFtdO1xuICBhY3RpdmUgPSBbXTtcblxuICByZXR1cm4gbG9nZ2VyLmVuYWJsZSgpO1xufTtcblxuLyoqXG4gICMjIyMgbG9nZ2VyLnRvKHRhcmdldClcblxuICBBZGQgYSBsb2dnaW5nIHRhcmdldC4gIFRoZSBsb2dnZXIgbXVzdCBoYXZlIGEgYGxvZ2AgbWV0aG9kIGF0dGFjaGVkLlxuXG4qKi9cbmxvZ2dlci50byA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICB0YXJnZXRzID0gdGFyZ2V0cy5jb25jYXQodGFyZ2V0IHx8IFtdKTtcblxuICByZXR1cm4gbG9nZ2VyO1xufTtcblxuLyoqXG4gICMjIyMgbG9nZ2VyLmVuYWJsZShuYW1lcyopXG5cbiAgRW5hYmxlIGxvZ2dpbmcgdmlhIHRoZSBuYW1lZCBsb2dnaW5nIGluc3RhbmNlcy4gIFRvIGVuYWJsZSBsb2dnaW5nIHZpYSBhbGxcbiAgaW5zdGFuY2VzLCB5b3UgY2FuIHBhc3MgYSB3aWxkY2FyZDpcblxuICBgYGBqc1xuICBsb2dnZXIuZW5hYmxlKCcqJyk7XG4gIGBgYFxuXG4gIF9fVE9ETzpfXyB3aWxkY2FyZCBlbmFibGVyc1xuKiovXG5sb2dnZXIuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIC8vIHVwZGF0ZSB0aGUgYWN0aXZlXG4gIGFjdGl2ZSA9IGFjdGl2ZS5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblxuICAvLyB0cmlnZ2VyIHRoZSB1bmxlYXNoIGxpc3RlbmVyc1xuICB1bmxlYXNoTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcbiAgICBsaXN0ZW5lcigpO1xuICB9KTtcblxuICByZXR1cm4gbG9nZ2VyO1xufTsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyMgY29nL3Rocm90dGxlXG5cbiAgYGBganNcbiAgdmFyIHRocm90dGxlID0gcmVxdWlyZSgnY29nL3Rocm90dGxlJyk7XG4gIGBgYFxuXG4gICMjIyB0aHJvdHRsZShmbiwgZGVsYXksIG9wdHMpXG5cbiAgQSBjaGVycnktcGlja2FibGUgdGhyb3R0bGUgZnVuY3Rpb24uICBVc2VkIHRvIHRocm90dGxlIGBmbmAgdG8gZW5zdXJlXG4gIHRoYXQgaXQgY2FuIGJlIGNhbGxlZCBhdCBtb3N0IG9uY2UgZXZlcnkgYGRlbGF5YCBtaWxsaXNlY29uZHMuICBXaWxsXG4gIGZpcmUgZmlyc3QgZXZlbnQgaW1tZWRpYXRlbHksIGVuc3VyaW5nIHRoZSBuZXh0IGV2ZW50IGZpcmVkIHdpbGwgb2NjdXJcbiAgYXQgbGVhc3QgYGRlbGF5YCBtaWxsaXNlY29uZHMgYWZ0ZXIgdGhlIGZpcnN0LCBhbmQgc28gb24uXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgZGVsYXksIG9wdHMpIHtcbiAgdmFyIGxhc3RFeGVjID0gKG9wdHMgfHwge30pLmxlYWRpbmcgIT09IGZhbHNlID8gMCA6IERhdGUubm93KCk7XG4gIHZhciB0cmFpbGluZyA9IChvcHRzIHx8IHt9KS50cmFpbGluZztcbiAgdmFyIHRpbWVyO1xuICB2YXIgcXVldWVkQXJncztcbiAgdmFyIHF1ZXVlZFNjb3BlO1xuXG4gIC8vIHRyYWlsaW5nIGRlZmF1bHRzIHRvIHRydWVcbiAgdHJhaWxpbmcgPSB0cmFpbGluZyB8fCB0cmFpbGluZyA9PT0gdW5kZWZpbmVkO1xuICBcbiAgZnVuY3Rpb24gaW52b2tlRGVmZXJlZCgpIHtcbiAgICBmbi5hcHBseShxdWV1ZWRTY29wZSwgcXVldWVkQXJncyB8fCBbXSk7XG4gICAgbGFzdEV4ZWMgPSBEYXRlLm5vdygpO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aWNrID0gRGF0ZS5ub3coKTtcbiAgICB2YXIgZWxhcHNlZCA9IHRpY2sgLSBsYXN0RXhlYztcblxuICAgIC8vIGFsd2F5cyBjbGVhciB0aGUgZGVmZXJlZCB0aW1lclxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG5cbiAgICBpZiAoZWxhcHNlZCA8IGRlbGF5KSB7XG4gICAgICBxdWV1ZWRBcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgICAgcXVldWVkU2NvcGUgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gdHJhaWxpbmcgJiYgKHRpbWVyID0gc2V0VGltZW91dChpbnZva2VEZWZlcmVkLCBkZWxheSAtIGVsYXBzZWQpKTtcbiAgICB9XG5cbiAgICAvLyBjYWxsIHRoZSBmdW5jdGlvblxuICAgIGxhc3RFeGVjID0gdGljaztcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuLyogZ2xvYmFsIHdpbmRvdzogZmFsc2UgKi9cbi8qIGdsb2JhbCBuYXZpZ2F0b3I6IGZhbHNlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGJyb3dzZXIgPSByZXF1aXJlKCdkZXRlY3QtYnJvd3NlcicpO1xuXG4vKipcbiAgIyMjIGBydGMtY29yZS9kZXRlY3RgXG5cbiAgQSBicm93c2VyIGRldGVjdGlvbiBoZWxwZXIgZm9yIGFjY2Vzc2luZyBwcmVmaXgtZnJlZSB2ZXJzaW9ucyBvZiB0aGUgdmFyaW91c1xuICBXZWJSVEMgdHlwZXMuXG5cbiAgIyMjIEV4YW1wbGUgVXNhZ2VcblxuICBJZiB5b3Ugd2FudGVkIHRvIGdldCB0aGUgbmF0aXZlIGBSVENQZWVyQ29ubmVjdGlvbmAgcHJvdG90eXBlIGluIGFueSBicm93c2VyXG4gIHlvdSBjb3VsZCBkbyB0aGUgZm9sbG93aW5nOlxuXG4gIGBgYGpzXG4gIHZhciBkZXRlY3QgPSByZXF1aXJlKCdydGMtY29yZS9kZXRlY3QnKTsgLy8gYWxzbyBhdmFpbGFibGUgaW4gcnRjL2RldGVjdFxuICB2YXIgUlRDUGVlckNvbm5lY3Rpb24gPSBkZXRlY3QoJ1JUQ1BlZXJDb25uZWN0aW9uJyk7XG4gIGBgYFxuXG4gIFRoaXMgd291bGQgcHJvdmlkZSB3aGF0ZXZlciB0aGUgYnJvd3NlciBwcmVmaXhlZCB2ZXJzaW9uIG9mIHRoZVxuICBSVENQZWVyQ29ubmVjdGlvbiBpcyBhdmFpbGFibGUgKGB3ZWJraXRSVENQZWVyQ29ubmVjdGlvbmAsXG4gIGBtb3pSVENQZWVyQ29ubmVjdGlvbmAsIGV0YykuXG4qKi9cbnZhciBkZXRlY3QgPSBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgb3B0cykge1xuICB2YXIgYXR0YWNoID0gKG9wdHMgfHwge30pLmF0dGFjaDtcbiAgdmFyIHByZWZpeElkeDtcbiAgdmFyIHByZWZpeDtcbiAgdmFyIHRlc3ROYW1lO1xuICB2YXIgaG9zdE9iamVjdCA9IHRoaXMgfHwgKHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB1bmRlZmluZWQpO1xuXG4gIC8vIGluaXRpYWxpc2UgdG8gZGVmYXVsdCBwcmVmaXhlc1xuICAvLyAocmV2ZXJzZSBvcmRlciBhcyB3ZSB1c2UgYSBkZWNyZW1lbnRpbmcgZm9yIGxvb3ApXG4gIHZhciBwcmVmaXhlcyA9ICgob3B0cyB8fCB7fSkucHJlZml4ZXMgfHwgWydtcycsICdvJywgJ21veicsICd3ZWJraXQnXSkuY29uY2F0KCcnKTtcblxuICAvLyBpZiB3ZSBoYXZlIG5vIGhvc3Qgb2JqZWN0LCB0aGVuIGFib3J0XG4gIGlmICghIGhvc3RPYmplY3QpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBpdGVyYXRlIHRocm91Z2ggdGhlIHByZWZpeGVzIGFuZCByZXR1cm4gdGhlIGNsYXNzIGlmIGZvdW5kIGluIGdsb2JhbFxuICBmb3IgKHByZWZpeElkeCA9IHByZWZpeGVzLmxlbmd0aDsgcHJlZml4SWR4LS07ICkge1xuICAgIHByZWZpeCA9IHByZWZpeGVzW3ByZWZpeElkeF07XG5cbiAgICAvLyBjb25zdHJ1Y3QgdGhlIHRlc3QgY2xhc3MgbmFtZVxuICAgIC8vIGlmIHdlIGhhdmUgYSBwcmVmaXggZW5zdXJlIHRoZSB0YXJnZXQgaGFzIGFuIHVwcGVyY2FzZSBmaXJzdCBjaGFyYWN0ZXJcbiAgICAvLyBzdWNoIHRoYXQgYSB0ZXN0IGZvciBnZXRVc2VyTWVkaWEgd291bGQgcmVzdWx0IGluIGFcbiAgICAvLyBzZWFyY2ggZm9yIHdlYmtpdEdldFVzZXJNZWRpYVxuICAgIHRlc3ROYW1lID0gcHJlZml4ICsgKHByZWZpeCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdGFyZ2V0LnNsaWNlKDEpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQpO1xuXG4gICAgaWYgKHR5cGVvZiBob3N0T2JqZWN0W3Rlc3ROYW1lXSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gdXBkYXRlIHRoZSBsYXN0IHVzZWQgcHJlZml4XG4gICAgICBkZXRlY3QuYnJvd3NlciA9IGRldGVjdC5icm93c2VyIHx8IHByZWZpeC50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICBpZiAoYXR0YWNoKSB7XG4gICAgICAgICBob3N0T2JqZWN0W3RhcmdldF0gPSBob3N0T2JqZWN0W3Rlc3ROYW1lXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGhvc3RPYmplY3RbdGVzdE5hbWVdO1xuICAgIH1cbiAgfVxufTtcblxuLy8gZGV0ZWN0IG1vemlsbGEgKHllcywgdGhpcyBmZWVscyBkaXJ0eSlcbmRldGVjdC5tb3ogPSB0eXBlb2YgbmF2aWdhdG9yICE9ICd1bmRlZmluZWQnICYmICEhbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYTtcblxuLy8gc2V0IHRoZSBicm93c2VyIGFuZCBicm93c2VyIHZlcnNpb25cbmRldGVjdC5icm93c2VyID0gYnJvd3Nlci5uYW1lO1xuZGV0ZWN0LmJyb3dzZXJWZXJzaW9uID0gZGV0ZWN0LnZlcnNpb24gPSBicm93c2VyLnZlcnNpb247XG4iLCIvKipcbiAgIyMjIGBydGMtY29yZS9nZW5pY2VgXG5cbiAgUmVzcG9uZCBhcHByb3ByaWF0ZWx5IHRvIG9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIHRvIHBhY2thZ2VzIGxpa2VcbiAgYHJ0Yy1xdWlja2Nvbm5lY3RgIGFuZCB0cmlnZ2VyIGEgYGNhbGxiYWNrYCAoZXJyb3IgZmlyc3QpIHdpdGggaWNlU2VydmVyXG4gIHZhbHVlcy5cblxuICBUaGUgZnVuY3Rpb24gbG9va3MgZm9yIGVpdGhlciBvZiB0aGUgZm9sbG93aW5nIGtleXMgaW4gdGhlIG9wdGlvbnMsIGluXG4gIHRoZSBmb2xsb3dpbmcgb3JkZXIgb3IgcHJlY2VkZW5jZTpcblxuICAxLiBgaWNlYCAtIHRoaXMgY2FuIGVpdGhlciBiZSBhbiBhcnJheSBvZiBpY2Ugc2VydmVyIHZhbHVlcyBvciBhIGdlbmVyYXRvclxuICAgICBmdW5jdGlvbiAoaW4gdGhlIHNhbWUgZm9ybWF0IGFzIHRoaXMgZnVuY3Rpb24pLiAgSWYgdGhpcyBrZXkgY29udGFpbnMgYVxuICAgICB2YWx1ZSB0aGVuIGFueSBzZXJ2ZXJzIHNwZWNpZmllZCBpbiB0aGUgYGljZVNlcnZlcnNgIGtleSAoMikgd2lsbCBiZVxuICAgICBpZ25vcmVkLlxuXG4gIDIuIGBpY2VTZXJ2ZXJzYCAtIGFuIGFycmF5IG9mIGljZSBzZXJ2ZXIgdmFsdWVzLlxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdHMsIGNhbGxiYWNrKSB7XG4gIHZhciBpY2UgPSAob3B0cyB8fCB7fSkuaWNlO1xuICB2YXIgaWNlU2VydmVycyA9IChvcHRzIHx8IHt9KS5pY2VTZXJ2ZXJzO1xuXG4gIGlmICh0eXBlb2YgaWNlID09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gaWNlKG9wdHMsIGNhbGxiYWNrKTtcbiAgfVxuICBlbHNlIGlmIChBcnJheS5pc0FycmF5KGljZSkpIHtcbiAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgW10uY29uY2F0KGljZSkpO1xuICB9XG5cbiAgY2FsbGJhY2sobnVsbCwgW10uY29uY2F0KGljZVNlcnZlcnMgfHwgW10pKTtcbn07XG4iLCJ2YXIgYnJvd3NlcnMgPSBbXG4gIFsgJ2Nocm9tZScsIC9DaHJvbSg/OmV8aXVtKVxcLyhbMC05XFwuXSspKDo/XFxzfCQpLyBdLFxuICBbICdmaXJlZm94JywgL0ZpcmVmb3hcXC8oWzAtOVxcLl0rKSg/Olxcc3wkKS8gXSxcbiAgWyAnb3BlcmEnLCAvT3BlcmFcXC8oWzAtOVxcLl0rKSg/Olxcc3wkKS8gXSxcbiAgWyAnaWUnLCAvVHJpZGVudFxcLzdcXC4wLipydlxcOihbMC05XFwuXSspXFwpLipHZWNrbyQvIF0sXG4gIFsgJ2llJywgL01TSUVcXHMoWzAtOVxcLl0rKTsuKlRyaWRlbnRcXC9bNC03XS4wLyBdLFxuICBbICdpZScsIC9NU0lFXFxzKDdcXC4wKS8gXSxcbiAgWyAnYmIxMCcsIC9CQjEwO1xcc1RvdWNoLipWZXJzaW9uXFwvKFswLTlcXC5dKykvIF0sXG4gIFsgJ2FuZHJvaWQnLCAvQW5kcm9pZFxccyhbMC05XFwuXSspLyBdLFxuICBbICdpb3MnLCAvaVBhZFxcO1xcc0NQVVxcc09TXFxzKFswLTlcXC5fXSspLyBdLFxuICBbICdpb3MnLCAgL2lQaG9uZVxcO1xcc0NQVVxcc2lQaG9uZVxcc09TXFxzKFswLTlcXC5fXSspLyBdLFxuICBbICdzYWZhcmknLCAvU2FmYXJpXFwvKFswLTlcXC5fXSspLyBdXG5dO1xuXG52YXIgbWF0Y2ggPSBicm93c2Vycy5tYXAobWF0Y2gpLmZpbHRlcihpc01hdGNoKVswXTtcbnZhciBwYXJ0cyA9IG1hdGNoICYmIG1hdGNoWzNdLnNwbGl0KC9bLl9dLykuc2xpY2UoMCwzKTtcblxud2hpbGUgKHBhcnRzICYmIHBhcnRzLmxlbmd0aCA8IDMpIHtcbiAgcGFydHMucHVzaCgnMCcpO1xufVxuXG4vLyBzZXQgdGhlIG5hbWUgYW5kIHZlcnNpb25cbmV4cG9ydHMubmFtZSA9IG1hdGNoICYmIG1hdGNoWzBdO1xuZXhwb3J0cy52ZXJzaW9uID0gcGFydHMgJiYgcGFydHMuam9pbignLicpO1xuXG5mdW5jdGlvbiBtYXRjaChwYWlyKSB7XG4gIHJldHVybiBwYWlyLmNvbmNhdChwYWlyWzFdLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCkpO1xufVxuXG5mdW5jdGlvbiBpc01hdGNoKHBhaXIpIHtcbiAgcmV0dXJuICEhcGFpclsyXTtcbn1cbiIsInZhciBkZXRlY3QgPSByZXF1aXJlKCcuL2RldGVjdCcpO1xudmFyIHJlcXVpcmVkRnVuY3Rpb25zID0gW1xuICAnaW5pdCdcbl07XG5cbmZ1bmN0aW9uIGlzU3VwcG9ydGVkKHBsdWdpbikge1xuICByZXR1cm4gcGx1Z2luICYmIHR5cGVvZiBwbHVnaW4uc3VwcG9ydGVkID09ICdmdW5jdGlvbicgJiYgcGx1Z2luLnN1cHBvcnRlZChkZXRlY3QpO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkKHBsdWdpbikge1xuICB2YXIgc3VwcG9ydGVkRnVuY3Rpb25zID0gcmVxdWlyZWRGdW5jdGlvbnMuZmlsdGVyKGZ1bmN0aW9uKGZuKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBwbHVnaW5bZm5dID09ICdmdW5jdGlvbic7XG4gIH0pO1xuXG4gIHJldHVybiBzdXBwb3J0ZWRGdW5jdGlvbnMubGVuZ3RoID09PSByZXF1aXJlZEZ1bmN0aW9ucy5sZW5ndGg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGx1Z2lucykge1xuICByZXR1cm4gW10uY29uY2F0KHBsdWdpbnMgfHwgW10pLmZpbHRlcihpc1N1cHBvcnRlZCkuZmlsdGVyKGlzVmFsaWQpWzBdO1xufVxuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHJ0YyA9IHJlcXVpcmUoJ3J0Yy10b29scycpO1xudmFyIG1idXMgPSByZXF1aXJlKCdtYnVzJyk7XG52YXIgY2xlYW51cCA9IHJlcXVpcmUoJ3J0Yy10b29scy9jbGVhbnVwJyk7XG52YXIgZGV0ZWN0UGx1Z2luID0gcmVxdWlyZSgncnRjLWNvcmUvcGx1Z2luJyk7XG52YXIgZGVidWcgPSBydGMubG9nZ2VyKCdydGMtcXVpY2tjb25uZWN0Jyk7XG52YXIgZGVmYXVsdHMgPSByZXF1aXJlKCdjb2cvZGVmYXVsdHMnKTtcbnZhciBleHRlbmQgPSByZXF1aXJlKCdjb2cvZXh0ZW5kJyk7XG52YXIgZ2V0YWJsZSA9IHJlcXVpcmUoJ2NvZy9nZXRhYmxlJyk7XG52YXIgbWVzc2VuZ2VyID0gcmVxdWlyZSgnLi9tZXNzZW5nZXInKTtcbnZhciByZVRyYWlsaW5nU2xhc2ggPSAvXFwvJC87XG5cbi8qKlxuICAjIHJ0Yy1xdWlja2Nvbm5lY3RcblxuICBUaGlzIGlzIGEgaGlnaCBsZXZlbCBoZWxwZXIgbW9kdWxlIGRlc2lnbmVkIHRvIGhlbHAgeW91IGdldCB1cFxuICBhbiBydW5uaW5nIHdpdGggV2ViUlRDIHJlYWxseSwgcmVhbGx5IHF1aWNrbHkuICBCeSB1c2luZyB0aGlzIG1vZHVsZSB5b3VcbiAgYXJlIHRyYWRpbmcgb2ZmIHNvbWUgZmxleGliaWxpdHksIHNvIGlmIHlvdSBuZWVkIGEgbW9yZSBmbGV4aWJsZVxuICBjb25maWd1cmF0aW9uIHlvdSBzaG91bGQgZHJpbGwgZG93biBpbnRvIGxvd2VyIGxldmVsIGNvbXBvbmVudHMgb2YgdGhlXG4gIFtydGMuaW9dKGh0dHA6Ly93d3cucnRjLmlvKSBzdWl0ZS4gIEluIHBhcnRpY3VsYXIgeW91IHNob3VsZCBjaGVjayBvdXRcbiAgW3J0Y10oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMpLlxuXG4gICMjIEV4YW1wbGUgVXNhZ2VcblxuICBJbiB0aGUgc2ltcGxlc3QgY2FzZSB5b3Ugc2ltcGx5IGNhbGwgcXVpY2tjb25uZWN0IHdpdGggYSBzaW5nbGUgc3RyaW5nXG4gIGFyZ3VtZW50IHdoaWNoIHRlbGxzIHF1aWNrY29ubmVjdCB3aGljaCBzZXJ2ZXIgdG8gdXNlIGZvciBzaWduYWxpbmc6XG5cbiAgPDw8IGV4YW1wbGVzL3NpbXBsZS5qc1xuXG4gIDw8PCBkb2NzL2V2ZW50cy5tZFxuXG4gIDw8PCBkb2NzL2V4YW1wbGVzLm1kXG5cbiAgIyMgUmVnYXJkaW5nIFNpZ25hbGxpbmcgYW5kIGEgU2lnbmFsbGluZyBTZXJ2ZXJcblxuICBTaWduYWxpbmcgaXMgYW4gaW1wb3J0YW50IHBhcnQgb2Ygc2V0dGluZyB1cCBhIFdlYlJUQyBjb25uZWN0aW9uIGFuZCBmb3JcbiAgb3VyIGV4YW1wbGVzIHdlIHVzZSBvdXIgb3duIHRlc3QgaW5zdGFuY2Ugb2YgdGhlXG4gIFtydGMtc3dpdGNoYm9hcmRdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXN3aXRjaGJvYXJkKS4gRm9yIHlvdXJcbiAgdGVzdGluZyBhbmQgZGV2ZWxvcG1lbnQgeW91IGFyZSBtb3JlIHRoYW4gd2VsY29tZSB0byB1c2UgdGhpcyBhbHNvLCBidXRcbiAganVzdCBiZSBhd2FyZSB0aGF0IHdlIHVzZSB0aGlzIGZvciBvdXIgdGVzdGluZyBzbyBpdCBtYXkgZ28gdXAgYW5kIGRvd25cbiAgYSBsaXR0bGUuICBJZiB5b3UgbmVlZCBzb21ldGhpbmcgbW9yZSBzdGFibGUsIHdoeSBub3QgY29uc2lkZXIgZGVwbG95aW5nXG4gIGFuIGluc3RhbmNlIG9mIHRoZSBzd2l0Y2hib2FyZCB5b3Vyc2VsZiAtIGl0J3MgcHJldHR5IGVhc3kgOilcblxuICAjIyBSZWZlcmVuY2VcblxuICBgYGBcbiAgcXVpY2tjb25uZWN0KHNpZ25hbGhvc3QsIG9wdHM/KSA9PiBydGMtc2lnYWxsZXIgaW5zdGFuY2UgKCsgaGVscGVycylcbiAgYGBgXG5cbiAgIyMjIFZhbGlkIFF1aWNrIENvbm5lY3QgT3B0aW9uc1xuXG4gIFRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIHRoZSBgcnRjLXF1aWNrY29ubmVjdGAgbW9kdWxlIGZ1bmN0aW9uIGluZmx1ZW5jZSB0aGVcbiAgYmVoYXZpb3VyIG9mIHNvbWUgb2YgdGhlIHVuZGVybHlpbmcgY29tcG9uZW50cyB1c2VkIGZyb20gdGhlIHJ0Yy5pbyBzdWl0ZS5cblxuICBMaXN0ZWQgYmVsb3cgYXJlIHNvbWUgb2YgdGhlIGNvbW1vbmx5IHVzZWQgb3B0aW9uczpcblxuICAtIGBuc2AgKGRlZmF1bHQ6ICcnKVxuXG4gICAgQW4gb3B0aW9uYWwgbmFtZXNwYWNlIGZvciB5b3VyIHNpZ25hbGxpbmcgcm9vbS4gIFdoaWxlIHF1aWNrY29ubmVjdFxuICAgIHdpbGwgZ2VuZXJhdGUgYSB1bmlxdWUgaGFzaCBmb3IgdGhlIHJvb20sIHRoaXMgY2FuIGJlIG1hZGUgdG8gYmUgbW9yZVxuICAgIHVuaXF1ZSBieSBwcm92aWRpbmcgYSBuYW1lc3BhY2UuICBVc2luZyBhIG5hbWVzcGFjZSBtZWFucyB0d28gZGVtb3NcbiAgICB0aGF0IGhhdmUgZ2VuZXJhdGVkIHRoZSBzYW1lIGhhc2ggYnV0IHVzZSBhIGRpZmZlcmVudCBuYW1lc3BhY2Ugd2lsbCBiZVxuICAgIGluIGRpZmZlcmVudCByb29tcy5cblxuICAtIGByb29tYCAoZGVmYXVsdDogbnVsbCkgX2FkZGVkIDAuNl9cblxuICAgIFJhdGhlciB0aGFuIHVzZSB0aGUgaW50ZXJuYWwgaGFzaCBnZW5lcmF0aW9uXG4gICAgKHBsdXMgb3B0aW9uYWwgbmFtZXNwYWNlKSBmb3Igcm9vbSBuYW1lIGdlbmVyYXRpb24sIHNpbXBseSB1c2UgdGhpcyByb29tXG4gICAgbmFtZSBpbnN0ZWFkLiAgX19OT1RFOl9fIFVzZSBvZiB0aGUgYHJvb21gIG9wdGlvbiB0YWtlcyBwcmVjZW5kZW5jZSBvdmVyXG4gICAgYG5zYC5cblxuICAtIGBkZWJ1Z2AgKGRlZmF1bHQ6IGZhbHNlKVxuXG4gIFdyaXRlIHJ0Yy5pbyBzdWl0ZSBkZWJ1ZyBvdXRwdXQgdG8gdGhlIGJyb3dzZXIgY29uc29sZS5cblxuICAtIGBleHBlY3RlZExvY2FsU3RyZWFtc2AgKGRlZmF1bHQ6IG5vdCBzcGVjaWZpZWQpIF9hZGRlZCAzLjBfXG5cbiAgICBCeSBwcm92aWRpbmcgYSBwb3NpdGl2ZSBpbnRlZ2VyIHZhbHVlIGZvciB0aGlzIG9wdGlvbiB3aWxsIG1lYW4gdGhhdFxuICAgIHRoZSBjcmVhdGVkIHF1aWNrY29ubmVjdCBpbnN0YW5jZSB3aWxsIHdhaXQgdW50aWwgdGhlIHNwZWNpZmllZCBudW1iZXIgb2ZcbiAgICBzdHJlYW1zIGhhdmUgYmVlbiBhZGRlZCB0byB0aGUgcXVpY2tjb25uZWN0IFwidGVtcGxhdGVcIiBiZWZvcmUgYW5ub3VuY2luZ1xuICAgIHRvIHRoZSBzaWduYWxpbmcgc2VydmVyLlxuXG4gIC0gYG1hbnVhbEpvaW5gIChkZWZhdWx0OiBgZmFsc2VgKVxuXG4gICAgU2V0IHRoaXMgdmFsdWUgdG8gYHRydWVgIGlmIHlvdSB3b3VsZCBwcmVmZXIgdG8gY2FsbCB0aGUgYGpvaW5gIGZ1bmN0aW9uXG4gICAgdG8gY29ubmVjdGluZyB0byB0aGUgc2lnbmFsbGluZyBzZXJ2ZXIsIHJhdGhlciB0aGFuIGhhdmluZyB0aGF0IGhhcHBlblxuICAgIGF1dG9tYXRpY2FsbHkgYXMgc29vbiBhcyBxdWlja2Nvbm5lY3QgaXMgcmVhZHkgdG8uXG5cbiAgIyMjIyBPcHRpb25zIGZvciBQZWVyIENvbm5lY3Rpb24gQ3JlYXRpb25cblxuICBPcHRpb25zIHRoYXQgYXJlIHBhc3NlZCBvbnRvIHRoZVxuICBbcnRjLmNyZWF0ZUNvbm5lY3Rpb25dKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjI2NyZWF0ZWNvbm5lY3Rpb25vcHRzLWNvbnN0cmFpbnRzKVxuICBmdW5jdGlvbjpcblxuICAtIGBpY2VTZXJ2ZXJzYFxuXG4gIFRoaXMgcHJvdmlkZXMgYSBsaXN0IG9mIGljZSBzZXJ2ZXJzIHRoYXQgY2FuIGJlIHVzZWQgdG8gaGVscCBuZWdvdGlhdGUgYVxuICBjb25uZWN0aW9uIGJldHdlZW4gcGVlcnMuXG5cbiAgIyMjIyBPcHRpb25zIGZvciBQMlAgbmVnb3RpYXRpb25cblxuICBVbmRlciB0aGUgaG9vZCwgcXVpY2tjb25uZWN0IHVzZXMgdGhlXG4gIFtydGMvY291cGxlXShodHRwczovL2dpdGh1Yi5jb20vcnRjLWlvL3J0YyNydGNjb3VwbGUpIGxvZ2ljLCBhbmQgdGhlIG9wdGlvbnNcbiAgcGFzc2VkIHRvIHF1aWNrY29ubmVjdCBhcmUgYWxzbyBwYXNzZWQgb250byB0aGlzIGZ1bmN0aW9uLlxuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2lnbmFsaG9zdCwgb3B0cykge1xuICB2YXIgaGFzaCA9IHR5cGVvZiBsb2NhdGlvbiAhPSAndW5kZWZpbmVkJyAmJiBsb2NhdGlvbi5oYXNoLnNsaWNlKDEpO1xuICB2YXIgc2lnbmFsbGVyID0gcmVxdWlyZSgncnRjLXNpZ25hbGxlcicpKG1lc3NlbmdlcihzaWduYWxob3N0KSwgb3B0cyk7XG5cbiAgLy8gaW5pdCBjb25maWd1cmFibGUgdmFyc1xuICB2YXIgbnMgPSAob3B0cyB8fCB7fSkubnMgfHwgJyc7XG4gIHZhciByb29tID0gKG9wdHMgfHwge30pLnJvb207XG4gIHZhciBkZWJ1Z2dpbmcgPSAob3B0cyB8fCB7fSkuZGVidWc7XG4gIHZhciBhbGxvd0pvaW4gPSAhKG9wdHMgfHwge30pLm1hbnVhbEpvaW47XG4gIHZhciBoZWFydGJlYXQgPSAob3B0cyB8fCB7fSkuaGVhcnRiZWF0IHx8IDI1MDA7XG4gIHZhciBwcm9maWxlID0ge307XG4gIHZhciBhbm5vdW5jZWQgPSBmYWxzZTtcblxuICAvLyBpbml0aWFsaXNlIGljZVNlcnZlcnMgdG8gdW5kZWZpbmVkXG4gIC8vIHdlIHdpbGwgbm90IGFubm91bmNlIHVudGlsIHRoZXNlIGhhdmUgYmVlbiBwcm9wZXJseSBpbml0aWFsaXNlZFxuICB2YXIgaWNlU2VydmVycztcblxuICAvLyBjb2xsZWN0IHRoZSBsb2NhbCBzdHJlYW1zXG4gIHZhciBsb2NhbFN0cmVhbXMgPSBbXTtcblxuICAvLyBjcmVhdGUgdGhlIGNhbGxzIG1hcFxuICB2YXIgY2FsbHMgPSBzaWduYWxsZXIuY2FsbHMgPSBnZXRhYmxlKHt9KTtcblxuICAvLyBjcmVhdGUgdGhlIGtub3duIGRhdGEgY2hhbm5lbHMgcmVnaXN0cnlcbiAgdmFyIGNoYW5uZWxzID0ge307XG5cbiAgLy8gc2F2ZSB0aGUgcGx1Z2lucyBwYXNzZWQgdG8gdGhlIHNpZ25hbGxlclxuICB2YXIgcGx1Z2lucyA9IHNpZ25hbGxlci5wbHVnaW5zID0gKG9wdHMgfHwge30pLnBsdWdpbnMgfHwgW107XG4gIHZhciBwbHVnaW4gPSBkZXRlY3RQbHVnaW4oc2lnbmFsbGVyLnBsdWdpbnMpO1xuICB2YXIgcGx1Z2luUmVhZHk7XG5cbiAgLy8gY2hlY2sgaG93IG1hbnkgbG9jYWwgc3RyZWFtcyBoYXZlIGJlZW4gZXhwZWN0ZWQgKGRlZmF1bHQ6IDApXG4gIHZhciBleHBlY3RlZExvY2FsU3RyZWFtcyA9IHBhcnNlSW50KChvcHRzIHx8IHt9KS5leHBlY3RlZExvY2FsU3RyZWFtcywgMTApIHx8IDA7XG4gIHZhciBhbm5vdW5jZVRpbWVyID0gMDtcbiAgdmFyIGhlYXJ0YmVhdFRpbWVyID0gMDtcbiAgdmFyIHVwZGF0ZVRpbWVyID0gMDtcblxuICBmdW5jdGlvbiBjYWxsQ3JlYXRlKGlkLCBwYykge1xuICAgIGNhbGxzLnNldChpZCwge1xuICAgICAgYWN0aXZlOiBmYWxzZSxcbiAgICAgIHBjOiBwYyxcbiAgICAgIGNoYW5uZWxzOiBnZXRhYmxlKHt9KSxcbiAgICAgIHN0cmVhbXM6IFtdLFxuICAgICAgbGFzdHBpbmc6IERhdGUubm93KClcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGxFbmQoaWQpIHtcbiAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChpZCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIG5vIGRhdGEsIHRoZW4gZG8gbm90aGluZ1xuICAgIGlmICghIGNhbGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBkZWJ1ZygnZW5kaW5nIGNhbGwgdG86ICcgKyBpZCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIG5vIGRhdGEsIHRoZW4gcmV0dXJuXG4gICAgY2FsbC5jaGFubmVscy5rZXlzKCkuZm9yRWFjaChmdW5jdGlvbihsYWJlbCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBjYWxsLmNoYW5uZWxzLmdldChsYWJlbCk7XG4gICAgICB2YXIgYXJncyA9IFtpZCwgY2hhbm5lbCwgbGFiZWxdO1xuXG4gICAgICAvLyBlbWl0IHRoZSBwbGFpbiBjaGFubmVsOmNsb3NlZCBldmVudFxuICAgICAgc2lnbmFsbGVyLmFwcGx5KHNpZ25hbGxlciwgWydjaGFubmVsOmNsb3NlZCddLmNvbmNhdChhcmdzKSk7XG5cbiAgICAgIC8vIGVtaXQgdGhlIGxhYmVsbGVkIHZlcnNpb24gb2YgdGhlIGV2ZW50XG4gICAgICBzaWduYWxsZXIuYXBwbHkoc2lnbmFsbGVyLCBbJ2NoYW5uZWw6Y2xvc2VkOicgKyBsYWJlbF0uY29uY2F0KGFyZ3MpKTtcblxuICAgICAgLy8gZGVjb3VwbGUgdGhlIGV2ZW50c1xuICAgICAgY2hhbm5lbC5vbm9wZW4gPSBudWxsO1xuICAgIH0pO1xuXG4gICAgLy8gdHJpZ2dlciBzdHJlYW06cmVtb3ZlZCBldmVudHMgZm9yIGVhY2ggb2YgdGhlIHJlbW90ZXN0cmVhbXMgaW4gdGhlIHBjXG4gICAgY2FsbC5zdHJlYW1zLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICBzaWduYWxsZXIoJ3N0cmVhbTpyZW1vdmVkJywgaWQsIHN0cmVhbSk7XG4gICAgfSk7XG5cbiAgICAvLyBkZWxldGUgdGhlIGNhbGwgZGF0YVxuICAgIGNhbGxzLmRlbGV0ZShpZCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIG5vIG1vcmUgY2FsbHMsIGRpc2FibGUgdGhlIGhlYXJ0YmVhdFxuICAgIGlmIChjYWxscy5rZXlzKCkubGVuZ3RoID09PSAwKSB7XG4gICAgICBoYlJlc2V0KCk7XG4gICAgfVxuXG4gICAgLy8gdHJpZ2dlciB0aGUgY2FsbDplbmRlZCBldmVudFxuICAgIHNpZ25hbGxlcignY2FsbDplbmRlZCcsIGlkLCBjYWxsLnBjKTtcblxuICAgIC8vIGVuc3VyZSB0aGUgcGVlciBjb25uZWN0aW9uIGlzIHByb3Blcmx5IGNsZWFuZWQgdXBcbiAgICBjbGVhbnVwKGNhbGwucGMpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2FsbFN0YXJ0KGlkLCBwYywgZGF0YSkge1xuICAgIHZhciBjYWxsID0gY2FsbHMuZ2V0KGlkKTtcbiAgICB2YXIgc3RyZWFtcyA9IFtdLmNvbmNhdChwYy5nZXRSZW1vdGVTdHJlYW1zKCkpO1xuXG4gICAgLy8gZmxhZyB0aGUgY2FsbCBhcyBhY3RpdmVcbiAgICBjYWxsLmFjdGl2ZSA9IHRydWU7XG4gICAgY2FsbC5zdHJlYW1zID0gW10uY29uY2F0KHBjLmdldFJlbW90ZVN0cmVhbXMoKSk7XG5cbiAgICBwYy5vbmFkZHN0cmVhbSA9IGNyZWF0ZVN0cmVhbUFkZEhhbmRsZXIoaWQpO1xuICAgIHBjLm9ucmVtb3Zlc3RyZWFtID0gY3JlYXRlU3RyZWFtUmVtb3ZlSGFuZGxlcihpZCk7XG5cbiAgICBkZWJ1ZyhzaWduYWxsZXIuaWQgKyAnIC0gJyArIGlkICsgJyBjYWxsIHN0YXJ0OiAnICsgc3RyZWFtcy5sZW5ndGggKyAnIHN0cmVhbXMnKTtcbiAgICBzaWduYWxsZXIoJ2NhbGw6c3RhcnRlZCcsIGlkLCBwYywgZGF0YSk7XG5cbiAgICAvLyBjb25maWd1cmUgdGhlIGhlYXJ0YmVhdCB0aW1lclxuICAgIGhiSW5pdCgpO1xuXG4gICAgLy8gZXhhbWluZSB0aGUgZXhpc3RpbmcgcmVtb3RlIHN0cmVhbXMgYWZ0ZXIgYSBzaG9ydCBkZWxheVxuICAgIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKSB7XG4gICAgICAvLyBpdGVyYXRlIHRocm91Z2ggYW55IHJlbW90ZSBzdHJlYW1zXG4gICAgICBzdHJlYW1zLmZvckVhY2gocmVjZWl2ZVJlbW90ZVN0cmVhbShpZCkpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZWFkeVRvQW5ub3VuY2UoKSB7XG4gICAgY2xlYXJUaW1lb3V0KGFubm91bmNlVGltZXIpO1xuICAgIC8vIGlmIHdlIGhhdmUgYWxyZWFkeSBhbm5vdW5jZWQgZG8gbm90aGluZyFcbiAgICBpZiAoYW5ub3VuY2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEgYWxsb3dKb2luKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaWYgd2UgaGF2ZSBhIHBsdWdpbiBidXQgaXQncyBub3QgaW5pdGlhbGl6ZWQgd2UgYXJlbid0IHJlYWR5XG4gICAgaWYgKHBsdWdpbiAmJiAoISBwbHVnaW5SZWFkeSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBoYXZlIG5vIGljZVNlcnZlcnMgd2UgYXJlbid0IHJlYWR5XG4gICAgaWYgKCEgaWNlU2VydmVycykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlmIHdlIGFyZSB3YWl0aW5nIGZvciBhIHNldCBudW1iZXIgb2Ygc3RyZWFtcywgdGhlbiB3YWl0IHVudGlsIHdlIGhhdmVcbiAgICAvLyB0aGUgcmVxdWlyZWQgbnVtYmVyXG4gICAgaWYgKGV4cGVjdGVkTG9jYWxTdHJlYW1zICYmIGxvY2FsU3RyZWFtcy5sZW5ndGggPCBleHBlY3RlZExvY2FsU3RyZWFtcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGFubm91bmNlIG91cnNlbHZlcyB0byBvdXIgbmV3IGZyaWVuZFxuICAgIGFubm91bmNlVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGRhdGEgPSBleHRlbmQoeyByb29tOiByb29tIH0sIHByb2ZpbGUpO1xuXG4gICAgICAvLyBhbm5vdW5jZSBhbmQgZW1pdCB0aGUgbG9jYWwgYW5ub3VuY2UgZXZlbnRcbiAgICAgIHNpZ25hbGxlci5hbm5vdW5jZShkYXRhKTtcbiAgICAgIGFubm91bmNlZCA9IHRydWU7XG4gICAgfSwgMCk7XG4gIH1cblxuIGZ1bmN0aW9uIGNvbm5lY3QoaWQpIHtcbiAgICB2YXIgZGF0YSA9IGdldFBlZXJEYXRhKGlkKTtcbiAgICB2YXIgcGM7XG4gICAgdmFyIG1vbml0b3I7XG5cbiAgICAvLyBpZiB0aGUgcm9vbSBpcyBub3QgYSBtYXRjaCwgYWJvcnRcbiAgICBpZiAoZGF0YS5yb29tICE9PSByb29tKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gZW5kIGFueSBjYWxsIHRvIHRoaXMgaWQgc28gd2Uga25vdyB3ZSBhcmUgc3RhcnRpbmcgZnJlc2hcbiAgICBjYWxsRW5kKGlkKTtcblxuICAgIC8vIGNyZWF0ZSBhIHBlZXIgY29ubmVjdGlvblxuICAgIC8vIGljZVNlcnZlcnMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCB1c2luZyBnZW5pY2UgdGFraW5nIHByZWNlbmRlbmNlXG4gICAgcGMgPSBydGMuY3JlYXRlQ29ubmVjdGlvbihcbiAgICAgIGV4dGVuZCh7fSwgb3B0cywgeyBpY2VTZXJ2ZXJzOiBpY2VTZXJ2ZXJzIH0pLFxuICAgICAgKG9wdHMgfHwge30pLmNvbnN0cmFpbnRzXG4gICAgKTtcblxuICAgIHNpZ25hbGxlcigncGVlcjpjb25uZWN0JywgZGF0YS5pZCwgcGMsIGRhdGEpO1xuXG4gICAgLy8gYWRkIHRoaXMgY29ubmVjdGlvbiB0byB0aGUgY2FsbHMgbGlzdFxuICAgIGNhbGxDcmVhdGUoZGF0YS5pZCwgcGMpO1xuXG4gICAgLy8gYWRkIHRoZSBsb2NhbCBzdHJlYW1zXG4gICAgbG9jYWxTdHJlYW1zLmZvckVhY2goZnVuY3Rpb24oc3RyZWFtLCBpZHgpIHtcbiAgICAgIHBjLmFkZFN0cmVhbShzdHJlYW0pO1xuICAgIH0pO1xuXG4gICAgLy8gYWRkIHRoZSBkYXRhIGNoYW5uZWxzXG4gICAgLy8gZG8gdGhpcyBkaWZmZXJlbnRseSBiYXNlZCBvbiB3aGV0aGVyIHRoZSBjb25uZWN0aW9uIGlzIGFcbiAgICAvLyBtYXN0ZXIgb3IgYSBzbGF2ZSBjb25uZWN0aW9uXG4gICAgaWYgKHNpZ25hbGxlci5pc01hc3RlcihkYXRhLmlkKSkge1xuICAgICAgZGVidWcoJ2lzIG1hc3RlciwgY3JlYXRpbmcgZGF0YSBjaGFubmVsczogJywgT2JqZWN0LmtleXMoY2hhbm5lbHMpKTtcblxuICAgICAgLy8gY3JlYXRlIHRoZSBjaGFubmVsc1xuICAgICAgT2JqZWN0LmtleXMoY2hhbm5lbHMpLmZvckVhY2goZnVuY3Rpb24obGFiZWwpIHtcbiAgICAgICBnb3RQZWVyQ2hhbm5lbChwYy5jcmVhdGVEYXRhQ2hhbm5lbChsYWJlbCwgY2hhbm5lbHNbbGFiZWxdKSwgcGMsIGRhdGEpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcGMub25kYXRhY2hhbm5lbCA9IGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICB2YXIgY2hhbm5lbCA9IGV2dCAmJiBldnQuY2hhbm5lbDtcblxuICAgICAgICAvLyBpZiB3ZSBoYXZlIG5vIGNoYW5uZWwsIGFib3J0XG4gICAgICAgIGlmICghIGNoYW5uZWwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY2hhbm5lbHNbY2hhbm5lbC5sYWJlbF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGdvdFBlZXJDaGFubmVsKGNoYW5uZWwsIHBjLCBnZXRQZWVyRGF0YShpZCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIGNvdXBsZSB0aGUgY29ubmVjdGlvbnNcbiAgICBkZWJ1ZygnY291cGxpbmcgJyArIHNpZ25hbGxlci5pZCArICcgdG8gJyArIGRhdGEuaWQpO1xuICAgIG1vbml0b3IgPSBydGMuY291cGxlKHBjLCBpZCwgc2lnbmFsbGVyLCBleHRlbmQoe30sIG9wdHMsIHtcbiAgICAgIGxvZ2dlcjogbWJ1cygncGMuJyArIGlkLCBzaWduYWxsZXIpXG4gICAgfSkpO1xuXG4gICAgc2lnbmFsbGVyKCdwZWVyOmNvdXBsZScsIGlkLCBwYywgZGF0YSwgbW9uaXRvcik7XG5cbiAgICAvLyBvbmNlIGFjdGl2ZSwgdHJpZ2dlciB0aGUgcGVlciBjb25uZWN0IGV2ZW50XG4gICAgbW9uaXRvci5vbmNlKCdjb25uZWN0ZWQnLCBjYWxsU3RhcnQuYmluZChudWxsLCBpZCwgcGMsIGRhdGEpKVxuICAgIG1vbml0b3Iub25jZSgnY2xvc2VkJywgY2FsbEVuZC5iaW5kKG51bGwsIGlkKSk7XG5cbiAgICAvLyBpZiB3ZSBhcmUgdGhlIG1hc3RlciBjb25ubmVjdGlvbiwgY3JlYXRlIHRoZSBvZmZlclxuICAgIC8vIE5PVEU6IHRoaXMgb25seSByZWFsbHkgZm9yIHRoZSBzYWtlIG9mIHBvbGl0ZW5lc3MsIGFzIHJ0YyBjb3VwbGVcbiAgICAvLyBpbXBsZW1lbnRhdGlvbiBoYW5kbGVzIHRoZSBzbGF2ZSBhdHRlbXB0aW5nIHRvIGNyZWF0ZSBhbiBvZmZlclxuICAgIGlmIChzaWduYWxsZXIuaXNNYXN0ZXIoaWQpKSB7XG4gICAgICBtb25pdG9yLmNyZWF0ZU9mZmVyKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlU3RyZWFtQWRkSGFuZGxlcihpZCkge1xuICAgIHJldHVybiBmdW5jdGlvbihldnQpIHtcbiAgICAgIGRlYnVnKCdwZWVyICcgKyBpZCArICcgYWRkZWQgc3RyZWFtJyk7XG4gICAgICB1cGRhdGVSZW1vdGVTdHJlYW1zKGlkKTtcbiAgICAgIHJlY2VpdmVSZW1vdGVTdHJlYW0oaWQpKGV2dC5zdHJlYW0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVN0cmVhbVJlbW92ZUhhbmRsZXIoaWQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZXZ0KSB7XG4gICAgICBkZWJ1ZygncGVlciAnICsgaWQgKyAnIHJlbW92ZWQgc3RyZWFtJyk7XG4gICAgICB1cGRhdGVSZW1vdGVTdHJlYW1zKGlkKTtcbiAgICAgIHNpZ25hbGxlcignc3RyZWFtOnJlbW92ZWQnLCBpZCwgZXZ0LnN0cmVhbSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFjdGl2ZUNhbGwocGVlcklkKSB7XG4gICAgdmFyIGNhbGwgPSBjYWxscy5nZXQocGVlcklkKTtcblxuICAgIGlmICghIGNhbGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gYWN0aXZlIGNhbGwgZm9yIHBlZXI6ICcgKyBwZWVySWQpO1xuICAgIH1cblxuICAgIHJldHVybiBjYWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGVlckRhdGEoaWQpIHtcbiAgICB2YXIgcGVlciA9IHNpZ25hbGxlci5wZWVycy5nZXQoaWQpO1xuXG4gICAgcmV0dXJuIHBlZXIgJiYgcGVlci5kYXRhO1xuICB9XG5cbiAgZnVuY3Rpb24gZ290UGVlckNoYW5uZWwoY2hhbm5lbCwgcGMsIGRhdGEpIHtcbiAgICB2YXIgY2hhbm5lbE1vbml0b3I7XG5cbiAgICBmdW5jdGlvbiBjaGFubmVsUmVhZHkoKSB7XG4gICAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChkYXRhLmlkKTtcbiAgICAgIHZhciBhcmdzID0gWyBkYXRhLmlkLCBjaGFubmVsLCBkYXRhLCBwYyBdO1xuXG4gICAgICAvLyBkZWNvdXBsZSB0aGUgY2hhbm5lbC5vbm9wZW4gbGlzdGVuZXJcbiAgICAgIGRlYnVnKCdyZXBvcnRpbmcgY2hhbm5lbCBcIicgKyBjaGFubmVsLmxhYmVsICsgJ1wiIHJlYWR5LCBoYXZlIGNhbGw6ICcgKyAoISFjYWxsKSk7XG4gICAgICBjbGVhckludGVydmFsKGNoYW5uZWxNb25pdG9yKTtcbiAgICAgIGNoYW5uZWwub25vcGVuID0gbnVsbDtcblxuICAgICAgLy8gc2F2ZSB0aGUgY2hhbm5lbFxuICAgICAgaWYgKGNhbGwpIHtcbiAgICAgICAgY2FsbC5jaGFubmVscy5zZXQoY2hhbm5lbC5sYWJlbCwgY2hhbm5lbCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHRyaWdnZXIgdGhlICVjaGFubmVsLmxhYmVsJTpvcGVuIGV2ZW50XG4gICAgICBkZWJ1ZygndHJpZ2dlcmluZyBjaGFubmVsOm9wZW5lZCBldmVudHMgZm9yIGNoYW5uZWw6ICcgKyBjaGFubmVsLmxhYmVsKTtcblxuICAgICAgLy8gZW1pdCB0aGUgcGxhaW4gY2hhbm5lbDpvcGVuZWQgZXZlbnRcbiAgICAgIHNpZ25hbGxlci5hcHBseShzaWduYWxsZXIsIFsnY2hhbm5lbDpvcGVuZWQnXS5jb25jYXQoYXJncykpO1xuXG4gICAgICAvLyBlbWl0IHRoZSBjaGFubmVsOm9wZW5lZDolbGFiZWwlIGV2ZVxuICAgICAgc2lnbmFsbGVyLmFwcGx5KFxuICAgICAgICBzaWduYWxsZXIsXG4gICAgICAgIFsnY2hhbm5lbDpvcGVuZWQ6JyArIGNoYW5uZWwubGFiZWxdLmNvbmNhdChhcmdzKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBkZWJ1ZygnY2hhbm5lbCAnICsgY2hhbm5lbC5sYWJlbCArICcgZGlzY292ZXJlZCBmb3IgcGVlcjogJyArIGRhdGEuaWQpO1xuICAgIGlmIChjaGFubmVsLnJlYWR5U3RhdGUgPT09ICdvcGVuJykge1xuICAgICAgcmV0dXJuIGNoYW5uZWxSZWFkeSgpO1xuICAgIH1cblxuICAgIGRlYnVnKCdjaGFubmVsIG5vdCByZWFkeSwgY3VycmVudCBzdGF0ZSA9ICcgKyBjaGFubmVsLnJlYWR5U3RhdGUpO1xuICAgIGNoYW5uZWwub25vcGVuID0gY2hhbm5lbFJlYWR5O1xuXG4gICAgLy8gbW9uaXRvciB0aGUgY2hhbm5lbCBvcGVuIChkb24ndCB0cnVzdCB0aGUgY2hhbm5lbCBvcGVuIGV2ZW50IGp1c3QgeWV0KVxuICAgIGNoYW5uZWxNb25pdG9yID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICBkZWJ1ZygnY2hlY2tpbmcgY2hhbm5lbCBzdGF0ZSwgY3VycmVudCBzdGF0ZSA9ICcgKyBjaGFubmVsLnJlYWR5U3RhdGUpO1xuICAgICAgaWYgKGNoYW5uZWwucmVhZHlTdGF0ZSA9PT0gJ29wZW4nKSB7XG4gICAgICAgIGNoYW5uZWxSZWFkeSgpO1xuICAgICAgfVxuICAgIH0sIDUwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYkluaXQoKSB7XG4gICAgLy8gaWYgdGhlIGhlYXJ0YmVhdCB0aW1lciBpcyBhY3RpdmUsIG9yIGhlYXJ0YmVhdCBoYXMgYmVlbiBkaXNhYmxlZCAoMCwgZmFsc2UsIGV0YykgcmV0dXJuXG4gICAgaWYgKGhlYXJ0YmVhdFRpbWVyIHx8ICghIGhlYXJ0YmVhdCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBoZWFydGJlYXRUaW1lciA9IHNldEludGVydmFsKGhiU2VuZCwgaGVhcnRiZWF0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhiU2VuZCgpIHtcbiAgICB2YXIgdGlja0luYWN0aXZlID0gKERhdGUubm93KCkgLSAoaGVhcnRiZWF0ICogNCkpO1xuXG4gICAgLy8gaXRlcmF0ZSB0aHJvdWdoIG91ciBlc3RhYmxpc2hlZCBjYWxsc1xuICAgIGNhbGxzLmtleXMoKS5mb3JFYWNoKGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChpZCk7XG5cbiAgICAgIC8vIGlmIHRoZSBjYWxsIHBpbmcgaXMgdG9vIG9sZCwgZW5kIHRoZSBjYWxsXG4gICAgICBpZiAoY2FsbC5sYXN0cGluZyA8IHRpY2tJbmFjdGl2ZSkge1xuICAgICAgICByZXR1cm4gY2FsbEVuZChpZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNlbmQgYSBwaW5nIG1lc3NhZ2VcbiAgICAgIHNpZ25hbGxlci50byhpZCkuc2VuZCgnL3BpbmcnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhiUmVzZXQoKSB7XG4gICAgY2xlYXJJbnRlcnZhbChoZWFydGJlYXRUaW1lcik7XG4gICAgaGVhcnRiZWF0VGltZXIgPSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFBsdWdpbigpIHtcbiAgICByZXR1cm4gcGx1Z2luICYmIHBsdWdpbi5pbml0KG9wdHMsIGZ1bmN0aW9uKGVycikge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICByZXR1cm4gY29uc29sZS5lcnJvcignQ291bGQgbm90IGluaXRpYWxpemUgcGx1Z2luOiAnLCBlcnIpO1xuICAgICAgfVxuXG4gICAgICBwbHVnaW5SZWFkeSA9IHRydWU7XG4gICAgICBjaGVja1JlYWR5VG9Bbm5vdW5jZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlTG9jYWxBbm5vdW5jZShkYXRhKSB7XG4gICAgLy8gaWYgd2Ugc2VuZCBhbiBhbm5vdW5jZSB3aXRoIGFuIHVwZGF0ZWQgcm9vbSB0aGVuIHVwZGF0ZSBvdXIgbG9jYWwgcm9vbSBuYW1lXG4gICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEucm9vbSAhPSAndW5kZWZpbmVkJykge1xuICAgICAgcm9vbSA9IGRhdGEucm9vbTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVQZWVyRmlsdGVyKGlkLCBkYXRhKSB7XG4gICAgLy8gb25seSBjb25uZWN0IHdpdGggdGhlIHBlZXIgaWYgd2UgYXJlIHJlYWR5XG4gICAgZGF0YS5hbGxvdyA9IGRhdGEuYWxsb3cgJiYgKGxvY2FsU3RyZWFtcy5sZW5ndGggPj0gZXhwZWN0ZWRMb2NhbFN0cmVhbXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlUGVlclVwZGF0ZShkYXRhKSB7XG4gICAgdmFyIGlkID0gZGF0YSAmJiBkYXRhLmlkO1xuICAgIHZhciBhY3RpdmVDYWxsID0gaWQgJiYgY2FsbHMuZ2V0KGlkKTtcblxuICAgIC8vIGlmIHdlIGhhdmUgcmVjZWl2ZWQgYW4gdXBkYXRlIGZvciBhIHBlZXIgdGhhdCBoYXMgbm8gYWN0aXZlIGNhbGxzLFxuICAgIC8vIHRoZW4gcGFzcyB0aGlzIG9udG8gdGhlIGFubm91bmNlIGhhbmRsZXJcbiAgICBpZiAoaWQgJiYgKCEgYWN0aXZlQ2FsbCkpIHtcbiAgICAgIGRlYnVnKCdyZWNlaXZlZCBwZWVyIHVwZGF0ZSBmcm9tIHBlZXIgJyArIGlkICsgJywgbm8gYWN0aXZlIGNhbGxzJyk7XG4gICAgICBzaWduYWxsZXIudG8oaWQpLnNlbmQoJy9yZWNvbm5lY3QnKTtcbiAgICAgIHJldHVybiBjb25uZWN0KGlkKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVQaW5nKHNlbmRlcikge1xuICAgIHZhciBjYWxsID0gY2FsbHMuZ2V0KHNlbmRlciAmJiBzZW5kZXIuaWQpO1xuXG4gICAgLy8gc2V0IHRoZSBsYXN0IHBpbmcgZm9yIHRoZSBkYXRhXG4gICAgaWYgKGNhbGwpIHtcbiAgICAgIGNhbGwubGFzdHBpbmcgPSBEYXRlLm5vdygpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY2VpdmVSZW1vdGVTdHJlYW0oaWQpIHtcbiAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChpZCk7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICBzaWduYWxsZXIoJ3N0cmVhbTphZGRlZCcsIGlkLCBzdHJlYW0sIGdldFBlZXJEYXRhKGlkKSk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZVJlbW90ZVN0cmVhbXMoaWQpIHtcbiAgICB2YXIgY2FsbCA9IGNhbGxzLmdldChpZCk7XG5cbiAgICBpZiAoY2FsbCAmJiBjYWxsLnBjKSB7XG4gICAgICBjYWxsLnN0cmVhbXMgPSBbXS5jb25jYXQoY2FsbC5wYy5nZXRSZW1vdGVTdHJlYW1zKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGlmIHRoZSByb29tIGlzIG5vdCBkZWZpbmVkLCB0aGVuIGdlbmVyYXRlIHRoZSByb29tIG5hbWVcbiAgaWYgKCEgcm9vbSkge1xuICAgIC8vIGlmIHRoZSBoYXNoIGlzIG5vdCBhc3NpZ25lZCwgdGhlbiBjcmVhdGUgYSByYW5kb20gaGFzaCB2YWx1ZVxuICAgIGlmICh0eXBlb2YgbG9jYXRpb24gIT0gJ3VuZGVmaW5lZCcgJiYgKCEgaGFzaCkpIHtcbiAgICAgIGhhc2ggPSBsb2NhdGlvbi5oYXNoID0gJycgKyAoTWF0aC5wb3coMiwgNTMpICogTWF0aC5yYW5kb20oKSk7XG4gICAgfVxuXG4gICAgcm9vbSA9IG5zICsgJyMnICsgaGFzaDtcbiAgfVxuXG4gIGlmIChkZWJ1Z2dpbmcpIHtcbiAgICBydGMubG9nZ2VyLmVuYWJsZS5hcHBseShydGMubG9nZ2VyLCBBcnJheS5pc0FycmF5KGRlYnVnKSA/IGRlYnVnZ2luZyA6IFsnKiddKTtcbiAgfVxuXG4gIHNpZ25hbGxlci5vbigncGVlcjphbm5vdW5jZScsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBjb25uZWN0KGRhdGEuaWQpO1xuICB9KTtcblxuICBzaWduYWxsZXIub24oJ3BlZXI6dXBkYXRlJywgaGFuZGxlUGVlclVwZGF0ZSk7XG5cbiAgc2lnbmFsbGVyLm9uKCdtZXNzYWdlOnJlY29ubmVjdCcsIGZ1bmN0aW9uKHNlbmRlcikge1xuICAgIGNvbm5lY3Qoc2VuZGVyLmlkKTtcbiAgfSk7XG5cblxuXG4gIC8qKlxuICAgICMjIyBRdWlja2Nvbm5lY3QgQnJvYWRjYXN0IGFuZCBEYXRhIENoYW5uZWwgSGVscGVyIEZ1bmN0aW9uc1xuXG4gICAgVGhlIGZvbGxvd2luZyBhcmUgZnVuY3Rpb25zIHRoYXQgYXJlIHBhdGNoZWQgaW50byB0aGUgYHJ0Yy1zaWduYWxsZXJgXG4gICAgaW5zdGFuY2UgdGhhdCBtYWtlIHdvcmtpbmcgd2l0aCBhbmQgY3JlYXRpbmcgZnVuY3Rpb25hbCBXZWJSVEMgYXBwbGljYXRpb25zXG4gICAgYSBsb3Qgc2ltcGxlci5cblxuICAqKi9cblxuICAvKipcbiAgICAjIyMjIGFkZFN0cmVhbVxuXG4gICAgYGBgXG4gICAgYWRkU3RyZWFtKHN0cmVhbTpNZWRpYVN0cmVhbSkgPT4gcWNcbiAgICBgYGBcblxuICAgIEFkZCB0aGUgc3RyZWFtIHRvIGFjdGl2ZSBjYWxscyBhbmQgYWxzbyBzYXZlIHRoZSBzdHJlYW0gc28gdGhhdCBpdFxuICAgIGNhbiBiZSBhZGRlZCB0byBmdXR1cmUgY2FsbHMuXG5cbiAgKiovXG4gIHNpZ25hbGxlci5icm9hZGNhc3QgPSBzaWduYWxsZXIuYWRkU3RyZWFtID0gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgbG9jYWxTdHJlYW1zLnB1c2goc3RyZWFtKTtcblxuICAgIC8vIGlmIHdlIGhhdmUgYW55IGFjdGl2ZSBjYWxscywgdGhlbiBhZGQgdGhlIHN0cmVhbVxuICAgIGNhbGxzLnZhbHVlcygpLmZvckVhY2goZnVuY3Rpb24oZGF0YSkge1xuICAgICAgZGF0YS5wYy5hZGRTdHJlYW0oc3RyZWFtKTtcbiAgICB9KTtcblxuICAgIGNoZWNrUmVhZHlUb0Fubm91bmNlKCk7XG4gICAgcmV0dXJuIHNpZ25hbGxlcjtcbiAgfTtcblxuICAvKipcbiAgICAjIyMjIGVuZENhbGxzKClcblxuICAgIFRoZSBgZW5kQ2FsbHNgIGZ1bmN0aW9uIHRlcm1pbmF0ZXMgYWxsIHRoZSBhY3RpdmUgY2FsbHMgdGhhdCBoYXZlIGJlZW5cbiAgICBjcmVhdGVkIGluIHRoaXMgcXVpY2tjb25uZWN0IGluc3RhbmNlLiAgQ2FsbGluZyBgZW5kQ2FsbHNgIGRvZXMgbm90XG4gICAga2lsbCB0aGUgY29ubmVjdGlvbiB3aXRoIHRoZSBzaWduYWxsaW5nIHNlcnZlci5cblxuICAqKi9cbiAgc2lnbmFsbGVyLmVuZENhbGxzID0gZnVuY3Rpb24oKSB7XG4gICAgY2FsbHMua2V5cygpLmZvckVhY2goY2FsbEVuZCk7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyBjbG9zZSgpXG5cbiAgICBUaGUgYGNsb3NlYCBmdW5jdGlvbiBwcm92aWRlcyBhIGNvbnZlbmllbnQgd2F5IG9mIGNsb3NpbmcgYWxsIGFzc29jaWF0ZWRcbiAgICBwZWVyIGNvbm5lY3Rpb25zLiAgVGhpcyBmdW5jdGlvbiBzaW1wbHkgdXNlcyB0aGUgYGVuZENhbGxzYCBmdW5jdGlvbiBhbmRcbiAgICB0aGUgdW5kZXJseWluZyBgbGVhdmVgIGZ1bmN0aW9uIG9mIHRoZSBzaWduYWxsZXIgdG8gZG8gYSBcImZ1bGwgY2xlYW51cFwiXG4gICAgb2YgYWxsIGNvbm5lY3Rpb25zLlxuICAqKi9cbiAgc2lnbmFsbGVyLmNsb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgc2lnbmFsbGVyLmVuZENhbGxzKCk7XG4gICAgc2lnbmFsbGVyLmxlYXZlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyBjcmVhdGVEYXRhQ2hhbm5lbChsYWJlbCwgY29uZmlnKVxuXG4gICAgUmVxdWVzdCB0aGF0IGEgZGF0YSBjaGFubmVsIHdpdGggdGhlIHNwZWNpZmllZCBgbGFiZWxgIGlzIGNyZWF0ZWQgb25cbiAgICB0aGUgcGVlciBjb25uZWN0aW9uLiAgV2hlbiB0aGUgZGF0YSBjaGFubmVsIGlzIG9wZW4gYW5kIGF2YWlsYWJsZSwgYW5cbiAgICBldmVudCB3aWxsIGJlIHRyaWdnZXJlZCB1c2luZyB0aGUgbGFiZWwgb2YgdGhlIGRhdGEgY2hhbm5lbC5cblxuICAgIEZvciBleGFtcGxlLCBpZiBhIG5ldyBkYXRhIGNoYW5uZWwgd2FzIHJlcXVlc3RlZCB1c2luZyB0aGUgZm9sbG93aW5nXG4gICAgY2FsbDpcblxuICAgIGBgYGpzXG4gICAgdmFyIHFjID0gcXVpY2tjb25uZWN0KCdodHRwczovL3N3aXRjaGJvYXJkLnJ0Yy5pby8nKS5jcmVhdGVEYXRhQ2hhbm5lbCgndGVzdCcpO1xuICAgIGBgYFxuXG4gICAgVGhlbiB3aGVuIHRoZSBkYXRhIGNoYW5uZWwgaXMgcmVhZHkgZm9yIHVzZSwgYSBgdGVzdDpvcGVuYCBldmVudCB3b3VsZFxuICAgIGJlIGVtaXR0ZWQgYnkgYHFjYC5cblxuICAqKi9cbiAgc2lnbmFsbGVyLmNyZWF0ZURhdGFDaGFubmVsID0gZnVuY3Rpb24obGFiZWwsIG9wdHMpIHtcbiAgICAvLyBjcmVhdGUgYSBjaGFubmVsIG9uIGFsbCBleGlzdGluZyBjYWxsc1xuICAgIGNhbGxzLmtleXMoKS5mb3JFYWNoKGZ1bmN0aW9uKHBlZXJJZCkge1xuICAgICAgdmFyIGNhbGwgPSBjYWxscy5nZXQocGVlcklkKTtcbiAgICAgIHZhciBkYztcblxuICAgICAgLy8gaWYgd2UgYXJlIHRoZSBtYXN0ZXIgY29ubmVjdGlvbiwgY3JlYXRlIHRoZSBkYXRhIGNoYW5uZWxcbiAgICAgIGlmIChjYWxsICYmIGNhbGwucGMgJiYgc2lnbmFsbGVyLmlzTWFzdGVyKHBlZXJJZCkpIHtcbiAgICAgICAgZGMgPSBjYWxsLnBjLmNyZWF0ZURhdGFDaGFubmVsKGxhYmVsLCBvcHRzKTtcbiAgICAgICAgZ290UGVlckNoYW5uZWwoZGMsIGNhbGwucGMsIGdldFBlZXJEYXRhKHBlZXJJZCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gc2F2ZSB0aGUgZGF0YSBjaGFubmVsIG9wdHMgaW4gdGhlIGxvY2FsIGNoYW5uZWxzIGRpY3Rpb25hcnlcbiAgICBjaGFubmVsc1tsYWJlbF0gPSBvcHRzIHx8IG51bGw7XG5cbiAgICByZXR1cm4gc2lnbmFsbGVyO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyMgam9pbigpXG5cbiAgICBUaGUgYGpvaW5gIGZ1bmN0aW9uIGlzIHVzZWQgd2hlbiBgbWFudWFsSm9pbmAgaXMgc2V0IHRvIHRydWUgd2hlbiBjcmVhdGluZ1xuICAgIGEgcXVpY2tjb25uZWN0IGluc3RhbmNlLiAgQ2FsbCB0aGUgYGpvaW5gIGZ1bmN0aW9uIG9uY2UgeW91IGFyZSByZWFkeSB0b1xuICAgIGpvaW4gdGhlIHNpZ25hbGxpbmcgc2VydmVyIGFuZCBpbml0aWF0ZSBjb25uZWN0aW9ucyB3aXRoIG90aGVyIHBlb3BsZS5cblxuICAqKi9cbiAgc2lnbmFsbGVyLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgICBhbGxvd0pvaW4gPSB0cnVlO1xuICAgIGNoZWNrUmVhZHlUb0Fubm91bmNlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyBgZ2V0KG5hbWUpYFxuXG4gICAgVGhlIGBnZXRgIGZ1bmN0aW9uIHJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlIGZvciB0aGUgc3BlY2lmaWVkIHByb3BlcnR5IG5hbWUuXG4gICoqL1xuICBzaWduYWxsZXIuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiBwcm9maWxlW25hbWVdO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyMgYGdldExvY2FsU3RyZWFtcygpYFxuXG4gICAgUmV0dXJuIGEgY29weSBvZiB0aGUgbG9jYWwgc3RyZWFtcyB0aGF0IGhhdmUgY3VycmVudGx5IGJlZW4gY29uZmlndXJlZFxuICAqKi9cbiAgc2lnbmFsbGVyLmdldExvY2FsU3RyZWFtcyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBbXS5jb25jYXQobG9jYWxTdHJlYW1zKTtcbiAgfTtcblxuICAvKipcbiAgICAjIyMjIHJlYWN0aXZlKClcblxuICAgIEZsYWcgdGhhdCB0aGlzIHNlc3Npb24gd2lsbCBiZSBhIHJlYWN0aXZlIGNvbm5lY3Rpb24uXG5cbiAgKiovXG4gIHNpZ25hbGxlci5yZWFjdGl2ZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGFkZCB0aGUgcmVhY3RpdmUgZmxhZ1xuICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuICAgIG9wdHMucmVhY3RpdmUgPSB0cnVlO1xuXG4gICAgLy8gY2hhaW5cbiAgICByZXR1cm4gc2lnbmFsbGVyO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyMgcmVtb3ZlU3RyZWFtXG5cbiAgICBgYGBcbiAgICByZW1vdmVTdHJlYW0oc3RyZWFtOk1lZGlhU3RyZWFtKVxuICAgIGBgYFxuXG4gICAgUmVtb3ZlIHRoZSBzcGVjaWZpZWQgc3RyZWFtIGZyb20gYm90aCB0aGUgbG9jYWwgc3RyZWFtcyB0aGF0IGFyZSB0b1xuICAgIGJlIGNvbm5lY3RlZCB0byBuZXcgcGVlcnMsIGFuZCBhbHNvIGZyb20gYW55IGFjdGl2ZSBjYWxscy5cblxuICAqKi9cbiAgc2lnbmFsbGVyLnJlbW92ZVN0cmVhbSA9IGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgIHZhciBsb2NhbEluZGV4ID0gbG9jYWxTdHJlYW1zLmluZGV4T2Yoc3RyZWFtKTtcblxuICAgIC8vIHJlbW92ZSB0aGUgc3RyZWFtIGZyb20gYW55IGFjdGl2ZSBjYWxsc1xuICAgIGNhbGxzLnZhbHVlcygpLmZvckVhY2goZnVuY3Rpb24oY2FsbCkge1xuICAgICAgY2FsbC5wYy5yZW1vdmVTdHJlYW0oc3RyZWFtKTtcbiAgICB9KTtcblxuICAgIC8vIHJlbW92ZSB0aGUgc3RyZWFtIGZyb20gdGhlIGxvY2FsU3RyZWFtcyBhcnJheVxuICAgIGlmIChsb2NhbEluZGV4ID49IDApIHtcbiAgICAgIGxvY2FsU3RyZWFtcy5zcGxpY2UobG9jYWxJbmRleCwgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNpZ25hbGxlcjtcbiAgfTtcblxuICAvKipcbiAgICAjIyMjIHJlcXVlc3RDaGFubmVsXG5cbiAgICBgYGBcbiAgICByZXF1ZXN0Q2hhbm5lbCh0YXJnZXRJZCwgbGFiZWwsIGNhbGxiYWNrKVxuICAgIGBgYFxuXG4gICAgVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gcmVzcG9uZCB0byByZW1vdGUgcGVlcnMgc3VwcGx5aW5nXG4gICAgYSBkYXRhIGNoYW5uZWwgYXMgcGFydCBvZiB0aGVpciBjb25maWd1cmF0aW9uLiAgQXMgcGVyIHRoZSBgcmVjZWl2ZVN0cmVhbWBcbiAgICBmdW5jdGlvbiB0aGlzIGZ1bmN0aW9uIHdpbGwgZWl0aGVyIGZpcmUgdGhlIGNhbGxiYWNrIGltbWVkaWF0ZWx5IGlmIHRoZVxuICAgIGNoYW5uZWwgaXMgYWxyZWFkeSBhdmFpbGFibGUsIG9yIG9uY2UgdGhlIGNoYW5uZWwgaGFzIGJlZW4gZGlzY292ZXJlZCBvblxuICAgIHRoZSBjYWxsLlxuXG4gICoqL1xuICBzaWduYWxsZXIucmVxdWVzdENoYW5uZWwgPSBmdW5jdGlvbih0YXJnZXRJZCwgbGFiZWwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGNhbGwgPSBnZXRBY3RpdmVDYWxsKHRhcmdldElkKTtcbiAgICB2YXIgY2hhbm5lbCA9IGNhbGwgJiYgY2FsbC5jaGFubmVscy5nZXQobGFiZWwpO1xuXG4gICAgLy8gaWYgd2UgaGF2ZSB0aGVuIGNoYW5uZWwgdHJpZ2dlciB0aGUgY2FsbGJhY2sgaW1tZWRpYXRlbHlcbiAgICBpZiAoY2hhbm5lbCkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgY2hhbm5lbCk7XG4gICAgICByZXR1cm4gc2lnbmFsbGVyO1xuICAgIH1cblxuICAgIC8vIGlmIG5vdCwgd2FpdCBmb3IgaXRcbiAgICBzaWduYWxsZXIub25jZSgnY2hhbm5lbDpvcGVuZWQ6JyArIGxhYmVsLCBmdW5jdGlvbihpZCwgZGMpIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGRjKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzaWduYWxsZXI7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyByZXF1ZXN0U3RyZWFtXG5cbiAgICBgYGBcbiAgICByZXF1ZXN0U3RyZWFtKHRhcmdldElkLCBpZHgsIGNhbGxiYWNrKVxuICAgIGBgYFxuXG4gICAgVXNlZCB0byByZXF1ZXN0IGEgcmVtb3RlIHN0cmVhbSBmcm9tIGEgcXVpY2tjb25uZWN0IGluc3RhbmNlLiBJZiB0aGVcbiAgICBzdHJlYW0gaXMgYWxyZWFkeSBhdmFpbGFibGUgaW4gdGhlIGNhbGxzIHJlbW90ZSBzdHJlYW1zLCB0aGVuIHRoZSBjYWxsYmFja1xuICAgIHdpbGwgYmUgdHJpZ2dlcmVkIGltbWVkaWF0ZWx5LCBvdGhlcndpc2UgdGhpcyBmdW5jdGlvbiB3aWxsIG1vbml0b3JcbiAgICBgc3RyZWFtOmFkZGVkYCBldmVudHMgYW5kIHdhaXQgZm9yIGEgbWF0Y2guXG5cbiAgICBJbiB0aGUgY2FzZSB0aGF0IGFuIHVua25vd24gdGFyZ2V0IGlzIHJlcXVlc3RlZCwgdGhlbiBhbiBleGNlcHRpb24gd2lsbFxuICAgIGJlIHRocm93bi5cbiAgKiovXG4gIHNpZ25hbGxlci5yZXF1ZXN0U3RyZWFtID0gZnVuY3Rpb24odGFyZ2V0SWQsIGlkeCwgY2FsbGJhY2spIHtcbiAgICB2YXIgY2FsbCA9IGdldEFjdGl2ZUNhbGwodGFyZ2V0SWQpO1xuICAgIHZhciBzdHJlYW07XG5cbiAgICBmdW5jdGlvbiB3YWl0Rm9yU3RyZWFtKHBlZXJJZCkge1xuICAgICAgaWYgKHBlZXJJZCAhPT0gdGFyZ2V0SWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgdGhlIHN0cmVhbVxuICAgICAgc3RyZWFtID0gY2FsbC5wYy5nZXRSZW1vdGVTdHJlYW1zKClbaWR4XTtcblxuICAgICAgLy8gaWYgd2UgaGF2ZSB0aGUgc3RyZWFtLCB0aGVuIHJlbW92ZSB0aGUgbGlzdGVuZXIgYW5kIHRyaWdnZXIgdGhlIGNiXG4gICAgICBpZiAoc3RyZWFtKSB7XG4gICAgICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcignc3RyZWFtOmFkZGVkJywgd2FpdEZvclN0cmVhbSk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gbG9vayBmb3IgdGhlIHN0cmVhbSBpbiB0aGUgcmVtb3RlIHN0cmVhbXMgb2YgdGhlIGNhbGxcbiAgICBzdHJlYW0gPSBjYWxsLnBjLmdldFJlbW90ZVN0cmVhbXMoKVtpZHhdO1xuXG4gICAgLy8gaWYgd2UgZm91bmQgdGhlIHN0cmVhbSB0aGVuIHRyaWdnZXIgdGhlIGNhbGxiYWNrXG4gICAgaWYgKHN0cmVhbSkge1xuICAgICAgY2FsbGJhY2sobnVsbCwgc3RyZWFtKTtcbiAgICAgIHJldHVybiBzaWduYWxsZXI7XG4gICAgfVxuXG4gICAgLy8gb3RoZXJ3aXNlIHdhaXQgZm9yIHRoZSBzdHJlYW1cbiAgICBzaWduYWxsZXIub24oJ3N0cmVhbTphZGRlZCcsIHdhaXRGb3JTdHJlYW0pO1xuICAgIHJldHVybiBzaWduYWxsZXI7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyBwcm9maWxlKGRhdGEpXG5cbiAgICBVcGRhdGUgdGhlIHByb2ZpbGUgZGF0YSB3aXRoIHRoZSBhdHRhY2hlZCBpbmZvcm1hdGlvbiwgc28gd2hlblxuICAgIHRoZSBzaWduYWxsZXIgYW5ub3VuY2VzIGl0IGluY2x1ZGVzIHRoaXMgZGF0YSBpbiBhZGRpdGlvbiB0byBhbnlcbiAgICByb29tIGFuZCBpZCBpbmZvcm1hdGlvbi5cblxuICAqKi9cbiAgc2lnbmFsbGVyLnByb2ZpbGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgZXh0ZW5kKHByb2ZpbGUsIGRhdGEpO1xuXG4gICAgLy8gaWYgd2UgaGF2ZSBhbHJlYWR5IGFubm91bmNlZCwgdGhlbiByZWFubm91bmNlIG91ciBwcm9maWxlIHRvIHByb3ZpZGVcbiAgICAvLyBvdGhlcnMgYSBgcGVlcjp1cGRhdGVgIGV2ZW50XG4gICAgaWYgKGFubm91bmNlZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHVwZGF0ZVRpbWVyKTtcbiAgICAgIHVwZGF0ZVRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgc2lnbmFsbGVyLmFubm91bmNlKHByb2ZpbGUpO1xuICAgICAgfSwgKG9wdHMgfHwge30pLnVwZGF0ZURlbGF5IHx8IDEwMDApO1xuICAgIH1cblxuICAgIHJldHVybiBzaWduYWxsZXI7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIyB3YWl0Rm9yQ2FsbFxuXG4gICAgYGBgXG4gICAgd2FpdEZvckNhbGwodGFyZ2V0SWQsIGNhbGxiYWNrKVxuICAgIGBgYFxuXG4gICAgV2FpdCBmb3IgYSBjYWxsIGZyb20gdGhlIHNwZWNpZmllZCB0YXJnZXRJZC4gIElmIHRoZSBjYWxsIGlzIGFscmVhZHlcbiAgICBhY3RpdmUgdGhlIGNhbGxiYWNrIHdpbGwgYmUgZmlyZWQgaW1tZWRpYXRlbHksIG90aGVyd2lzZSB3ZSB3aWxsIHdhaXRcbiAgICBmb3IgYSBgY2FsbDpzdGFydGVkYCBldmVudCB0aGF0IG1hdGNoZXMgdGhlIHJlcXVlc3RlZCBgdGFyZ2V0SWRgXG5cbiAgKiovXG4gIHNpZ25hbGxlci53YWl0Rm9yQ2FsbCA9IGZ1bmN0aW9uKHRhcmdldElkLCBjYWxsYmFjaykge1xuICAgIHZhciBjYWxsID0gY2FsbHMuZ2V0KHRhcmdldElkKTtcblxuICAgIGlmIChjYWxsICYmIGNhbGwuYWN0aXZlKSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBjYWxsLnBjKTtcbiAgICAgIHJldHVybiBzaWduYWxsZXI7XG4gICAgfVxuXG4gICAgc2lnbmFsbGVyLm9uKCdjYWxsOnN0YXJ0ZWQnLCBmdW5jdGlvbiBoYW5kbGVOZXdDYWxsKGlkKSB7XG4gICAgICBpZiAoaWQgPT09IHRhcmdldElkKSB7XG4gICAgICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcignY2FsbDpzdGFydGVkJywgaGFuZGxlTmV3Q2FsbCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIGNhbGxzLmdldChpZCkucGMpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIC8vIGlmIHdlIGhhdmUgYW4gZXhwZWN0ZWQgbnVtYmVyIG9mIGxvY2FsIHN0cmVhbXMsIHRoZW4gdXNlIGEgZmlsdGVyIHRvXG4gIC8vIGNoZWNrIGlmIHdlIHNob3VsZCByZXNwb25kXG4gIGlmIChleHBlY3RlZExvY2FsU3RyZWFtcykge1xuICAgIHNpZ25hbGxlci5vbigncGVlcjpmaWx0ZXInLCBoYW5kbGVQZWVyRmlsdGVyKTtcbiAgfVxuXG4gIC8vIHJlc3BvbmQgdG8gbG9jYWwgYW5ub3VuY2UgbWVzc2FnZXNcbiAgc2lnbmFsbGVyLm9uKCdsb2NhbDphbm5vdW5jZScsIGhhbmRsZUxvY2FsQW5ub3VuY2UpO1xuXG4gIC8vIGhhbmRsZSBwaW5nIG1lc3NhZ2VzXG4gIHNpZ25hbGxlci5vbignbWVzc2FnZTpwaW5nJywgaGFuZGxlUGluZyk7XG5cbiAgLy8gdXNlIGdlbmljZSB0byBmaW5kIG91ciBpY2VTZXJ2ZXJzXG4gIHJlcXVpcmUoJ3J0Yy1jb3JlL2dlbmljZScpKG9wdHMsIGZ1bmN0aW9uKGVyciwgc2VydmVycykge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHJldHVybiBjb25zb2xlLmVycm9yKCdjb3VsZCBub3QgZmluZCBpY2VTZXJ2ZXJzOiAnLCBlcnIpO1xuICAgIH1cblxuICAgIGljZVNlcnZlcnMgPSBzZXJ2ZXJzO1xuICAgIGNoZWNrUmVhZHlUb0Fubm91bmNlKCk7XG4gIH0pO1xuXG4gIC8vIGlmIHdlIHBsdWdpbiBpcyBhY3RpdmUsIHRoZW4gaW5pdGlhbGl6ZSBpdFxuICBpZiAocGx1Z2luKSB7XG4gICAgaW5pdFBsdWdpbigpO1xuICB9XG5cbiAgLy8gcGFzcyB0aGUgc2lnbmFsbGVyIG9uXG4gIHJldHVybiBzaWduYWxsZXI7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtZXNzZW5nZXIpIHtcbiAgaWYgKHR5cGVvZiBtZXNzZW5nZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBtZXNzZW5nZXI7XG4gIH1cblxuICByZXR1cm4gcmVxdWlyZSgncnRjLXN3aXRjaGJvYXJkLW1lc3NlbmdlcicpKG1lc3Nlbmdlcik7XG59O1xuIiwidmFyIGNyZWF0ZVRyaWUgPSByZXF1aXJlKCdhcnJheS10cmllJyk7XG52YXIgcmVEZWxpbSA9IC9bXFwuXFw6XS87XG5cbi8qKlxuICAjIG1idXNcblxuICBJZiBOb2RlJ3MgRXZlbnRFbWl0dGVyIGFuZCBFdmUgd2VyZSB0byBoYXZlIGEgY2hpbGQsIGl0IG1pZ2h0IGxvb2sgc29tZXRoaW5nIGxpa2UgdGhpcy5cbiAgTm8gd2lsZGNhcmQgc3VwcG9ydCBhdCB0aGlzIHN0YWdlIHRob3VnaC4uLlxuXG4gICMjIEV4YW1wbGUgVXNhZ2VcblxuICA8PDwgZG9jcy91c2FnZS5tZFxuXG4gICMjIFJlZmVyZW5jZVxuXG4gICMjIyBgbWJ1cyhuYW1lc3BhY2U/LCBwYXJlbnQ/LCBzY29wZT8pYFxuXG4gIENyZWF0ZSBhIG5ldyBtZXNzYWdlIGJ1cyB3aXRoIGBuYW1lc3BhY2VgIGluaGVyaXRpbmcgZnJvbSB0aGUgYHBhcmVudGBcbiAgbWJ1cyBpbnN0YW5jZS4gIElmIGV2ZW50cyBmcm9tIHRoaXMgbWVzc2FnZSBidXMgc2hvdWxkIGJlIHRyaWdnZXJlZCB3aXRoXG4gIGEgc3BlY2lmaWMgYHRoaXNgIHNjb3BlLCB0aGVuIHNwZWNpZnkgaXQgdXNpbmcgdGhlIGBzY29wZWAgYXJndW1lbnQuXG5cbioqL1xuXG52YXIgY3JlYXRlQnVzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lc3BhY2UsIHBhcmVudCwgc2NvcGUpIHtcbiAgdmFyIHJlZ2lzdHJ5ID0gY3JlYXRlVHJpZSgpO1xuICB2YXIgZmVlZHMgPSBbXTtcblxuICBmdW5jdGlvbiBidXMobmFtZSkge1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBwYXJ0cyA9IGdldE5hbWVQYXJ0cyhuYW1lKTtcbiAgICB2YXIgZGVsaW1pdGVkID0gcGFydHMuam9pbignLicpO1xuICAgIHZhciBoYW5kbGVycyA9IHJlZ2lzdHJ5LmdldChwYXJ0cykgfHwgW107XG4gICAgdmFyIHJlc3VsdHM7XG5cbiAgICAvLyBzZW5kIHRocm91Z2ggdGhlIGZlZWRzXG4gICAgZmVlZHMuZm9yRWFjaChmdW5jdGlvbihmZWVkKSB7XG4gICAgICBmZWVkKHsgbmFtZTogZGVsaW1pdGVkLCBhcmdzOiBhcmdzIH0pO1xuICAgIH0pO1xuXG4gICAgLy8gcnVuIHRoZSByZWdpc3RlcmVkIGhhbmRsZXJzXG4gICAgcmVzdWx0cyA9IFtdLmNvbmNhdChoYW5kbGVycykubWFwKGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBoYW5kbGVyLmFwcGx5KHNjb3BlIHx8IHRoaXMsIGFyZ3MpO1xuICAgIH0pO1xuXG4gICAgLy8gcnVuIHRoZSBwYXJlbnQgaGFuZGxlcnNcbiAgICBpZiAoYnVzLnBhcmVudCkge1xuICAgICAgcmVzdWx0cyA9IHJlc3VsdHMuY29uY2F0KFxuICAgICAgICBidXMucGFyZW50LmFwcGx5KHNjb3BlIHx8IHRoaXMsIFtuYW1lc3BhY2UuY29uY2F0KHBhcnRzKV0uY29uY2F0KGFyZ3MpKVxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKlxuICAgICMjIyBgbWJ1cyNjbGVhcigpYFxuXG4gICAgUmVzZXQgdGhlIGhhbmRsZXIgcmVnaXN0cnksIHdoaWNoIGVzc2VudGlhbCBkZXJlZ2lzdGVycyBhbGwgZXZlbnQgbGlzdGVuZXJzLlxuXG4gICAgX0FsaWFzOl8gYHJlbW92ZUFsbExpc3RlbmVyc2BcbiAgKiovXG4gIGZ1bmN0aW9uIGNsZWFyKG5hbWUpIHtcbiAgICAvLyBpZiB3ZSBoYXZlIGEgbmFtZSwgcmVzZXQgaGFuZGxlcnMgZm9yIHRoYXQgaGFuZGxlclxuICAgIGlmIChuYW1lKSB7XG4gICAgICByZWdpc3RyeS5zZXQoZ2V0TmFtZVBhcnRzKG5hbWUpLCBbXSk7XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSwgcmVzZXQgdGhlIGVudGlyZSBoYW5kbGVyIHJlZ2lzdHJ5XG4gICAgZWxzZSB7XG4gICAgICByZWdpc3RyeSA9IGNyZWF0ZVRyaWUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICAjIyMgYG1idXMjZmVlZChoYW5kbGVyKWBcblxuICAgIEF0dGFjaCBhIGhhbmRsZXIgZnVuY3Rpb24gdGhhdCB3aWxsIHNlZSBhbGwgZXZlbnRzIHRoYXQgYXJlIHNlbnQgdGhyb3VnaFxuICAgIHRoaXMgYnVzIGluIGFuIFwib2JqZWN0IHN0cmVhbVwiIGZvcm1hdCB0aGF0IG1hdGNoZXMgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XG5cbiAgICBgYGBcbiAgICB7IG5hbWU6ICdldmVudC5uYW1lJywgYXJnczogWyAnZXZlbnQnLCAnYXJncycgXSB9XG4gICAgYGBgXG5cbiAgICBUaGUgZmVlZCBmdW5jdGlvbiByZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgY2FsbGVkIHRvIHN0b3AgdGhlIGZlZWRcbiAgICBzZW5kaW5nIGRhdGEuXG5cbiAgKiovXG4gIGZ1bmN0aW9uIGZlZWQoaGFuZGxlcikge1xuICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICBmZWVkcy5zcGxpY2UoZmVlZHMuaW5kZXhPZihoYW5kbGVyKSwgMSk7XG4gICAgfVxuXG4gICAgZmVlZHMucHVzaChoYW5kbGVyKTtcbiAgICByZXR1cm4gc3RvcDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE5hbWVQYXJ0cyhuYW1lKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkobmFtZSkgPyBuYW1lIDogKG5hbWUgPyBuYW1lLnNwbGl0KHJlRGVsaW0pIDogW10pO1xuICB9XG5cbiAgLyoqXG4gICAgIyMjIGBtYnVzI29mZihuYW1lLCBoYW5kbGVyKWBcblxuICAgIERlcmVnaXN0ZXIgYW4gZXZlbnQgaGFuZGxlci5cbiAgKiovXG4gIGZ1bmN0aW9uIG9mZihuYW1lLCBoYW5kbGVyKSB7XG4gICAgdmFyIGhhbmRsZXJzID0gcmVnaXN0cnkuZ2V0KGdldE5hbWVQYXJ0cyhuYW1lKSk7XG4gICAgdmFyIGlkeCA9IGhhbmRsZXJzID8gaGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKSA6IC0xO1xuXG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICBoYW5kbGVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICAjIyMgYG1idXMjb24obmFtZSwgaGFuZGxlcilgXG5cbiAgICBSZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgZXZlbnQgYG5hbWVgLlxuXG4gICoqL1xuICBmdW5jdGlvbiBvbihuYW1lLCBoYW5kbGVyKSB7XG4gICAgdmFyIHBhcnRzID0gZ2V0TmFtZVBhcnRzKG5hbWUpO1xuICAgIHZhciBoYW5kbGVycyA9IHJlZ2lzdHJ5LmdldChwYXJ0cyk7XG5cbiAgICBpZiAoaGFuZGxlcnMpIHtcbiAgICAgIGhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVnaXN0cnkuc2V0KHBhcnRzLCBbIGhhbmRsZXIgXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1cztcbiAgfVxuXG5cbiAgLyoqXG4gICAgIyMjIGBtYnVzI29uY2UobmFtZSwgaGFuZGxlcilgXG5cbiAgICBSZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGZvciB0aGUgZXZlbnQgYG5hbWVgIHRoYXQgd2lsbCBvbmx5XG4gICAgdHJpZ2dlciBvbmNlIChpLmUuIHRoZSBoYW5kbGVyIHdpbGwgYmUgZGVyZWdpc3RlcmVkIGltbWVkaWF0ZWx5IGFmdGVyXG4gICAgYmVpbmcgdHJpZ2dlcmVkIHRoZSBmaXJzdCB0aW1lKS5cblxuICAqKi9cbiAgZnVuY3Rpb24gb25jZShuYW1lLCBoYW5kbGVyKSB7XG4gICAgcmV0dXJuIG9uKG5hbWUsIGZ1bmN0aW9uIGhhbmRsZUV2ZW50KCkge1xuICAgICAgdmFyIHJlc3VsdCA9IGhhbmRsZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGJ1cy5vZmYobmFtZSwgaGFuZGxlRXZlbnQpO1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBuYW1lc3BhY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgIHBhcmVudCA9IG5hbWVzcGFjZTtcbiAgICBuYW1lc3BhY2UgPSAnJztcbiAgfVxuXG4gIG5hbWVzcGFjZSA9IChuYW1lc3BhY2UgJiYgbmFtZXNwYWNlLnNwbGl0KHJlRGVsaW0pKSB8fCBbXTtcblxuICBidXMuY2xlYXIgPSBidXMucmVtb3ZlQWxsTGlzdGVuZXJzID0gY2xlYXI7XG4gIGJ1cy5mZWVkID0gZmVlZDtcbiAgYnVzLm9uID0gYnVzLmFkZExpc3RlbmVyID0gb247XG4gIGJ1cy5vbmNlID0gb25jZTtcbiAgYnVzLm9mZiA9IGJ1cy5yZW1vdmVMaXN0ZW5lciA9IG9mZjtcbiAgYnVzLnBhcmVudCA9IHBhcmVudCB8fCAobmFtZXNwYWNlICYmIG5hbWVzcGFjZS5sZW5ndGggPiAwICYmIGNyZWF0ZUJ1cygpKTtcblxuICByZXR1cm4gYnVzO1xufTtcbiIsIlwidXNlIHN0cmljdFwiXG5cbmZ1bmN0aW9uIGNvbXBpbGVTZWFyY2goZnVuY05hbWUsIHByZWRpY2F0ZSwgcmV2ZXJzZWQsIGV4dHJhQXJncywgdXNlTmRhcnJheSwgZWFybHlPdXQpIHtcbiAgdmFyIGNvZGUgPSBbXG4gICAgXCJmdW5jdGlvbiBcIiwgZnVuY05hbWUsIFwiKGEsbCxoLFwiLCBleHRyYUFyZ3Muam9pbihcIixcIiksICBcIil7XCIsXG5lYXJseU91dCA/IFwiXCIgOiBcInZhciBpPVwiLCAocmV2ZXJzZWQgPyBcImwtMVwiIDogXCJoKzFcIiksXG5cIjt3aGlsZShsPD1oKXtcXFxudmFyIG09KGwraCk+Pj4xLHg9YVwiLCB1c2VOZGFycmF5ID8gXCIuZ2V0KG0pXCIgOiBcIlttXVwiXVxuICBpZihlYXJseU91dCkge1xuICAgIGlmKHByZWRpY2F0ZS5pbmRleE9mKFwiY1wiKSA8IDApIHtcbiAgICAgIGNvZGUucHVzaChcIjtpZih4PT09eSl7cmV0dXJuIG19ZWxzZSBpZih4PD15KXtcIilcbiAgICB9IGVsc2Uge1xuICAgICAgY29kZS5wdXNoKFwiO3ZhciBwPWMoeCx5KTtpZihwPT09MCl7cmV0dXJuIG19ZWxzZSBpZihwPD0wKXtcIilcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29kZS5wdXNoKFwiO2lmKFwiLCBwcmVkaWNhdGUsIFwiKXtpPW07XCIpXG4gIH1cbiAgaWYocmV2ZXJzZWQpIHtcbiAgICBjb2RlLnB1c2goXCJsPW0rMX1lbHNle2g9bS0xfVwiKVxuICB9IGVsc2Uge1xuICAgIGNvZGUucHVzaChcImg9bS0xfWVsc2V7bD1tKzF9XCIpXG4gIH1cbiAgY29kZS5wdXNoKFwifVwiKVxuICBpZihlYXJseU91dCkge1xuICAgIGNvZGUucHVzaChcInJldHVybiAtMX07XCIpXG4gIH0gZWxzZSB7XG4gICAgY29kZS5wdXNoKFwicmV0dXJuIGl9O1wiKVxuICB9XG4gIHJldHVybiBjb2RlLmpvaW4oXCJcIilcbn1cblxuZnVuY3Rpb24gY29tcGlsZUJvdW5kc1NlYXJjaChwcmVkaWNhdGUsIHJldmVyc2VkLCBzdWZmaXgsIGVhcmx5T3V0KSB7XG4gIHZhciByZXN1bHQgPSBuZXcgRnVuY3Rpb24oW1xuICBjb21waWxlU2VhcmNoKFwiQVwiLCBcInhcIiArIHByZWRpY2F0ZSArIFwieVwiLCByZXZlcnNlZCwgW1wieVwiXSwgZmFsc2UsIGVhcmx5T3V0KSxcbiAgY29tcGlsZVNlYXJjaChcIkJcIiwgXCJ4XCIgKyBwcmVkaWNhdGUgKyBcInlcIiwgcmV2ZXJzZWQsIFtcInlcIl0sIHRydWUsIGVhcmx5T3V0KSxcbiAgY29tcGlsZVNlYXJjaChcIlBcIiwgXCJjKHgseSlcIiArIHByZWRpY2F0ZSArIFwiMFwiLCByZXZlcnNlZCwgW1wieVwiLCBcImNcIl0sIGZhbHNlLCBlYXJseU91dCksXG4gIGNvbXBpbGVTZWFyY2goXCJRXCIsIFwiYyh4LHkpXCIgKyBwcmVkaWNhdGUgKyBcIjBcIiwgcmV2ZXJzZWQsIFtcInlcIiwgXCJjXCJdLCB0cnVlLCBlYXJseU91dCksXG5cImZ1bmN0aW9uIGRpc3BhdGNoQnNlYXJjaFwiLCBzdWZmaXgsIFwiKGEseSxjLGwsaCl7XFxcbmlmKGEuc2hhcGUpe1xcXG5pZih0eXBlb2YoYyk9PT0nZnVuY3Rpb24nKXtcXFxucmV0dXJuIFEoYSwobD09PXVuZGVmaW5lZCk/MDpsfDAsKGg9PT11bmRlZmluZWQpP2Euc2hhcGVbMF0tMTpofDAseSxjKVxcXG59ZWxzZXtcXFxucmV0dXJuIEIoYSwoYz09PXVuZGVmaW5lZCk/MDpjfDAsKGw9PT11bmRlZmluZWQpP2Euc2hhcGVbMF0tMTpsfDAseSlcXFxufX1lbHNle1xcXG5pZih0eXBlb2YoYyk9PT0nZnVuY3Rpb24nKXtcXFxucmV0dXJuIFAoYSwobD09PXVuZGVmaW5lZCk/MDpsfDAsKGg9PT11bmRlZmluZWQpP2EubGVuZ3RoLTE6aHwwLHksYylcXFxufWVsc2V7XFxcbnJldHVybiBBKGEsKGM9PT11bmRlZmluZWQpPzA6Y3wwLChsPT09dW5kZWZpbmVkKT9hLmxlbmd0aC0xOmx8MCx5KVxcXG59fX1cXFxucmV0dXJuIGRpc3BhdGNoQnNlYXJjaFwiLCBzdWZmaXhdLmpvaW4oXCJcIikpXG4gIHJldHVybiByZXN1bHQoKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2U6IGNvbXBpbGVCb3VuZHNTZWFyY2goXCI+PVwiLCBmYWxzZSwgXCJHRVwiKSxcbiAgZ3Q6IGNvbXBpbGVCb3VuZHNTZWFyY2goXCI+XCIsIGZhbHNlLCBcIkdUXCIpLFxuICBsdDogY29tcGlsZUJvdW5kc1NlYXJjaChcIjxcIiwgdHJ1ZSwgXCJMVFwiKSxcbiAgbGU6IGNvbXBpbGVCb3VuZHNTZWFyY2goXCI8PVwiLCB0cnVlLCBcIkxFXCIpLFxuICBlcTogY29tcGlsZUJvdW5kc1NlYXJjaChcIi1cIiwgdHJ1ZSwgXCJFUVwiLCB0cnVlKVxufVxuIiwiXCJ1c2Ugc3RyaWN0XCJcblxudmFyIGJvdW5kcyA9IHJlcXVpcmUoXCJiaW5hcnktc2VhcmNoLWJvdW5kc1wiKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVRyaWVcblxuZnVuY3Rpb24gVHJpZShzeW1ib2xzLCBjaGlsZHJlbiwgdmFsdWUpIHtcbiAgdGhpcy5zeW1ib2xzID0gc3ltYm9sc1xuICB0aGlzLmNoaWxkcmVuID0gY2hpbGRyZW5cbiAgdGhpcy52YWx1ZSA9IHZhbHVlXG59XG5cbnZhciBwcm90byA9IFRyaWUucHJvdG90eXBlXG5cbnByb3RvLnNldCA9IGZ1bmN0aW9uKHMsIHZhbHVlKSB7XG4gIGlmKHMuc2hhcGUpIHtcbiAgICB2YXIgdiA9IHRoaXNcbiAgICB2YXIgbiA9IHMuc2hhcGVbMF1cbiAgICBmb3IodmFyIGk9MDsgaTxuOyArK2kpIHtcbiAgICAgIHZhciBjID0gcy5nZXQoaSlcbiAgICAgIHZhciBqID0gYm91bmRzLmdlKHYuc3ltYm9scywgYylcbiAgICAgIGlmKGogPCB2LnN5bWJvbHMubGVuZ3RoICYmIHYuc3ltYm9sc1tqXSA9PT0gYykge1xuICAgICAgICB2ID0gdi5jaGlsZHJlbltqXVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGwgPSBuZXcgVHJpZShbXSwgW10sIHZhbHVlKVxuICAgICAgICBmb3IodmFyIGs9bi0xOyBrPmk7IC0taykge1xuICAgICAgICAgIGwgPSBuZXcgVHJpZShbcy5nZXQoayldLCBbbF0pXG4gICAgICAgIH1cbiAgICAgICAgdi5zeW1ib2xzLnNwbGljZShqLCAwLCBjKVxuICAgICAgICB2LmNoaWxkcmVuLnNwbGljZShqLCAwLCBsKVxuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHYudmFsdWUgPSB2YWx1ZVxuICB9IGVsc2Uge1xuICAgIHZhciB2ID0gdGhpc1xuICAgIHZhciBuID0gcy5sZW5ndGhcbiAgICBmb3IodmFyIGk9MDsgaTxuOyArK2kpIHtcbiAgICAgIHZhciBjID0gc1tpXVxuICAgICAgdmFyIGogPSBib3VuZHMuZ2Uodi5zeW1ib2xzLCBjKVxuICAgICAgaWYoaiA8IHYuc3ltYm9scy5sZW5ndGggJiYgdi5zeW1ib2xzW2pdID09PSBjKSB7XG4gICAgICAgIHYgPSB2LmNoaWxkcmVuW2pdXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbCA9IG5ldyBUcmllKFtdLCBbXSwgdmFsdWUpXG4gICAgICAgIGZvcih2YXIgaz1uLTE7IGs+aTsgLS1rKSB7XG4gICAgICAgICAgbCA9IG5ldyBUcmllKFtzW2tdXSwgW2xdKVxuICAgICAgICB9XG4gICAgICAgIHYuc3ltYm9scy5zcGxpY2UoaiwgMCwgYylcbiAgICAgICAgdi5jaGlsZHJlbi5zcGxpY2UoaiwgMCwgbClcbiAgICAgICAgcmV0dXJuIHZhbHVlXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2LnZhbHVlID0gdmFsdWVcbiAgfVxufVxuXG5wcm90by5nZXQgPSBmdW5jdGlvbihzKSB7XG4gIGlmKHMuc2hhcGUpIHtcbiAgICB2YXIgdiA9IHRoaXNcbiAgICB2YXIgbiA9IHMuc2hhcGVbMF1cbiAgICBmb3IodmFyIGk9MDsgaTxuOyArK2kpIHtcbiAgICAgIHZhciBjID0gcy5nZXQoaSlcbiAgICAgIHZhciBqID0gYm91bmRzLmVxKHYuc3ltYm9scywgYylcbiAgICAgIGlmKGogPCAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdiA9IHYuY2hpbGRyZW5bal1cbiAgICB9XG4gICAgcmV0dXJuIHYudmFsdWVcbiAgfSBlbHNlIHtcbiAgICB2YXIgdiA9IHRoaXNcbiAgICB2YXIgbiA9IHMubGVuZ3RoXG4gICAgZm9yKHZhciBpPTA7IGk8bjsgKytpKSB7XG4gICAgICB2YXIgYyA9IHNbaV1cbiAgICAgIHZhciBqID0gYm91bmRzLmVxKHYuc3ltYm9scywgYylcbiAgICAgIGlmKGogPCAwKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdiA9IHYuY2hpbGRyZW5bal1cbiAgICB9XG4gICAgcmV0dXJuIHYudmFsdWVcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVUcmllKCkge1xuICByZXR1cm4gbmV3IFRyaWUoW10sW10pXG59IiwidmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2NvZy9leHRlbmQnKTtcblxuLyoqXG4gICMgcnRjLXN3aXRjaGJvYXJkLW1lc3NlbmdlclxuXG4gIEEgc3BlY2lhbGlzZWQgdmVyc2lvbiBvZlxuICBbYG1lc3Nlbmdlci13c2BdKGh0dHBzOi8vZ2l0aHViLmNvbS9EYW1vbk9laGxtYW4vbWVzc2VuZ2VyLXdzKSBkZXNpZ25lZCB0b1xuICBjb25uZWN0IHRvIFtgcnRjLXN3aXRjaGJvYXJkYF0oaHR0cDovL2dpdGh1Yi5jb20vcnRjLWlvL3J0Yy1zd2l0Y2hib2FyZClcbiAgaW5zdGFuY2VzLlxuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3dpdGNoYm9hcmQsIG9wdHMpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJ21lc3Nlbmdlci13cycpKHN3aXRjaGJvYXJkLCBleHRlbmQoe1xuICAgIGVuZHBvaW50czogWycvcHJpbXVzJywgJy8nXVxuICB9LCBvcHRzKSk7XG59O1xuIiwidmFyIFdlYlNvY2tldCA9IHJlcXVpcmUoJ3dzJyk7XG52YXIgd3N1cmwgPSByZXF1aXJlKCd3c3VybCcpO1xudmFyIHBzID0gcmVxdWlyZSgncHVsbC13cycpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnY29nL2RlZmF1bHRzJyk7XG52YXIgcmVUcmFpbGluZ1NsYXNoID0gL1xcLyQvO1xuXG4vKipcbiAgIyBtZXNzZW5nZXItd3NcblxuICBUaGlzIGlzIGEgc2ltcGxlIG1lc3NhZ2luZyBpbXBsZW1lbnRhdGlvbiBmb3Igc2VuZGluZyBhbmQgcmVjZWl2aW5nIGRhdGFcbiAgdmlhIHdlYnNvY2tldHMuXG5cbiAgRm9sbG93cyB0aGUgW21lc3Nlbmdlci1hcmNoZXR5cGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9EYW1vbk9laGxtYW4vbWVzc2VuZ2VyLWFyY2hldHlwZSlcblxuICAjIyBFeGFtcGxlIFVzYWdlXG5cbiAgPDw8IGV4YW1wbGVzL3NpbXBsZS5qc1xuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odXJsLCBvcHRzKSB7XG4gIHZhciB0aW1lb3V0ID0gKG9wdHMgfHwge30pLnRpbWVvdXQgfHwgMTAwMDtcbiAgdmFyIGVuZHBvaW50cyA9ICgob3B0cyB8fCB7fSkuZW5kcG9pbnRzIHx8IFsnLyddKS5tYXAoZnVuY3Rpb24oZW5kcG9pbnQpIHtcbiAgICByZXR1cm4gdXJsLnJlcGxhY2UocmVUcmFpbGluZ1NsYXNoLCAnJykgKyBlbmRwb2ludDtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gY29ubmVjdChjYWxsYmFjaykge1xuICAgIHZhciBxdWV1ZSA9IFtdLmNvbmNhdChlbmRwb2ludHMpO1xuICAgIHZhciByZWNlaXZlZERhdGEgPSBmYWxzZTtcbiAgICB2YXIgZmFpbFRpbWVyO1xuICAgIHZhciBzdWNjZXNzVGltZXI7XG5cbiAgICBmdW5jdGlvbiBhdHRlbXB0TmV4dCgpIHtcbiAgICAgIHZhciBzb2NrZXQ7XG5cbiAgICAgIGZ1bmN0aW9uIHJlZ2lzdGVyTWVzc2FnZShldnQpIHtcbiAgICAgICAgcmVjZWl2ZWREYXRhID0gdHJ1ZTtcbiAgICAgICAgKHNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyIHx8IHNvY2tldC5yZW1vdmVMaXN0ZW5lcikoJ21lc3NhZ2UnLCByZWdpc3Rlck1lc3NhZ2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB3ZSBoYXZlIG5vIG1vcmUgdmFsaWQgZW5kcG9pbnRzLCB0aGVuIGVyb3JyIG91dFxuICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sobmV3IEVycm9yKCdVbmFibGUgdG8gY29ubmVjdCB0byB1cmw6ICcgKyB1cmwpKTtcbiAgICAgIH1cblxuICAgICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldCh3c3VybChxdWV1ZS5zaGlmdCgpKSk7XG4gICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBoYW5kbGVFcnJvcik7XG4gICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBoYW5kbGVBYm5vcm1hbENsb3NlKTtcbiAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdvcGVuJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIGNyZWF0ZSB0aGUgc291cmNlIGltbWVkaWF0ZWx5IHRvIGJ1ZmZlciBhbnkgZGF0YVxuICAgICAgICB2YXIgc291cmNlID0gcHMuc291cmNlKHNvY2tldCwgb3B0cyk7XG5cbiAgICAgICAgLy8gbW9uaXRvciBkYXRhIGZsb3dpbmcgZnJvbSB0aGUgc29ja2V0XG4gICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgcmVnaXN0ZXJNZXNzYWdlKTtcblxuICAgICAgICBzdWNjZXNzVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChmYWlsVGltZXIpO1xuICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHNvdXJjZSwgcHMuc2luayhzb2NrZXQsIG9wdHMpKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICAgIH0pO1xuXG4gICAgICBmYWlsVGltZXIgPSBzZXRUaW1lb3V0KGF0dGVtcHROZXh0LCB0aW1lb3V0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVBYm5vcm1hbENsb3NlKGV2dCkge1xuICAgICAgLy8gaWYgdGhpcyB3YXMgYSBjbGVhbiBjbG9zZSBkbyBub3RoaW5nXG4gICAgICBpZiAoZXZ0Lndhc0NsZWFuICYmIHJlY2VpdmVkRGF0YSAmJiBxdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gaGFuZGxlRXJyb3IoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcigpIHtcbiAgICAgIGNsZWFyVGltZW91dChzdWNjZXNzVGltZXIpO1xuICAgICAgY2xlYXJUaW1lb3V0KGZhaWxUaW1lcik7XG4gICAgICBhdHRlbXB0TmV4dCgpO1xuICAgIH1cblxuICAgIGF0dGVtcHROZXh0KCk7XG4gIH1cblxuICByZXR1cm4gY29ubmVjdDtcbn07XG4iLCJleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBkdXBsZXg7XG5cbmV4cG9ydHMuc291cmNlID0gcmVxdWlyZSgnLi9zb3VyY2UnKTtcbmV4cG9ydHMuc2luayA9IHJlcXVpcmUoJy4vc2luaycpO1xuXG5mdW5jdGlvbiBkdXBsZXggKHdzLCBvcHRzKSB7XG4gIHJldHVybiB7XG4gICAgc291cmNlOiBleHBvcnRzLnNvdXJjZSh3cyksXG4gICAgc2luazogZXhwb3J0cy5zaW5rKHdzLCBvcHRzKVxuICB9O1xufTtcbiIsImV4cG9ydHMuaWQgPSBcbmZ1bmN0aW9uIChpdGVtKSB7XG4gIHJldHVybiBpdGVtXG59XG5cbmV4cG9ydHMucHJvcCA9IFxuZnVuY3Rpb24gKG1hcCkgeyAgXG4gIGlmKCdzdHJpbmcnID09IHR5cGVvZiBtYXApIHtcbiAgICB2YXIga2V5ID0gbWFwXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkYXRhKSB7IHJldHVybiBkYXRhW2tleV0gfVxuICB9XG4gIHJldHVybiBtYXBcbn1cblxuZXhwb3J0cy50ZXN0ZXIgPSBmdW5jdGlvbiAodGVzdCkge1xuICBpZighdGVzdCkgcmV0dXJuIGV4cG9ydHMuaWRcbiAgaWYoJ29iamVjdCcgPT09IHR5cGVvZiB0ZXN0XG4gICAgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIHRlc3QudGVzdClcbiAgICAgIHJldHVybiB0ZXN0LnRlc3QuYmluZCh0ZXN0KVxuICByZXR1cm4gZXhwb3J0cy5wcm9wKHRlc3QpIHx8IGV4cG9ydHMuaWRcbn1cblxuZXhwb3J0cy5hZGRQaXBlID0gYWRkUGlwZVxuXG5mdW5jdGlvbiBhZGRQaXBlKHJlYWQpIHtcbiAgaWYoJ2Z1bmN0aW9uJyAhPT0gdHlwZW9mIHJlYWQpXG4gICAgcmV0dXJuIHJlYWRcblxuICByZWFkLnBpcGUgPSByZWFkLnBpcGUgfHwgZnVuY3Rpb24gKHJlYWRlcikge1xuICAgIGlmKCdmdW5jdGlvbicgIT0gdHlwZW9mIHJlYWRlciAmJiAnZnVuY3Rpb24nICE9IHR5cGVvZiByZWFkZXIuc2luaylcbiAgICAgIHRocm93IG5ldyBFcnJvcignbXVzdCBwaXBlIHRvIHJlYWRlcicpXG4gICAgdmFyIHBpcGUgPSBhZGRQaXBlKHJlYWRlci5zaW5rID8gcmVhZGVyLnNpbmsocmVhZCkgOiByZWFkZXIocmVhZCkpXG4gICAgcmV0dXJuIHJlYWRlci5zb3VyY2UgfHwgcGlwZTtcbiAgfVxuICBcbiAgcmVhZC50eXBlID0gJ1NvdXJjZSdcbiAgcmV0dXJuIHJlYWRcbn1cblxudmFyIFNvdXJjZSA9XG5leHBvcnRzLlNvdXJjZSA9XG5mdW5jdGlvbiBTb3VyY2UgKGNyZWF0ZVJlYWQpIHtcbiAgZnVuY3Rpb24gcygpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIHJldHVybiBhZGRQaXBlKGNyZWF0ZVJlYWQuYXBwbHkobnVsbCwgYXJncykpXG4gIH1cbiAgcy50eXBlID0gJ1NvdXJjZSdcbiAgcmV0dXJuIHNcbn1cblxuXG52YXIgVGhyb3VnaCA9XG5leHBvcnRzLlRocm91Z2ggPSBcbmZ1bmN0aW9uIChjcmVhdGVSZWFkKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICB2YXIgcGlwZWQgPSBbXVxuICAgIGZ1bmN0aW9uIHJlYWRlciAocmVhZCkge1xuICAgICAgYXJncy51bnNoaWZ0KHJlYWQpXG4gICAgICByZWFkID0gY3JlYXRlUmVhZC5hcHBseShudWxsLCBhcmdzKVxuICAgICAgd2hpbGUocGlwZWQubGVuZ3RoKVxuICAgICAgICByZWFkID0gcGlwZWQuc2hpZnQoKShyZWFkKVxuICAgICAgcmV0dXJuIHJlYWRcbiAgICAgIC8vcGlwZWluZyB0byBmcm9tIHRoaXMgcmVhZGVyIHNob3VsZCBjb21wb3NlLi4uXG4gICAgfVxuICAgIHJlYWRlci5waXBlID0gZnVuY3Rpb24gKHJlYWQpIHtcbiAgICAgIHBpcGVkLnB1c2gocmVhZCkgXG4gICAgICBpZihyZWFkLnR5cGUgPT09ICdTb3VyY2UnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBwaXBlICcgKyByZWFkZXIudHlwZSArICcgdG8gU291cmNlJylcbiAgICAgIHJlYWRlci50eXBlID0gcmVhZC50eXBlID09PSAnU2luaycgPyAnU2luaycgOiAnVGhyb3VnaCdcbiAgICAgIHJldHVybiByZWFkZXJcbiAgICB9XG4gICAgcmVhZGVyLnR5cGUgPSAnVGhyb3VnaCdcbiAgICByZXR1cm4gcmVhZGVyXG4gIH1cbn1cblxudmFyIFNpbmsgPVxuZXhwb3J0cy5TaW5rID0gXG5mdW5jdGlvbiBTaW5rKGNyZWF0ZVJlYWRlcikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgaWYoIWNyZWF0ZVJlYWRlcilcbiAgICAgIHRocm93IG5ldyBFcnJvcignbXVzdCBiZSBjcmVhdGVSZWFkZXIgZnVuY3Rpb24nKVxuICAgIGZ1bmN0aW9uIHMgKHJlYWQpIHtcbiAgICAgIGFyZ3MudW5zaGlmdChyZWFkKVxuICAgICAgcmV0dXJuIGNyZWF0ZVJlYWRlci5hcHBseShudWxsLCBhcmdzKVxuICAgIH1cbiAgICBzLnR5cGUgPSAnU2luaydcbiAgICByZXR1cm4gc1xuICB9XG59XG5cblxuZXhwb3J0cy5tYXliZVNpbmsgPSBcbmV4cG9ydHMubWF5YmVEcmFpbiA9IFxuZnVuY3Rpb24gKGNyZWF0ZVNpbmssIGNiKSB7XG4gIGlmKCFjYilcbiAgICByZXR1cm4gVGhyb3VnaChmdW5jdGlvbiAocmVhZCkge1xuICAgICAgdmFyIGVuZGVkXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKGNsb3NlLCBjYikge1xuICAgICAgICBpZihjbG9zZSkgcmV0dXJuIHJlYWQoY2xvc2UsIGNiKVxuICAgICAgICBpZihlbmRlZCkgcmV0dXJuIGNiKGVuZGVkKVxuXG4gICAgICAgIGNyZWF0ZVNpbmsoZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgICAgIGVuZGVkID0gZXJyIHx8IHRydWVcbiAgICAgICAgICBpZighZXJyKSBjYihudWxsLCBkYXRhKVxuICAgICAgICAgIGVsc2UgICAgIGNiKGVuZGVkKVxuICAgICAgICB9KSAocmVhZClcbiAgICAgIH1cbiAgICB9KSgpXG5cbiAgcmV0dXJuIFNpbmsoZnVuY3Rpb24gKHJlYWQpIHtcbiAgICByZXR1cm4gY3JlYXRlU2luayhjYikgKHJlYWQpXG4gIH0pKClcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzb2NrZXQsIGNhbGxiYWNrKSB7XG4gIHZhciByZW1vdmUgPSBzb2NrZXQgJiYgKHNvY2tldC5yZW1vdmVFdmVudExpc3RlbmVyIHx8IHNvY2tldC5yZW1vdmVMaXN0ZW5lcik7XG5cbiAgZnVuY3Rpb24gY2xlYW51cCAoKSB7XG4gICAgaWYgKHR5cGVvZiByZW1vdmUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmVtb3ZlLmNhbGwoc29ja2V0LCAnb3BlbicsIGhhbmRsZU9wZW4pO1xuICAgICAgcmVtb3ZlLmNhbGwoc29ja2V0LCAnZXJyb3InLCBoYW5kbGVFcnIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZU9wZW4oZXZ0KSB7XG4gICAgY2xlYW51cCgpOyBjYWxsYmFjaygpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRXJyIChldnQpIHtcbiAgICBjbGVhbnVwKCk7IGNhbGxiYWNrKGV2dCk7XG4gIH1cblxuICAvLyBpZiB0aGUgc29ja2V0IGlzIGNsb3Npbmcgb3IgY2xvc2VkLCByZXR1cm4gZW5kXG4gIGlmIChzb2NrZXQucmVhZHlTdGF0ZSA+PSAyKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKHRydWUpO1xuICB9XG5cbiAgLy8gaWYgb3BlbiwgdHJpZ2dlciB0aGUgY2FsbGJhY2tcbiAgaWYgKHNvY2tldC5yZWFkeVN0YXRlID09PSAxKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gIH1cblxuICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignb3BlbicsIGhhbmRsZU9wZW4pO1xuICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBoYW5kbGVFcnIpO1xufTtcbiIsInZhciBwdWxsID0gcmVxdWlyZSgncHVsbC1jb3JlJyk7XG52YXIgcmVhZHkgPSByZXF1aXJlKCcuL3JlYWR5Jyk7XG5cbi8qKlxuICAjIyMgYHNpbmsoc29ja2V0LCBvcHRzPylgXG5cbiAgQ3JlYXRlIGEgcHVsbC1zdHJlYW0gYFNpbmtgIHRoYXQgd2lsbCB3cml0ZSBkYXRhIHRvIHRoZSBgc29ja2V0YC5cblxuICA8PDwgZXhhbXBsZXMvd3JpdGUuanNcblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IHB1bGwuU2luayhmdW5jdGlvbihyZWFkLCBzb2NrZXQsIG9wdHMpIHtcbiAgb3B0cyA9IG9wdHMgfHwge31cbiAgdmFyIGNsb3NlT25FbmQgPSBvcHRzLmNsb3NlT25FbmQgIT09IGZhbHNlO1xuICB2YXIgb25DbG9zZSA9ICdmdW5jdGlvbicgPT09IHR5cGVvZiBvcHRzID8gb3B0cyA6IG9wdHMub25DbG9zZTtcblxuICBmdW5jdGlvbiBuZXh0KGVuZCwgZGF0YSkge1xuICAgIC8vIGlmIHRoZSBzdHJlYW0gaGFzIGVuZGVkLCBzaW1wbHkgcmV0dXJuXG4gICAgaWYgKGVuZCkge1xuICAgICAgaWYgKGNsb3NlT25FbmQgJiYgc29ja2V0LnJlYWR5U3RhdGUgPD0gMSkge1xuICAgICAgICBpZihvbkNsb3NlKVxuICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKCdjbG9zZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgaWYoZXYud2FzQ2xlYW4pIG9uQ2xvc2UoKVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3dzIGVycm9yJylcbiAgICAgICAgICAgICAgZXJyLmV2ZW50ID0gZXZcbiAgICAgICAgICAgICAgb25DbG9zZShlcnIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBzb2NrZXQgcmVhZHk/XG4gICAgcmVhZHkoc29ja2V0LCBmdW5jdGlvbihlbmQpIHtcbiAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgcmV0dXJuIHJlYWQoZW5kLCBmdW5jdGlvbiAoKSB7fSk7XG4gICAgICB9XG5cbiAgICAgIHNvY2tldC5zZW5kKGRhdGEpO1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgcmVhZChudWxsLCBuZXh0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgcmVhZChudWxsLCBuZXh0KTtcbn0pO1xuIiwidmFyIHB1bGwgPSByZXF1aXJlKCdwdWxsLWNvcmUnKTtcbnZhciByZWFkeSA9IHJlcXVpcmUoJy4vcmVhZHknKTtcblxuLyoqXG4gICMjIyBgc291cmNlKHNvY2tldClgXG5cbiAgQ3JlYXRlIGEgcHVsbC1zdHJlYW0gYFNvdXJjZWAgdGhhdCB3aWxsIHJlYWQgZGF0YSBmcm9tIHRoZSBgc29ja2V0YC5cblxuICA8PDwgZXhhbXBsZXMvcmVhZC5qc1xuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gcHVsbC5Tb3VyY2UoZnVuY3Rpb24oc29ja2V0KSB7XG4gIHZhciBidWZmZXIgPSBbXTtcbiAgdmFyIHJlY2VpdmVyO1xuICB2YXIgZW5kZWQ7XG5cbiAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihldnQpIHtcbiAgICBpZiAocmVjZWl2ZXIpIHtcbiAgICAgIHJldHVybiByZWNlaXZlcihudWxsLCBldnQuZGF0YSk7XG4gICAgfVxuXG4gICAgYnVmZmVyLnB1c2goZXZ0LmRhdGEpO1xuICB9KTtcblxuICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBmdW5jdGlvbihldnQpIHtcbiAgICBpZiAoZW5kZWQpIHJldHVybjtcbiAgICBpZiAocmVjZWl2ZXIpIHtcbiAgICAgIHJldHVybiByZWNlaXZlcihlbmRlZCA9IHRydWUpO1xuICAgIH1cbiAgfSk7XG5cbiAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGV2dCkge1xuICAgIGlmIChlbmRlZCkgcmV0dXJuO1xuICAgIGVuZGVkID0gZXZ0O1xuICAgIGlmIChyZWNlaXZlcikge1xuICAgICAgcmVjZWl2ZXIoZW5kZWQpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gcmVhZChhYm9ydCwgY2IpIHtcbiAgICByZWNlaXZlciA9IG51bGw7XG5cbiAgICAvL2lmIHN0cmVhbSBoYXMgYWxyZWFkeSBlbmRlZC5cbiAgICBpZiAoZW5kZWQpXG4gICAgICByZXR1cm4gY2IoZW5kZWQpXG5cbiAgICAvLyBpZiBlbmRlZCwgYWJvcnRcbiAgICBpZiAoYWJvcnQpIHtcbiAgICAgIC8vdGhpcyB3aWxsIGNhbGxiYWNrIHdoZW4gc29ja2V0IGNsb3Nlc1xuICAgICAgcmVjZWl2ZXIgPSBjYlxuICAgICAgcmV0dXJuIHNvY2tldC5jbG9zZSgpXG4gICAgfVxuXG4gICAgcmVhZHkoc29ja2V0LCBmdW5jdGlvbihlbmQpIHtcbiAgICAgIGlmIChlbmQpIHtcbiAgICAgICAgcmV0dXJuIGNiKGVuZGVkID0gZW5kKTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVhZCBmcm9tIHRoZSBzb2NrZXRcbiAgICAgIGlmIChlbmRlZCAmJiBlbmRlZCAhPT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm4gY2IoZW5kZWQpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoYnVmZmVyLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIGJ1ZmZlci5zaGlmdCgpKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGVuZGVkKSB7XG4gICAgICAgIHJldHVybiBjYih0cnVlKTtcbiAgICAgIH1cblxuICAgICAgcmVjZWl2ZXIgPSBjYjtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gcmVhZDtcbn0pO1xuIiwiXG4vKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cblxudmFyIGdsb2JhbCA9IChmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pKCk7XG5cbi8qKlxuICogV2ViU29ja2V0IGNvbnN0cnVjdG9yLlxuICovXG5cbnZhciBXZWJTb2NrZXQgPSBnbG9iYWwuV2ViU29ja2V0IHx8IGdsb2JhbC5Nb3pXZWJTb2NrZXQ7XG5cbi8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBXZWJTb2NrZXQgPyB3cyA6IG51bGw7XG5cbi8qKlxuICogV2ViU29ja2V0IGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSB0aGlyZCBgb3B0c2Agb3B0aW9ucyBvYmplY3QgZ2V0cyBpZ25vcmVkIGluIHdlYiBicm93c2Vycywgc2luY2UgaXQnc1xuICogbm9uLXN0YW5kYXJkLCBhbmQgdGhyb3dzIGEgVHlwZUVycm9yIGlmIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3IuXG4gKiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9laW5hcm9zL3dzL2lzc3Vlcy8yMjdcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJpXG4gKiBAcGFyYW0ge0FycmF5fSBwcm90b2NvbHMgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3QpIG9wdHMgKG9wdGlvbmFsKVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiB3cyh1cmksIHByb3RvY29scywgb3B0cykge1xuICB2YXIgaW5zdGFuY2U7XG4gIGlmIChwcm90b2NvbHMpIHtcbiAgICBpbnN0YW5jZSA9IG5ldyBXZWJTb2NrZXQodXJpLCBwcm90b2NvbHMpO1xuICB9IGVsc2Uge1xuICAgIGluc3RhbmNlID0gbmV3IFdlYlNvY2tldCh1cmkpO1xuICB9XG4gIHJldHVybiBpbnN0YW5jZTtcbn1cblxuaWYgKFdlYlNvY2tldCkgd3MucHJvdG90eXBlID0gV2ViU29ja2V0LnByb3RvdHlwZTtcbiIsInZhciByZUh0dHBVcmwgPSAvXmh0dHAoLiopJC87XG5cbi8qKlxuICAjIHdzdXJsXG5cbiAgR2l2ZW4gYSB1cmwgKGluY2x1ZGluZyBwcm90b2NvbCByZWxhdGl2ZSB1cmxzIC0gaS5lLiBgLy9gKSwgZ2VuZXJhdGUgYW4gYXBwcm9wcmlhdGVcbiAgdXJsIGZvciBhIFdlYlNvY2tldCBlbmRwb2ludCAoYHdzYCBvciBgd3NzYCkuXG5cbiAgIyMgRXhhbXBsZSBVc2FnZVxuXG4gIDw8PCBleGFtcGxlcy9yZWxhdGl2ZS5qc1xuXG4qKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIG9wdHMpIHtcbiAgdmFyIGN1cnJlbnQgPSAob3B0cyB8fCB7fSkuY3VycmVudCB8fCAodHlwZW9mIGxvY2F0aW9uICE9ICd1bmRlZmluZWQnICYmIGxvY2F0aW9uLmhyZWYpO1xuICB2YXIgY3VycmVudFByb3RvY29sID0gY3VycmVudCAmJiBjdXJyZW50LnNsaWNlKDAsIGN1cnJlbnQuaW5kZXhPZignOicpKTtcbiAgdmFyIGluc2VjdXJlID0gKG9wdHMgfHwge30pLmluc2VjdXJlO1xuICB2YXIgaXNSZWxhdGl2ZSA9IHVybC5zbGljZSgwLCAyKSA9PSAnLy8nO1xuICB2YXIgZm9yY2VXUyA9ICghIGN1cnJlbnRQcm90b2NvbCkgfHwgY3VycmVudFByb3RvY29sID09PSAnZmlsZTonO1xuXG4gIGlmIChpc1JlbGF0aXZlKSB7XG4gICAgcmV0dXJuIGZvcmNlV1MgP1xuICAgICAgKChpbnNlY3VyZSA/ICd3czonIDogJ3dzczonKSArIHVybCkgOlxuICAgICAgKGN1cnJlbnRQcm90b2NvbC5yZXBsYWNlKHJlSHR0cFVybCwgJ3dzJDEnKSArICc6JyArIHVybCk7XG4gIH1cblxuICByZXR1cm4gdXJsLnJlcGxhY2UocmVIdHRwVXJsLCAnd3MkMScpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBtZXNzZW5nZXIgZXZlbnRzXG4gIGRhdGFFdmVudDogJ2RhdGEnLFxuICBvcGVuRXZlbnQ6ICdvcGVuJyxcbiAgY2xvc2VFdmVudDogJ2Nsb3NlJyxcbiAgZXJyb3JFdmVudDogJ2Vycm9yJyxcblxuICAvLyBtZXNzZW5nZXIgZnVuY3Rpb25zXG4gIHdyaXRlTWV0aG9kOiAnd3JpdGUnLFxuICBjbG9zZU1ldGhvZDogJ2Nsb3NlJyxcblxuICAvLyBsZWF2ZSB0aW1lb3V0IChtcylcbiAgbGVhdmVUaW1lb3V0OiAzMDAwXG59O1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2NvZy9leHRlbmQnKTtcblxuLyoqXG4gICMjIyMgYW5ub3VuY2VcblxuICBgYGBcbiAgL2Fubm91bmNlfCVtZXRhZGF0YSV8e1wiaWRcIjogXCIuLi5cIiwgLi4uIH1cbiAgYGBgXG5cbiAgV2hlbiBhbiBhbm5vdW5jZSBtZXNzYWdlIGlzIHJlY2VpdmVkIGJ5IHRoZSBzaWduYWxsZXIsIHRoZSBhdHRhY2hlZFxuICBvYmplY3QgZGF0YSBpcyBkZWNvZGVkIGFuZCB0aGUgc2lnbmFsbGVyIGVtaXRzIGFuIGBhbm5vdW5jZWAgbWVzc2FnZS5cblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpZ25hbGxlcikge1xuXG4gIGZ1bmN0aW9uIGRhdGFBbGxvd2VkKGRhdGEpIHtcbiAgICB2YXIgY2xvbmVkID0gZXh0ZW5kKHsgYWxsb3c6IHRydWUgfSwgZGF0YSk7XG4gICAgc2lnbmFsbGVyKCdwZWVyOmZpbHRlcicsIGRhdGEuaWQsIGNsb25lZCk7XG5cbiAgICByZXR1cm4gY2xvbmVkLmFsbG93O1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZ3MsIG1lc3NhZ2VUeXBlLCBzcmNEYXRhLCBzcmNTdGF0ZSwgaXNETSkge1xuICAgIHZhciBkYXRhID0gYXJnc1swXTtcbiAgICB2YXIgcGVlcjtcblxuICAgIC8vIGlmIHdlIGhhdmUgdmFsaWQgZGF0YSB0aGVuIHByb2Nlc3NcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmlkICYmIGRhdGEuaWQgIT09IHNpZ25hbGxlci5pZCkge1xuICAgICAgaWYgKCEgZGF0YUFsbG93ZWQoZGF0YSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gY2hlY2sgdG8gc2VlIGlmIHRoaXMgaXMgYSBrbm93biBwZWVyXG4gICAgICBwZWVyID0gc2lnbmFsbGVyLnBlZXJzLmdldChkYXRhLmlkKTtcblxuICAgICAgLy8gdHJpZ2dlciB0aGUgcGVlciBjb25uZWN0ZWQgZXZlbnQgdG8gZmxhZyB0aGF0IHdlIGtub3cgYWJvdXQgYVxuICAgICAgLy8gcGVlciBjb25uZWN0aW9uLiBUaGUgcGVlciBoYXMgcGFzc2VkIHRoZSBcImZpbHRlclwiIGNoZWNrIGJ1dCBtYXlcbiAgICAgIC8vIGJlIGFubm91bmNlZCAvIHVwZGF0ZWQgZGVwZW5kaW5nIG9uIHByZXZpb3VzIGNvbm5lY3Rpb24gc3RhdHVzXG4gICAgICBzaWduYWxsZXIoJ3BlZXI6Y29ubmVjdGVkJywgZGF0YS5pZCwgZGF0YSk7XG5cbiAgICAgIC8vIGlmIHRoZSBwZWVyIGlzIGV4aXN0aW5nLCB0aGVuIHVwZGF0ZSB0aGUgZGF0YVxuICAgICAgaWYgKHBlZXIgJiYgKCEgcGVlci5pbmFjdGl2ZSkpIHtcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBkYXRhXG4gICAgICAgIGV4dGVuZChwZWVyLmRhdGEsIGRhdGEpO1xuXG4gICAgICAgIC8vIHRyaWdnZXIgdGhlIHBlZXIgdXBkYXRlIGV2ZW50XG4gICAgICAgIHJldHVybiBzaWduYWxsZXIoJ3BlZXI6dXBkYXRlJywgZGF0YSwgc3JjRGF0YSk7XG4gICAgICB9XG5cbiAgICAgIC8vIGNyZWF0ZSBhIG5ldyBwZWVyXG4gICAgICBwZWVyID0ge1xuICAgICAgICBpZDogZGF0YS5pZCxcblxuICAgICAgICAvLyBpbml0aWFsaXNlIHRoZSBsb2NhbCByb2xlIGluZGV4XG4gICAgICAgIHJvbGVJZHg6IFtkYXRhLmlkLCBzaWduYWxsZXIuaWRdLnNvcnQoKS5pbmRleE9mKGRhdGEuaWQpLFxuXG4gICAgICAgIC8vIGluaXRpYWxpc2UgdGhlIHBlZXIgZGF0YVxuICAgICAgICBkYXRhOiB7fVxuICAgICAgfTtcblxuICAgICAgLy8gaW5pdGlhbGlzZSB0aGUgcGVlciBkYXRhXG4gICAgICBleHRlbmQocGVlci5kYXRhLCBkYXRhKTtcblxuICAgICAgLy8gcmVzZXQgaW5hY3Rpdml0eSBzdGF0ZVxuICAgICAgY2xlYXJUaW1lb3V0KHBlZXIubGVhdmVUaW1lcik7XG4gICAgICBwZWVyLmluYWN0aXZlID0gZmFsc2U7XG5cbiAgICAgIC8vIHNldCB0aGUgcGVlciBkYXRhXG4gICAgICBzaWduYWxsZXIucGVlcnMuc2V0KGRhdGEuaWQsIHBlZXIpO1xuXG4gICAgICAvLyBpZiB0aGlzIGlzIGFuIGluaXRpYWwgYW5ub3VuY2UgbWVzc2FnZSAobm8gdmVjdG9yIGNsb2NrIGF0dGFjaGVkKVxuICAgICAgLy8gdGhlbiBzZW5kIGEgYW5ub3VuY2UgcmVwbHlcbiAgICAgIGlmIChzaWduYWxsZXIuYXV0b3JlcGx5ICYmICghIGlzRE0pKSB7XG4gICAgICAgIHNpZ25hbGxlclxuICAgICAgICAgIC50byhkYXRhLmlkKVxuICAgICAgICAgIC5zZW5kKCcvYW5ub3VuY2UnLCBzaWduYWxsZXIuYXR0cmlidXRlcyk7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtaXQgYSBuZXcgcGVlciBhbm5vdW5jZSBldmVudFxuICAgICAgcmV0dXJuIHNpZ25hbGxlcigncGVlcjphbm5vdW5jZScsIGRhdGEsIHBlZXIpO1xuICAgIH1cbiAgfTtcbn07XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAgIyMjIHNpZ25hbGxlciBtZXNzYWdlIGhhbmRsZXJzXG5cbioqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpZ25hbGxlciwgb3B0cykge1xuICByZXR1cm4ge1xuICAgIGFubm91bmNlOiByZXF1aXJlKCcuL2Fubm91bmNlJykoc2lnbmFsbGVyLCBvcHRzKVxuICB9O1xufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBkZXRlY3QgPSByZXF1aXJlKCdydGMtY29yZS9kZXRlY3QnKTtcbnZhciBkZWZhdWx0cyA9IHJlcXVpcmUoJ2NvZy9kZWZhdWx0cycpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2NvZy9leHRlbmQnKTtcbnZhciBtYnVzID0gcmVxdWlyZSgnbWJ1cycpO1xudmFyIGdldGFibGUgPSByZXF1aXJlKCdjb2cvZ2V0YWJsZScpO1xudmFyIHV1aWQgPSByZXF1aXJlKCdjdWlkJyk7XG52YXIgcHVsbCA9IHJlcXVpcmUoJ3B1bGwtc3RyZWFtJyk7XG52YXIgcHVzaGFibGUgPSByZXF1aXJlKCdwdWxsLXB1c2hhYmxlJyk7XG5cbi8vIHJlYWR5IHN0YXRlIGNvbnN0YW50c1xudmFyIFJTX0RJU0NPTk5FQ1RFRCA9IDA7XG52YXIgUlNfQ09OTkVDVElORyA9IDE7XG52YXIgUlNfQ09OTkVDVEVEID0gMjtcblxuLy8gaW5pdGlhbGlzZSBzaWduYWxsZXIgbWV0YWRhdGEgc28gd2UgZG9uJ3QgaGF2ZSB0byBpbmNsdWRlIHRoZSBwYWNrYWdlLmpzb25cbi8vIFRPRE86IG1ha2UgdGhpcyBjaGVja2FibGUgd2l0aCBzb21lIGtpbmQgb2YgcHJlcHVibGlzaCBzY3JpcHRcbnZhciBtZXRhZGF0YSA9IHtcbiAgdmVyc2lvbjogJzUuMi4yJ1xufTtcblxuLyoqXG4gICMgcnRjLXNpZ25hbGxlclxuXG4gIFRoZSBgcnRjLXNpZ25hbGxlcmAgbW9kdWxlIHByb3ZpZGVzIGEgdHJhbnNwb3J0bGVzcyBzaWduYWxsaW5nXG4gIG1lY2hhbmlzbSBmb3IgV2ViUlRDLlxuXG4gICMjIFB1cnBvc2VcblxuICA8PDwgZG9jcy9wdXJwb3NlLm1kXG5cbiAgIyMgR2V0dGluZyBTdGFydGVkXG5cbiAgV2hpbGUgdGhlIHNpZ25hbGxlciBpcyBjYXBhYmxlIG9mIGNvbW11bmljYXRpbmcgYnkgYSBudW1iZXIgb2YgZGlmZmVyZW50XG4gIG1lc3NlbmdlcnMgKGkuZS4gYW55dGhpbmcgdGhhdCBjYW4gc2VuZCBhbmQgcmVjZWl2ZSBtZXNzYWdlcyBvdmVyIGEgd2lyZSlcbiAgaXQgY29tZXMgd2l0aCBzdXBwb3J0IGZvciB1bmRlcnN0YW5kaW5nIGhvdyB0byBjb25uZWN0IHRvIGFuXG4gIFtydGMtc3dpdGNoYm9hcmRdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXN3aXRjaGJvYXJkKSBvdXQgb2YgdGhlIGJveC5cblxuICBUaGUgZm9sbG93aW5nIGNvZGUgc2FtcGxlIGRlbW9uc3RyYXRlcyBob3c6XG5cbiAgPDw8IGV4YW1wbGVzL2dldHRpbmctc3RhcnRlZC5qc1xuXG4gIDw8PCBkb2NzL2V2ZW50cy5tZFxuXG4gIDw8PCBkb2NzL3NpZ25hbGZsb3ctZGlhZ3JhbXMubWRcblxuICAjIyBSZWZlcmVuY2VcblxuICBUaGUgYHJ0Yy1zaWduYWxsZXJgIG1vZHVsZSBpcyBkZXNpZ25lZCB0byBiZSB1c2VkIHByaW1hcmlseSBpbiBhIGZ1bmN0aW9uYWxcbiAgd2F5IGFuZCB3aGVuIGNhbGxlZCBpdCBjcmVhdGVzIGEgbmV3IHNpZ25hbGxlciB0aGF0IHdpbGwgZW5hYmxlXG4gIHlvdSB0byBjb21tdW5pY2F0ZSB3aXRoIG90aGVyIHBlZXJzIHZpYSB5b3VyIG1lc3NhZ2luZyBuZXR3b3JrLlxuXG4gIGBgYGpzXG4gIC8vIGNyZWF0ZSBhIHNpZ25hbGxlciBmcm9tIHNvbWV0aGluZyB0aGF0IGtub3dzIGhvdyB0byBzZW5kIG1lc3NhZ2VzXG4gIHZhciBzaWduYWxsZXIgPSByZXF1aXJlKCdydGMtc2lnbmFsbGVyJykobWVzc2VuZ2VyKTtcbiAgYGBgXG5cbiAgQXMgZGVtb25zdHJhdGVkIGluIHRoZSBnZXR0aW5nIHN0YXJ0ZWQgZ3VpZGUsIHlvdSBjYW4gYWxzbyBwYXNzIHRocm91Z2hcbiAgYSBzdHJpbmcgdmFsdWUgaW5zdGVhZCBvZiBhIG1lc3NlbmdlciBpbnN0YW5jZSBpZiB5b3Ugc2ltcGx5IHdhbnQgdG9cbiAgY29ubmVjdCB0byBhbiBleGlzdGluZyBgcnRjLXN3aXRjaGJvYXJkYCBpbnN0YW5jZS5cblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG1lc3Nlbmdlciwgb3B0cykge1xuICAvLyBnZXQgdGhlIGF1dG9yZXBseSBzZXR0aW5nXG4gIHZhciBhdXRvcmVwbHkgPSAob3B0cyB8fCB7fSkuYXV0b3JlcGx5O1xuICB2YXIgYXV0b2Nvbm5lY3QgPSAob3B0cyB8fCB7fSkuYXV0b2Nvbm5lY3Q7XG4gIHZhciByZWNvbm5lY3QgPSAob3B0cyB8fCB7fSkucmVjb25uZWN0O1xuXG4gIC8vIGluaXRpYWxpc2UgdGhlIG1ldGFkYXRhXG4gIHZhciBsb2NhbE1ldGEgPSB7fTtcblxuICAvLyBjcmVhdGUgdGhlIHNpZ25hbGxlclxuICB2YXIgc2lnbmFsbGVyID0gbWJ1cygnJywgKG9wdHMgfHwge30pLmxvZ2dlcik7XG5cbiAgLy8gaW5pdGlhbGlzZSB0aGUgaWRcbiAgdmFyIGlkID0gc2lnbmFsbGVyLmlkID0gKG9wdHMgfHwge30pLmlkIHx8IHV1aWQoKTtcblxuICAvLyBpbml0aWFsaXNlIHRoZSBhdHRyaWJ1dGVzXG4gIHZhciBhdHRyaWJ1dGVzID0gc2lnbmFsbGVyLmF0dHJpYnV0ZXMgPSB7XG4gICAgYnJvd3NlcjogZGV0ZWN0LmJyb3dzZXIsXG4gICAgYnJvd3NlclZlcnNpb246IGRldGVjdC5icm93c2VyVmVyc2lvbixcbiAgICBpZDogaWQsXG4gICAgYWdlbnQ6ICdzaWduYWxsZXJAJyArIG1ldGFkYXRhLnZlcnNpb25cbiAgfTtcblxuICAvLyBjcmVhdGUgdGhlIHBlZXJzIG1hcFxuICB2YXIgcGVlcnMgPSBzaWduYWxsZXIucGVlcnMgPSBnZXRhYmxlKHt9KTtcblxuICAvLyBjcmVhdGUgdGhlIG91dGJvdW5kIG1lc3NhZ2UgcXVldWVcbiAgdmFyIHF1ZXVlID0gcmVxdWlyZSgncHVsbC1wdXNoYWJsZScpKCk7XG5cbiAgdmFyIHByb2Nlc3NvcjtcbiAgdmFyIGFubm91bmNlVGltZXIgPSAwO1xuICB2YXIgcmVhZHlTdGF0ZSA9IFJTX0RJU0NPTk5FQ1RFRDtcblxuICBmdW5jdGlvbiBhbm5vdW5jZU9uUmVjb25uZWN0KCkge1xuICAgIHNpZ25hbGxlci5hbm5vdW5jZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gYnVmZmVyTWVzc2FnZShhcmdzKSB7XG4gICAgcXVldWUucHVzaChjcmVhdGVEYXRhTGluZShhcmdzKSk7XG5cbiAgICAvLyBpZiB3ZSBhcmUgbm90IGNvbm5lY3RlZCAoYW5kIHNob3VsZCBhdXRvY29ubmVjdCksIHRoZW4gYXR0ZW1wdCBjb25uZWN0aW9uXG4gICAgaWYgKHJlYWR5U3RhdGUgPT09IFJTX0RJU0NPTk5FQ1RFRCAmJiAoYXV0b2Nvbm5lY3QgPT09IHVuZGVmaW5lZCB8fCBhdXRvY29ubmVjdCkpIHtcbiAgICAgIGNvbm5lY3QoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVEYXRhTGluZShhcmdzKSB7XG4gICAgcmV0dXJuIGFyZ3MubWFwKHByZXBhcmVBcmcpLmpvaW4oJ3wnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU1ldGFkYXRhKCkge1xuICAgIHJldHVybiBleHRlbmQoe30sIGxvY2FsTWV0YSwgeyBpZDogc2lnbmFsbGVyLmlkIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRGlzY29ubmVjdCgpIHtcbiAgICBpZiAocmVjb25uZWN0ID09PSB1bmRlZmluZWQgfHwgcmVjb25uZWN0KSB7XG4gICAgICBzZXRUaW1lb3V0KGNvbm5lY3QsIDUwKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwcmVwYXJlQXJnKGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnID09ICdvYmplY3QnICYmICghIChhcmcgaW5zdGFuY2VvZiBTdHJpbmcpKSkge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZyk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBhcmcgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFyZztcbiAgfVxuXG4gIC8qKlxuICAgICMjIyBgc2lnbmFsbGVyLmNvbm5lY3QoKWBcblxuICAgIE1hbnVhbGx5IGNvbm5lY3QgdGhlIHNpZ25hbGxlciB1c2luZyB0aGUgc3VwcGxpZWQgbWVzc2VuZ2VyLlxuXG4gICAgX19OT1RFOl9fIFRoaXMgc2hvdWxkIG5ldmVyIGhhdmUgdG8gYmUgY2FsbGVkIGlmIHRoZSBkZWZhdWx0IHNldHRpbmdcbiAgICBmb3IgYGF1dG9jb25uZWN0YCBpcyB1c2VkLlxuICAqKi9cbiAgdmFyIGNvbm5lY3QgPSBzaWduYWxsZXIuY29ubmVjdCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGlmIHdlIGFyZSBhbHJlYWR5IGNvbm5lY3RpbmcgdGhlbiBkbyBub3RoaW5nXG4gICAgaWYgKHJlYWR5U3RhdGUgPT09IFJTX0NPTk5FQ1RJTkcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBpbml0aWF0ZSB0aGUgbWVzc2VuZ2VyXG4gICAgcmVhZHlTdGF0ZSA9IFJTX0NPTk5FQ1RJTkc7XG4gICAgbWVzc2VuZ2VyKGZ1bmN0aW9uKGVyciwgc291cmNlLCBzaW5rKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJlYWR5U3RhdGUgPSBSU19ESVNDT05ORUNURUQ7XG4gICAgICAgIHJldHVybiBzaWduYWxsZXIoJ2Vycm9yJywgZXJyKTtcbiAgICAgIH1cblxuICAgICAgLy8gZmxhZyBhcyBjb25uZWN0ZWRcbiAgICAgIHJlYWR5U3RhdGUgPSBSU19DT05ORUNURUQ7XG5cbiAgICAgIC8vIHBhc3MgbWVzc2FnZXMgdG8gdGhlIHByb2Nlc3NvclxuICAgICAgcHVsbChcbiAgICAgICAgc291cmNlLFxuXG4gICAgICAgIC8vIG1vbml0b3IgZGlzY29ubmVjdGlvblxuICAgICAgICBwdWxsLnRocm91Z2gobnVsbCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmVhZHlTdGF0ZSA9IFJTX0RJU0NPTk5FQ1RFRDtcbiAgICAgICAgICBzaWduYWxsZXIoJ2Rpc2Nvbm5lY3RlZCcpO1xuICAgICAgICB9KSxcbiAgICAgICAgcHVsbC5kcmFpbihwcm9jZXNzb3IpXG4gICAgICApO1xuXG4gICAgICAvLyBwYXNzIHRoZSBxdWV1ZSB0byB0aGUgc2lua1xuICAgICAgcHVsbChxdWV1ZSwgc2luayk7XG5cbiAgICAgIC8vIGhhbmRsZSBkaXNjb25uZWN0aW9uXG4gICAgICBzaWduYWxsZXIucmVtb3ZlTGlzdGVuZXIoJ2Rpc2Nvbm5lY3RlZCcsIGhhbmRsZURpc2Nvbm5lY3QpO1xuICAgICAgc2lnbmFsbGVyLm9uKCdkaXNjb25uZWN0ZWQnLCBoYW5kbGVEaXNjb25uZWN0KTtcblxuICAgICAgLy8gdHJpZ2dlciB0aGUgY29ubmVjdGVkIGV2ZW50XG4gICAgICBzaWduYWxsZXIoJ2Nvbm5lY3RlZCcpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyBzaWduYWxsZXIjc2VuZChtZXNzYWdlLCBkYXRhKilcblxuICAgIFVzZSB0aGUgc2VuZCBmdW5jdGlvbiB0byBzZW5kIGEgbWVzc2FnZSB0byBvdGhlciBwZWVycyBpbiB0aGUgY3VycmVudFxuICAgIHNpZ25hbGxpbmcgc2NvcGUgKGlmIGFubm91bmNlZCBpbiBhIHJvb20gdGhpcyB3aWxsIGJlIGEgcm9vbSwgb3RoZXJ3aXNlXG4gICAgYnJvYWRjYXN0IHRvIGFsbCBwZWVycyBjb25uZWN0ZWQgdG8gdGhlIHNpZ25hbGxpbmcgc2VydmVyKS5cblxuICAqKi9cbiAgdmFyIHNlbmQgPSBzaWduYWxsZXIuc2VuZCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIGl0ZXJhdGUgb3ZlciB0aGUgYXJndW1lbnRzIGFuZCBzdHJpbmdpZnkgYXMgcmVxdWlyZWRcbiAgICAvLyB2YXIgbWV0YWRhdGEgPSB7IGlkOiBzaWduYWxsZXIuaWQgfTtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgIC8vIGluamVjdCB0aGUgbWV0YWRhdGFcbiAgICBhcmdzLnNwbGljZSgxLCAwLCBjcmVhdGVNZXRhZGF0YSgpKTtcbiAgICBidWZmZXJNZXNzYWdlKGFyZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyBhbm5vdW5jZShkYXRhPylcblxuICAgIFRoZSBgYW5ub3VuY2VgIGZ1bmN0aW9uIG9mIHRoZSBzaWduYWxsZXIgd2lsbCBwYXNzIGFuIGAvYW5ub3VuY2VgIG1lc3NhZ2VcbiAgICB0aHJvdWdoIHRoZSBtZXNzZW5nZXIgbmV0d29yay4gIFdoZW4gbm8gYWRkaXRpb25hbCBkYXRhIGlzIHN1cHBsaWVkIHRvXG4gICAgdGhpcyBmdW5jdGlvbiB0aGVuIG9ubHkgdGhlIGlkIG9mIHRoZSBzaWduYWxsZXIgaXMgc2VudCB0byBhbGwgYWN0aXZlXG4gICAgbWVtYmVycyBvZiB0aGUgbWVzc2VuZ2luZyBuZXR3b3JrLlxuXG4gICAgIyMjIyBKb2luaW5nIFJvb21zXG5cbiAgICBUbyBqb2luIGEgcm9vbSB1c2luZyBhbiBhbm5vdW5jZSBjYWxsIHlvdSBzaW1wbHkgcHJvdmlkZSB0aGUgbmFtZSBvZiB0aGVcbiAgICByb29tIHlvdSB3aXNoIHRvIGpvaW4gYXMgcGFydCBvZiB0aGUgZGF0YSBibG9jayB0aGF0IHlvdSBhbm5vdWNlLCBmb3JcbiAgICBleGFtcGxlOlxuXG4gICAgYGBganNcbiAgICBzaWduYWxsZXIuYW5ub3VuY2UoeyByb29tOiAndGVzdHJvb20nIH0pO1xuICAgIGBgYFxuXG4gICAgU2lnbmFsbGluZyBzZXJ2ZXJzIChzdWNoIGFzXG4gICAgW3J0Yy1zd2l0Y2hib2FyZF0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtc3dpdGNoYm9hcmQpKSB3aWxsIHRoZW5cbiAgICBwbGFjZSB5b3VyIHBlZXIgY29ubmVjdGlvbiBpbnRvIGEgcm9vbSB3aXRoIG90aGVyIHBlZXJzIHRoYXQgaGF2ZSBhbHNvXG4gICAgYW5ub3VuY2VkIGluIHRoaXMgcm9vbS5cblxuICAgIE9uY2UgeW91IGhhdmUgam9pbmVkIGEgcm9vbSwgdGhlIHNlcnZlciB3aWxsIG9ubHkgZGVsaXZlciBtZXNzYWdlcyB0aGF0XG4gICAgeW91IGBzZW5kYCB0byBvdGhlciBwZWVycyB3aXRoaW4gdGhhdCByb29tLlxuXG4gICAgIyMjIyBQcm92aWRpbmcgQWRkaXRpb25hbCBBbm5vdW5jZSBEYXRhXG5cbiAgICBUaGVyZSBtYXkgYmUgaW5zdGFuY2VzIHdoZXJlIHlvdSB3aXNoIHRvIHNlbmQgYWRkaXRpb25hbCBkYXRhIGFzIHBhcnQgb2ZcbiAgICB5b3VyIGFubm91bmNlIG1lc3NhZ2UgaW4geW91ciBhcHBsaWNhdGlvbi4gIEZvciBpbnN0YW5jZSwgbWF5YmUgeW91IHdhbnRcbiAgICB0byBzZW5kIGFuIGFsaWFzIG9yIG5pY2sgYXMgcGFydCBvZiB5b3VyIGFubm91bmNlIG1lc3NhZ2UgcmF0aGVyIHRoYW4ganVzdFxuICAgIHVzZSB0aGUgc2lnbmFsbGVyJ3MgZ2VuZXJhdGVkIGlkLlxuXG4gICAgSWYgZm9yIGluc3RhbmNlIHlvdSB3ZXJlIHdyaXRpbmcgYSBzaW1wbGUgY2hhdCBhcHBsaWNhdGlvbiB5b3UgY291bGQgam9pblxuICAgIHRoZSBgd2VicnRjYCByb29tIGFuZCB0ZWxsIGV2ZXJ5b25lIHlvdXIgbmFtZSB3aXRoIHRoZSBmb2xsb3dpbmcgYW5ub3VuY2VcbiAgICBjYWxsOlxuXG4gICAgYGBganNcbiAgICBzaWduYWxsZXIuYW5ub3VuY2Uoe1xuICAgICAgcm9vbTogJ3dlYnJ0YycsXG4gICAgICBuaWNrOiAnRGFtb24nXG4gICAgfSk7XG4gICAgYGBgXG5cbiAgICAjIyMjIEFubm91bmNpbmcgVXBkYXRlc1xuXG4gICAgVGhlIHNpZ25hbGxlciBpcyB3cml0dGVuIHRvIGRpc3Rpbmd1aXNoIGJldHdlZW4gaW5pdGlhbCBwZWVyIGFubm91bmNlbWVudHNcbiAgICBhbmQgcGVlciBkYXRhIHVwZGF0ZXMgKHNlZSB0aGUgZG9jcyBvbiB0aGUgYW5ub3VuY2UgaGFuZGxlciBiZWxvdykuIEFzXG4gICAgc3VjaCBpdCBpcyBvayB0byBwcm92aWRlIGFueSBkYXRhIHVwZGF0ZXMgdXNpbmcgdGhlIGFubm91bmNlIG1ldGhvZCBhbHNvLlxuXG4gICAgRm9yIGluc3RhbmNlLCBJIGNvdWxkIHNlbmQgYSBzdGF0dXMgdXBkYXRlIGFzIGFuIGFubm91bmNlIG1lc3NhZ2UgdG8gZmxhZ1xuICAgIHRoYXQgSSBhbSBnb2luZyBvZmZsaW5lOlxuXG4gICAgYGBganNcbiAgICBzaWduYWxsZXIuYW5ub3VuY2UoeyBzdGF0dXM6ICdvZmZsaW5lJyB9KTtcbiAgICBgYGBcblxuICAqKi9cbiAgc2lnbmFsbGVyLmFubm91bmNlID0gZnVuY3Rpb24oZGF0YSwgc2VuZGVyKSB7XG5cbiAgICBmdW5jdGlvbiBzZW5kQW5ub3VuY2UoKSB7XG4gICAgICAoc2VuZGVyIHx8IHNlbmQpKCcvYW5ub3VuY2UnLCBhdHRyaWJ1dGVzKTtcbiAgICAgIHNpZ25hbGxlcignbG9jYWw6YW5ub3VuY2UnLCBhdHRyaWJ1dGVzKTtcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBhcmUgYWxyZWFkeSBjb25uZWN0ZWQsIHRoZW4gZW5zdXJlIHdlIGFubm91bmNlIG9uIHJlY29ubmVjdFxuICAgIGlmIChyZWFkeVN0YXRlID09PSBSU19DT05ORUNURUQpIHtcbiAgICAgIC8vIGFsd2F5cyBhbm5vdW5jZSBvbiByZWNvbm5lY3RcbiAgICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcignY29ubmVjdGVkJywgYW5ub3VuY2VPblJlY29ubmVjdCk7XG4gICAgICBzaWduYWxsZXIub24oJ2Nvbm5lY3RlZCcsIGFubm91bmNlT25SZWNvbm5lY3QpO1xuICAgIH1cblxuICAgIGNsZWFyVGltZW91dChhbm5vdW5jZVRpbWVyKTtcblxuICAgIC8vIHVwZGF0ZSBpbnRlcm5hbCBhdHRyaWJ1dGVzXG4gICAgZXh0ZW5kKGF0dHJpYnV0ZXMsIGRhdGEsIHsgaWQ6IHNpZ25hbGxlci5pZCB9KTtcblxuICAgIC8vIHNlbmQgdGhlIGF0dHJpYnV0ZXMgb3ZlciB0aGUgbmV0d29ya1xuICAgIHJldHVybiBhbm5vdW5jZVRpbWVyID0gc2V0VGltZW91dChzZW5kQW5ub3VuY2UsIChvcHRzIHx8IHt9KS5hbm5vdW5jZURlbGF5IHx8IDEwKTtcbiAgfTtcblxuICAvKipcbiAgICAjIyMgaXNNYXN0ZXIodGFyZ2V0SWQpXG5cbiAgICBBIHNpbXBsZSBmdW5jdGlvbiB0aGF0IGluZGljYXRlcyB3aGV0aGVyIHRoZSBsb2NhbCBzaWduYWxsZXIgaXMgdGhlIG1hc3RlclxuICAgIGZvciBpdCdzIHJlbGF0aW9uc2hpcCB3aXRoIHBlZXIgc2lnbmFsbGVyIGluZGljYXRlZCBieSBgdGFyZ2V0SWRgLiAgUm9sZXNcbiAgICBhcmUgZGV0ZXJtaW5lZCBhdCB0aGUgcG9pbnQgYXQgd2hpY2ggc2lnbmFsbGluZyBwZWVycyBkaXNjb3ZlciBlYWNoIG90aGVyLFxuICAgIGFuZCBhcmUgc2ltcGx5IHdvcmtlZCBvdXQgYnkgd2hpY2hldmVyIHBlZXIgaGFzIHRoZSBsb3dlc3Qgc2lnbmFsbGVyIGlkXG4gICAgd2hlbiBsZXhpZ3JhcGhpY2FsbHkgc29ydGVkLlxuXG4gICAgRm9yIGV4YW1wbGUsIGlmIHdlIGhhdmUgdHdvIHNpZ25hbGxlciBwZWVycyB0aGF0IGhhdmUgZGlzY292ZXJlZCBlYWNoXG4gICAgb3RoZXJzIHdpdGggdGhlIGZvbGxvd2luZyBpZHM6XG5cbiAgICAtIGBiMTFmNGZkMC1mZWI1LTQ0N2MtODBjOC1jNTFkOGMzY2NlZDJgXG4gICAgLSBgOGEwN2Y4MmUtNDlhNS00YjliLWEwMmUtNDNkOTExMzgyYmU2YFxuXG4gICAgVGhleSB3b3VsZCBiZSBhc3NpZ25lZCByb2xlczpcblxuICAgIC0gYGIxMWY0ZmQwLWZlYjUtNDQ3Yy04MGM4LWM1MWQ4YzNjY2VkMmBcbiAgICAtIGA4YTA3ZjgyZS00OWE1LTRiOWItYTAyZS00M2Q5MTEzODJiZTZgIChtYXN0ZXIpXG5cbiAgKiovXG4gIHNpZ25hbGxlci5pc01hc3RlciA9IGZ1bmN0aW9uKHRhcmdldElkKSB7XG4gICAgdmFyIHBlZXIgPSBwZWVycy5nZXQodGFyZ2V0SWQpO1xuXG4gICAgcmV0dXJuIHBlZXIgJiYgcGVlci5yb2xlSWR4ICE9PSAwO1xuICB9O1xuXG4gIC8qKlxuICAgICMjIyBsZWF2ZSgpXG5cbiAgICBUZWxsIHRoZSBzaWduYWxsaW5nIHNlcnZlciB3ZSBhcmUgbGVhdmluZy4gIENhbGxpbmcgdGhpcyBmdW5jdGlvbiBpc1xuICAgIHVzdWFsbHkgbm90IHJlcXVpcmVkIHRob3VnaCBhcyB0aGUgc2lnbmFsbGluZyBzZXJ2ZXIgc2hvdWxkIGlzc3VlIGNvcnJlY3RcbiAgICBgL2xlYXZlYCBtZXNzYWdlcyB3aGVuIGl0IGRldGVjdHMgYSBkaXNjb25uZWN0IGV2ZW50LlxuXG4gICoqL1xuICBzaWduYWxsZXIubGVhdmUgPSBzaWduYWxsZXIuY2xvc2UgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBzZW5kIHRoZSBsZWF2ZSBzaWduYWxcbiAgICBzZW5kKCcvbGVhdmUnLCB7IGlkOiBpZCB9KTtcblxuICAgIC8vIHN0b3AgYW5ub3VuY2luZyBvbiByZWNvbm5lY3RcbiAgICBzaWduYWxsZXIucmVtb3ZlTGlzdGVuZXIoJ2Rpc2Nvbm5lY3RlZCcsIGhhbmRsZURpc2Nvbm5lY3QpO1xuICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcignY29ubmVjdGVkJywgYW5ub3VuY2VPblJlY29ubmVjdCk7XG5cbiAgICAvLyBlbmQgb3VyIGN1cnJlbnQgcXVldWVcbiAgICBxdWV1ZS5lbmQoKTtcblxuICAgIC8vIGNyZWF0ZSBhIG5ldyBxdWV1ZSB0byBidWZmZXIgbmV3IG1lc3NhZ2VzXG4gICAgcXVldWUgPSBwdXNoYWJsZSgpO1xuXG4gICAgLy8gc2V0IGNvbm5lY3RlZCB0byBmYWxzZVxuICAgIHJlYWR5U3RhdGUgPSBSU19ESVNDT05ORUNURUQ7XG4gIH07XG5cbiAgLyoqXG4gICAgIyMjIG1ldGFkYXRhKGRhdGE/KVxuXG4gICAgR2V0IChwYXNzIG5vIGRhdGEpIG9yIHNldCB0aGUgbWV0YWRhdGEgdGhhdCBpcyBwYXNzZWQgdGhyb3VnaCB3aXRoIGVhY2hcbiAgICByZXF1ZXN0IHNlbnQgYnkgdGhlIHNpZ25hbGxlci5cblxuICAgIF9fTk9URTpfXyBSZWdhcmRsZXNzIG9mIHdoYXQgaXMgcGFzc2VkIHRvIHRoaXMgZnVuY3Rpb24sIG1ldGFkYXRhXG4gICAgZ2VuZXJhdGVkIGJ5IHRoZSBzaWduYWxsZXIgd2lsbCAqKmFsd2F5cyoqIGluY2x1ZGUgdGhlIGlkIG9mIHRoZSBzaWduYWxsZXJcbiAgICBhbmQgdGhpcyBjYW5ub3QgYmUgbW9kaWZpZWQuXG4gICoqL1xuICBzaWduYWxsZXIubWV0YWRhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBleHRlbmQoe30sIGxvY2FsTWV0YSk7XG4gICAgfVxuXG4gICAgbG9jYWxNZXRhID0gZXh0ZW5kKHt9LCBkYXRhKTtcbiAgfTtcblxuICAvKipcbiAgICAjIyMgdG8odGFyZ2V0SWQpXG5cbiAgICBVc2UgdGhlIGB0b2AgZnVuY3Rpb24gdG8gc2VuZCBhIG1lc3NhZ2UgdG8gdGhlIHNwZWNpZmllZCB0YXJnZXQgcGVlci5cbiAgICBBIGxhcmdlIHBhcmdlIG9mIG5lZ290aWF0aW5nIGEgV2ViUlRDIHBlZXIgY29ubmVjdGlvbiBpbnZvbHZlcyBkaXJlY3RcbiAgICBjb21tdW5pY2F0aW9uIGJldHdlZW4gdHdvIHBhcnRpZXMgd2hpY2ggbXVzdCBiZSBkb25lIGJ5IHRoZSBzaWduYWxsaW5nXG4gICAgc2VydmVyLiAgVGhlIGB0b2AgZnVuY3Rpb24gcHJvdmlkZXMgYSBzaW1wbGUgd2F5IHRvIHByb3ZpZGUgYSBsb2dpY2FsXG4gICAgY29tbXVuaWNhdGlvbiBjaGFubmVsIGJldHdlZW4gdGhlIHR3byBwYXJ0aWVzOlxuXG4gICAgYGBganNcbiAgICB2YXIgc2VuZCA9IHNpZ25hbGxlci50bygnZTk1ZmEwNWItOTA2Mi00NWM2LWJmYTItNTA1NWJmNjYyNWY0Jykuc2VuZDtcblxuICAgIC8vIGNyZWF0ZSBhbiBvZmZlciBvbiBhIGxvY2FsIHBlZXIgY29ubmVjdGlvblxuICAgIHBjLmNyZWF0ZU9mZmVyKFxuICAgICAgZnVuY3Rpb24oZGVzYykge1xuICAgICAgICAvLyBzZXQgdGhlIGxvY2FsIGRlc2NyaXB0aW9uIHVzaW5nIHRoZSBvZmZlciBzZHBcbiAgICAgICAgLy8gaWYgdGhpcyBvY2N1cnMgc3VjY2Vzc2Z1bGx5IHNlbmQgdGhpcyB0byBvdXIgcGVlclxuICAgICAgICBwYy5zZXRMb2NhbERlc2NyaXB0aW9uKFxuICAgICAgICAgIGRlc2MsXG4gICAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZW5kKCcvc2RwJywgZGVzYyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBoYW5kbGVGYWlsXG4gICAgICAgICk7XG4gICAgICB9LFxuICAgICAgaGFuZGxlRmFpbFxuICAgICk7XG4gICAgYGBgXG5cbiAgKiovXG4gIHNpZ25hbGxlci50byA9IGZ1bmN0aW9uKHRhcmdldElkKSB7XG4gICAgLy8gY3JlYXRlIGEgc2VuZGVyIHRoYXQgd2lsbCBwcmVwZW5kIG1lc3NhZ2VzIHdpdGggL3RvfHRhcmdldElkfFxuICAgIHZhciBzZW5kZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGdldCB0aGUgcGVlciAoeWVzIHdoZW4gc2VuZCBpcyBjYWxsZWQgdG8gbWFrZSBzdXJlIGl0IGhhc24ndCBsZWZ0KVxuICAgICAgdmFyIHBlZXIgPSBzaWduYWxsZXIucGVlcnMuZ2V0KHRhcmdldElkKTtcbiAgICAgIHZhciBhcmdzO1xuXG4gICAgICBpZiAoISBwZWVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBwZWVyOiAnICsgdGFyZ2V0SWQpO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgcGVlciBpcyBpbmFjdGl2ZSwgdGhlbiBhYm9ydFxuICAgICAgaWYgKHBlZXIuaW5hY3RpdmUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBhcmdzID0gW1xuICAgICAgICAnL3RvJyxcbiAgICAgICAgdGFyZ2V0SWRcbiAgICAgIF0uY29uY2F0KFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cbiAgICAgIC8vIGluamVjdCBtZXRhZGF0YVxuICAgICAgYXJncy5zcGxpY2UoMywgMCwgY3JlYXRlTWV0YWRhdGEoKSk7XG4gICAgICBidWZmZXJNZXNzYWdlKGFyZ3MpO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgYW5ub3VuY2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIHNpZ25hbGxlci5hbm5vdW5jZShkYXRhLCBzZW5kZXIpO1xuICAgICAgfSxcblxuICAgICAgc2VuZDogc2VuZGVyLFxuICAgIH07XG4gIH07XG5cbiAgLy8gaW5pdGlhbGlzZSBvcHRzIGRlZmF1bHRzXG4gIG9wdHMgPSBkZWZhdWx0cyh7fSwgb3B0cywgcmVxdWlyZSgnLi9kZWZhdWx0cycpKTtcblxuICAvLyBzZXQgdGhlIGF1dG9yZXBseSBmbGFnXG4gIHNpZ25hbGxlci5hdXRvcmVwbHkgPSBhdXRvcmVwbHkgPT09IHVuZGVmaW5lZCB8fCBhdXRvcmVwbHk7XG5cbiAgLy8gY3JlYXRlIHRoZSBwcm9jZXNzb3JcbiAgc2lnbmFsbGVyLnByb2Nlc3MgPSBwcm9jZXNzb3IgPSByZXF1aXJlKCcuL3Byb2Nlc3NvcicpKHNpZ25hbGxlciwgb3B0cyk7XG5cbiAgLy8gYXV0b2Nvbm5lY3RcbiAgaWYgKGF1dG9jb25uZWN0ID09PSB1bmRlZmluZWQgfHwgYXV0b2Nvbm5lY3QpIHtcbiAgICBjb25uZWN0KCk7XG4gIH1cblxuICByZXR1cm4gc2lnbmFsbGVyO1xufTtcbiIsIi8qKlxuICogY3VpZC5qc1xuICogQ29sbGlzaW9uLXJlc2lzdGFudCBVSUQgZ2VuZXJhdG9yIGZvciBicm93c2VycyBhbmQgbm9kZS5cbiAqIFNlcXVlbnRpYWwgZm9yIGZhc3QgZGIgbG9va3VwcyBhbmQgcmVjZW5jeSBzb3J0aW5nLlxuICogU2FmZSBmb3IgZWxlbWVudCBJRHMgYW5kIHNlcnZlci1zaWRlIGxvb2t1cHMuXG4gKlxuICogRXh0cmFjdGVkIGZyb20gQ0xDVFJcbiAqIFxuICogQ29weXJpZ2h0IChjKSBFcmljIEVsbGlvdHQgMjAxMlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKmdsb2JhbCB3aW5kb3csIG5hdmlnYXRvciwgZG9jdW1lbnQsIHJlcXVpcmUsIHByb2Nlc3MsIG1vZHVsZSAqL1xuKGZ1bmN0aW9uIChhcHApIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICB2YXIgbmFtZXNwYWNlID0gJ2N1aWQnLFxuICAgIGMgPSAwLFxuICAgIGJsb2NrU2l6ZSA9IDQsXG4gICAgYmFzZSA9IDM2LFxuICAgIGRpc2NyZXRlVmFsdWVzID0gTWF0aC5wb3coYmFzZSwgYmxvY2tTaXplKSxcblxuICAgIHBhZCA9IGZ1bmN0aW9uIHBhZChudW0sIHNpemUpIHtcbiAgICAgIHZhciBzID0gXCIwMDAwMDAwMDBcIiArIG51bTtcbiAgICAgIHJldHVybiBzLnN1YnN0cihzLmxlbmd0aC1zaXplKTtcbiAgICB9LFxuXG4gICAgcmFuZG9tQmxvY2sgPSBmdW5jdGlvbiByYW5kb21CbG9jaygpIHtcbiAgICAgIHJldHVybiBwYWQoKE1hdGgucmFuZG9tKCkgKlxuICAgICAgICAgICAgZGlzY3JldGVWYWx1ZXMgPDwgMClcbiAgICAgICAgICAgIC50b1N0cmluZyhiYXNlKSwgYmxvY2tTaXplKTtcbiAgICB9LFxuXG4gICAgc2FmZUNvdW50ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjID0gKGMgPCBkaXNjcmV0ZVZhbHVlcykgPyBjIDogMDtcbiAgICAgIGMrKzsgLy8gdGhpcyBpcyBub3Qgc3VibGltaW5hbFxuICAgICAgcmV0dXJuIGMgLSAxO1xuICAgIH0sXG5cbiAgICBhcGkgPSBmdW5jdGlvbiBjdWlkKCkge1xuICAgICAgLy8gU3RhcnRpbmcgd2l0aCBhIGxvd2VyY2FzZSBsZXR0ZXIgbWFrZXNcbiAgICAgIC8vIGl0IEhUTUwgZWxlbWVudCBJRCBmcmllbmRseS5cbiAgICAgIHZhciBsZXR0ZXIgPSAnYycsIC8vIGhhcmQtY29kZWQgYWxsb3dzIGZvciBzZXF1ZW50aWFsIGFjY2Vzc1xuXG4gICAgICAgIC8vIHRpbWVzdGFtcFxuICAgICAgICAvLyB3YXJuaW5nOiB0aGlzIGV4cG9zZXMgdGhlIGV4YWN0IGRhdGUgYW5kIHRpbWVcbiAgICAgICAgLy8gdGhhdCB0aGUgdWlkIHdhcyBjcmVhdGVkLlxuICAgICAgICB0aW1lc3RhbXAgPSAobmV3IERhdGUoKS5nZXRUaW1lKCkpLnRvU3RyaW5nKGJhc2UpLFxuXG4gICAgICAgIC8vIFByZXZlbnQgc2FtZS1tYWNoaW5lIGNvbGxpc2lvbnMuXG4gICAgICAgIGNvdW50ZXIsXG5cbiAgICAgICAgLy8gQSBmZXcgY2hhcnMgdG8gZ2VuZXJhdGUgZGlzdGluY3QgaWRzIGZvciBkaWZmZXJlbnRcbiAgICAgICAgLy8gY2xpZW50cyAoc28gZGlmZmVyZW50IGNvbXB1dGVycyBhcmUgZmFyIGxlc3NcbiAgICAgICAgLy8gbGlrZWx5IHRvIGdlbmVyYXRlIHRoZSBzYW1lIGlkKVxuICAgICAgICBmaW5nZXJwcmludCA9IGFwaS5maW5nZXJwcmludCgpLFxuXG4gICAgICAgIC8vIEdyYWIgc29tZSBtb3JlIGNoYXJzIGZyb20gTWF0aC5yYW5kb20oKVxuICAgICAgICByYW5kb20gPSByYW5kb21CbG9jaygpICsgcmFuZG9tQmxvY2soKTtcblxuICAgICAgICBjb3VudGVyID0gcGFkKHNhZmVDb3VudGVyKCkudG9TdHJpbmcoYmFzZSksIGJsb2NrU2l6ZSk7XG5cbiAgICAgIHJldHVybiAgKGxldHRlciArIHRpbWVzdGFtcCArIGNvdW50ZXIgKyBmaW5nZXJwcmludCArIHJhbmRvbSk7XG4gICAgfTtcblxuICBhcGkuc2x1ZyA9IGZ1bmN0aW9uIHNsdWcoKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygzNiksXG4gICAgICBjb3VudGVyLFxuICAgICAgcHJpbnQgPSBhcGkuZmluZ2VycHJpbnQoKS5zbGljZSgwLDEpICtcbiAgICAgICAgYXBpLmZpbmdlcnByaW50KCkuc2xpY2UoLTEpLFxuICAgICAgcmFuZG9tID0gcmFuZG9tQmxvY2soKS5zbGljZSgtMik7XG5cbiAgICAgIGNvdW50ZXIgPSBzYWZlQ291bnRlcigpLnRvU3RyaW5nKDM2KS5zbGljZSgtNCk7XG5cbiAgICByZXR1cm4gZGF0ZS5zbGljZSgtMikgKyBcbiAgICAgIGNvdW50ZXIgKyBwcmludCArIHJhbmRvbTtcbiAgfTtcblxuICBhcGkuZ2xvYmFsQ291bnQgPSBmdW5jdGlvbiBnbG9iYWxDb3VudCgpIHtcbiAgICAvLyBXZSB3YW50IHRvIGNhY2hlIHRoZSByZXN1bHRzIG9mIHRoaXNcbiAgICB2YXIgY2FjaGUgPSAoZnVuY3Rpb24gY2FsYygpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgY291bnQgPSAwO1xuXG4gICAgICAgIGZvciAoaSBpbiB3aW5kb3cpIHtcbiAgICAgICAgICBjb3VudCsrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgICAgfSgpKTtcblxuICAgIGFwaS5nbG9iYWxDb3VudCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNhY2hlOyB9O1xuICAgIHJldHVybiBjYWNoZTtcbiAgfTtcblxuICBhcGkuZmluZ2VycHJpbnQgPSBmdW5jdGlvbiBicm93c2VyUHJpbnQoKSB7XG4gICAgcmV0dXJuIHBhZCgobmF2aWdhdG9yLm1pbWVUeXBlcy5sZW5ndGggK1xuICAgICAgbmF2aWdhdG9yLnVzZXJBZ2VudC5sZW5ndGgpLnRvU3RyaW5nKDM2KSArXG4gICAgICBhcGkuZ2xvYmFsQ291bnQoKS50b1N0cmluZygzNiksIDQpO1xuICB9O1xuXG4gIC8vIGRvbid0IGNoYW5nZSBhbnl0aGluZyBmcm9tIGhlcmUgZG93bi5cbiAgaWYgKGFwcC5yZWdpc3Rlcikge1xuICAgIGFwcC5yZWdpc3RlcihuYW1lc3BhY2UsIGFwaSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiAgfSBlbHNlIHtcbiAgICBhcHBbbmFtZXNwYWNlXSA9IGFwaTtcbiAgfVxuXG59KHRoaXMuYXBwbGl0dWRlIHx8IHRoaXMpKTtcbiIsInZhciBwdWxsID0gcmVxdWlyZSgncHVsbC1zdHJlYW0nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHB1bGwuU291cmNlKGZ1bmN0aW9uIChvbkNsb3NlKSB7XG4gIHZhciBidWZmZXIgPSBbXSwgY2JzID0gW10sIHdhaXRpbmcgPSBbXSwgZW5kZWRcblxuICBmdW5jdGlvbiBkcmFpbigpIHtcbiAgICB2YXIgbFxuICAgIHdoaWxlKHdhaXRpbmcubGVuZ3RoICYmICgobCA9IGJ1ZmZlci5sZW5ndGgpIHx8IGVuZGVkKSkge1xuICAgICAgdmFyIGRhdGEgPSBidWZmZXIuc2hpZnQoKVxuICAgICAgdmFyIGNiICAgPSBjYnMuc2hpZnQoKVxuICAgICAgd2FpdGluZy5zaGlmdCgpKGwgPyBudWxsIDogZW5kZWQsIGRhdGEpXG4gICAgICBjYiAmJiBjYihlbmRlZCA9PT0gdHJ1ZSA/IG51bGwgOiBlbmRlZClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChlbmQsIGNiKSB7XG4gICAgZW5kZWQgPSBlbmRlZCB8fCBlbmRcbiAgICB3YWl0aW5nLnB1c2goY2IpXG4gICAgZHJhaW4oKVxuICAgIGlmKGVuZGVkKVxuICAgICAgb25DbG9zZSAmJiBvbkNsb3NlKGVuZGVkID09PSB0cnVlID8gbnVsbCA6IGVuZGVkKVxuICB9XG5cbiAgcmVhZC5wdXNoID0gZnVuY3Rpb24gKGRhdGEsIGNiKSB7XG4gICAgaWYoZW5kZWQpXG4gICAgICByZXR1cm4gY2IgJiYgY2IoZW5kZWQgPT09IHRydWUgPyBudWxsIDogZW5kZWQpXG4gICAgYnVmZmVyLnB1c2goZGF0YSk7IGNicy5wdXNoKGNiKVxuICAgIGRyYWluKClcbiAgfVxuXG4gIHJlYWQuZW5kID0gZnVuY3Rpb24gKGVuZCwgY2IpIHtcbiAgICBpZignZnVuY3Rpb24nID09PSB0eXBlb2YgZW5kKVxuICAgICAgY2IgPSBlbmQsIGVuZCA9IHRydWVcbiAgICBlbmRlZCA9IGVuZGVkIHx8IGVuZCB8fCB0cnVlO1xuICAgIGlmKGNiKSBjYnMucHVzaChjYilcbiAgICBkcmFpbigpXG4gICAgaWYoZW5kZWQpXG4gICAgICBvbkNsb3NlICYmIG9uQ2xvc2UoZW5kZWQgPT09IHRydWUgPyBudWxsIDogZW5kZWQpXG4gIH1cblxuICByZXR1cm4gcmVhZFxufSlcblxuIiwiXG52YXIgc291cmNlcyAgPSByZXF1aXJlKCcuL3NvdXJjZXMnKVxudmFyIHNpbmtzICAgID0gcmVxdWlyZSgnLi9zaW5rcycpXG52YXIgdGhyb3VnaHMgPSByZXF1aXJlKCcuL3Rocm91Z2hzJylcbnZhciB1ICAgICAgICA9IHJlcXVpcmUoJ3B1bGwtY29yZScpXG5cbmZvcih2YXIgayBpbiBzb3VyY2VzKVxuICBleHBvcnRzW2tdID0gdS5Tb3VyY2Uoc291cmNlc1trXSlcblxuZm9yKHZhciBrIGluIHRocm91Z2hzKVxuICBleHBvcnRzW2tdID0gdS5UaHJvdWdoKHRocm91Z2hzW2tdKVxuXG5mb3IodmFyIGsgaW4gc2lua3MpXG4gIGV4cG9ydHNba10gPSB1LlNpbmsoc2lua3Nba10pXG5cbnZhciBtYXliZSA9IHJlcXVpcmUoJy4vbWF5YmUnKShleHBvcnRzKVxuXG5mb3IodmFyIGsgaW4gbWF5YmUpXG4gIGV4cG9ydHNba10gPSBtYXliZVtrXVxuXG5leHBvcnRzLkR1cGxleCAgPSBcbmV4cG9ydHMuVGhyb3VnaCA9IGV4cG9ydHMucGlwZWFibGUgICAgICAgPSB1LlRocm91Z2hcbmV4cG9ydHMuU291cmNlICA9IGV4cG9ydHMucGlwZWFibGVTb3VyY2UgPSB1LlNvdXJjZVxuZXhwb3J0cy5TaW5rICAgID0gZXhwb3J0cy5waXBlYWJsZVNpbmsgICA9IHUuU2lua1xuXG5cbiIsInZhciB1ID0gcmVxdWlyZSgncHVsbC1jb3JlJylcbnZhciBwcm9wID0gdS5wcm9wXG52YXIgaWQgICA9IHUuaWRcbnZhciBtYXliZVNpbmsgPSB1Lm1heWJlU2lua1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwdWxsKSB7XG5cbiAgdmFyIGV4cG9ydHMgPSB7fVxuICB2YXIgZHJhaW4gPSBwdWxsLmRyYWluXG5cbiAgdmFyIGZpbmQgPSBcbiAgZXhwb3J0cy5maW5kID0gZnVuY3Rpb24gKHRlc3QsIGNiKSB7XG4gICAgcmV0dXJuIG1heWJlU2luayhmdW5jdGlvbiAoY2IpIHtcbiAgICAgIHZhciBlbmRlZCA9IGZhbHNlXG4gICAgICBpZighY2IpXG4gICAgICAgIGNiID0gdGVzdCwgdGVzdCA9IGlkXG4gICAgICBlbHNlXG4gICAgICAgIHRlc3QgPSBwcm9wKHRlc3QpIHx8IGlkXG5cbiAgICAgIHJldHVybiBkcmFpbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBpZih0ZXN0KGRhdGEpKSB7XG4gICAgICAgICAgZW5kZWQgPSB0cnVlXG4gICAgICAgICAgY2IobnVsbCwgZGF0YSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYoZW5kZWQpIHJldHVybiAvL2FscmVhZHkgY2FsbGVkIGJhY2tcbiAgICAgICAgY2IoZXJyID09PSB0cnVlID8gbnVsbCA6IGVyciwgbnVsbClcbiAgICAgIH0pXG5cbiAgICB9LCBjYilcbiAgfVxuXG4gIHZhciByZWR1Y2UgPSBleHBvcnRzLnJlZHVjZSA9IFxuICBmdW5jdGlvbiAocmVkdWNlLCBhY2MsIGNiKSB7XG4gICAgXG4gICAgcmV0dXJuIG1heWJlU2luayhmdW5jdGlvbiAoY2IpIHtcbiAgICAgIHJldHVybiBkcmFpbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBhY2MgPSByZWR1Y2UoYWNjLCBkYXRhKVxuICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICBjYihlcnIsIGFjYylcbiAgICAgIH0pXG5cbiAgICB9LCBjYilcbiAgfVxuXG4gIHZhciBjb2xsZWN0ID0gZXhwb3J0cy5jb2xsZWN0ID0gZXhwb3J0cy53cml0ZUFycmF5ID1cbiAgZnVuY3Rpb24gKGNiKSB7XG4gICAgcmV0dXJuIHJlZHVjZShmdW5jdGlvbiAoYXJyLCBpdGVtKSB7XG4gICAgICBhcnIucHVzaChpdGVtKVxuICAgICAgcmV0dXJuIGFyclxuICAgIH0sIFtdLCBjYilcbiAgfVxuXG4gIHJldHVybiBleHBvcnRzXG59XG4iLCJleHBvcnRzLmlkID0gXG5mdW5jdGlvbiAoaXRlbSkge1xuICByZXR1cm4gaXRlbVxufVxuXG5leHBvcnRzLnByb3AgPSBcbmZ1bmN0aW9uIChtYXApIHsgIFxuICBpZignc3RyaW5nJyA9PSB0eXBlb2YgbWFwKSB7XG4gICAgdmFyIGtleSA9IG1hcFxuICAgIHJldHVybiBmdW5jdGlvbiAoZGF0YSkgeyByZXR1cm4gZGF0YVtrZXldIH1cbiAgfVxuICByZXR1cm4gbWFwXG59XG5cbmV4cG9ydHMudGVzdGVyID0gZnVuY3Rpb24gKHRlc3QpIHtcbiAgaWYoIXRlc3QpIHJldHVybiBleHBvcnRzLmlkXG4gIGlmKCdvYmplY3QnID09PSB0eXBlb2YgdGVzdFxuICAgICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiB0ZXN0LnRlc3QpXG4gICAgICByZXR1cm4gdGVzdC50ZXN0LmJpbmQodGVzdClcbiAgcmV0dXJuIGV4cG9ydHMucHJvcCh0ZXN0KSB8fCBleHBvcnRzLmlkXG59XG5cbmV4cG9ydHMuYWRkUGlwZSA9IGFkZFBpcGVcblxuZnVuY3Rpb24gYWRkUGlwZShyZWFkKSB7XG4gIGlmKCdmdW5jdGlvbicgIT09IHR5cGVvZiByZWFkKVxuICAgIHJldHVybiByZWFkXG5cbiAgcmVhZC5waXBlID0gcmVhZC5waXBlIHx8IGZ1bmN0aW9uIChyZWFkZXIpIHtcbiAgICBpZignZnVuY3Rpb24nICE9IHR5cGVvZiByZWFkZXIpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ211c3QgcGlwZSB0byByZWFkZXInKVxuICAgIHJldHVybiBhZGRQaXBlKHJlYWRlcihyZWFkKSlcbiAgfVxuICByZWFkLnR5cGUgPSAnU291cmNlJ1xuICByZXR1cm4gcmVhZFxufVxuXG52YXIgU291cmNlID1cbmV4cG9ydHMuU291cmNlID1cbmZ1bmN0aW9uIFNvdXJjZSAoY3JlYXRlUmVhZCkge1xuICBmdW5jdGlvbiBzKCkge1xuICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMpXG4gICAgcmV0dXJuIGFkZFBpcGUoY3JlYXRlUmVhZC5hcHBseShudWxsLCBhcmdzKSlcbiAgfVxuICBzLnR5cGUgPSAnU291cmNlJ1xuICByZXR1cm4gc1xufVxuXG5cbnZhciBUaHJvdWdoID1cbmV4cG9ydHMuVGhyb3VnaCA9IFxuZnVuY3Rpb24gKGNyZWF0ZVJlYWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIHZhciBwaXBlZCA9IFtdXG4gICAgZnVuY3Rpb24gcmVhZGVyIChyZWFkKSB7XG4gICAgICBhcmdzLnVuc2hpZnQocmVhZClcbiAgICAgIHJlYWQgPSBjcmVhdGVSZWFkLmFwcGx5KG51bGwsIGFyZ3MpXG4gICAgICB3aGlsZShwaXBlZC5sZW5ndGgpXG4gICAgICAgIHJlYWQgPSBwaXBlZC5zaGlmdCgpKHJlYWQpXG4gICAgICByZXR1cm4gcmVhZFxuICAgICAgLy9waXBlaW5nIHRvIGZyb20gdGhpcyByZWFkZXIgc2hvdWxkIGNvbXBvc2UuLi5cbiAgICB9XG4gICAgcmVhZGVyLnBpcGUgPSBmdW5jdGlvbiAocmVhZCkge1xuICAgICAgcGlwZWQucHVzaChyZWFkKSBcbiAgICAgIGlmKHJlYWQudHlwZSA9PT0gJ1NvdXJjZScpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignY2Fubm90IHBpcGUgJyArIHJlYWRlci50eXBlICsgJyB0byBTb3VyY2UnKVxuICAgICAgcmVhZGVyLnR5cGUgPSByZWFkLnR5cGUgPT09ICdTaW5rJyA/ICdTaW5rJyA6ICdUaHJvdWdoJ1xuICAgICAgcmV0dXJuIHJlYWRlclxuICAgIH1cbiAgICByZWFkZXIudHlwZSA9ICdUaHJvdWdoJ1xuICAgIHJldHVybiByZWFkZXJcbiAgfVxufVxuXG52YXIgU2luayA9XG5leHBvcnRzLlNpbmsgPSBcbmZ1bmN0aW9uIFNpbmsoY3JlYXRlUmVhZGVyKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICBpZighY3JlYXRlUmVhZGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdtdXN0IGJlIGNyZWF0ZVJlYWRlciBmdW5jdGlvbicpXG4gICAgZnVuY3Rpb24gcyAocmVhZCkge1xuICAgICAgYXJncy51bnNoaWZ0KHJlYWQpXG4gICAgICByZXR1cm4gY3JlYXRlUmVhZGVyLmFwcGx5KG51bGwsIGFyZ3MpXG4gICAgfVxuICAgIHMudHlwZSA9ICdTaW5rJ1xuICAgIHJldHVybiBzXG4gIH1cbn1cblxuXG5leHBvcnRzLm1heWJlU2luayA9IFxuZXhwb3J0cy5tYXliZURyYWluID0gXG5mdW5jdGlvbiAoY3JlYXRlU2luaywgY2IpIHtcbiAgaWYoIWNiKVxuICAgIHJldHVybiBUaHJvdWdoKGZ1bmN0aW9uIChyZWFkKSB7XG4gICAgICB2YXIgZW5kZWRcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoY2xvc2UsIGNiKSB7XG4gICAgICAgIGlmKGNsb3NlKSByZXR1cm4gcmVhZChjbG9zZSwgY2IpXG4gICAgICAgIGlmKGVuZGVkKSByZXR1cm4gY2IoZW5kZWQpXG5cbiAgICAgICAgY3JlYXRlU2luayhmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgZW5kZWQgPSBlcnIgfHwgdHJ1ZVxuICAgICAgICAgIGlmKCFlcnIpIGNiKG51bGwsIGRhdGEpXG4gICAgICAgICAgZWxzZSAgICAgY2IoZW5kZWQpXG4gICAgICAgIH0pIChyZWFkKVxuICAgICAgfVxuICAgIH0pKClcblxuICByZXR1cm4gU2luayhmdW5jdGlvbiAocmVhZCkge1xuICAgIHJldHVybiBjcmVhdGVTaW5rKGNiKSAocmVhZClcbiAgfSkoKVxufVxuXG4iLCJ2YXIgZHJhaW4gPSBleHBvcnRzLmRyYWluID0gZnVuY3Rpb24gKHJlYWQsIG9wLCBkb25lKSB7XG5cbiAgOyhmdW5jdGlvbiBuZXh0KCkge1xuICAgIHZhciBsb29wID0gdHJ1ZSwgY2JlZCA9IGZhbHNlXG4gICAgd2hpbGUobG9vcCkge1xuICAgICAgY2JlZCA9IGZhbHNlXG4gICAgICByZWFkKG51bGwsIGZ1bmN0aW9uIChlbmQsIGRhdGEpIHtcbiAgICAgICAgY2JlZCA9IHRydWVcbiAgICAgICAgaWYoZW5kKSB7XG4gICAgICAgICAgbG9vcCA9IGZhbHNlXG4gICAgICAgICAgZG9uZSAmJiBkb25lKGVuZCA9PT0gdHJ1ZSA/IG51bGwgOiBlbmQpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihvcCAmJiBmYWxzZSA9PT0gb3AoZGF0YSkpIHtcbiAgICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgICByZWFkKHRydWUsIGRvbmUgfHwgZnVuY3Rpb24gKCkge30pXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZighbG9vcCl7XG4gICAgICAgICAgbmV4dCgpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBpZighY2JlZCkge1xuICAgICAgICBsb29wID0gZmFsc2VcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICB9KSgpXG59XG5cbnZhciBvbkVuZCA9IGV4cG9ydHMub25FbmQgPSBmdW5jdGlvbiAocmVhZCwgZG9uZSkge1xuICByZXR1cm4gZHJhaW4ocmVhZCwgbnVsbCwgZG9uZSlcbn1cblxudmFyIGxvZyA9IGV4cG9ydHMubG9nID0gZnVuY3Rpb24gKHJlYWQsIGRvbmUpIHtcbiAgcmV0dXJuIGRyYWluKHJlYWQsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgY29uc29sZS5sb2coZGF0YSlcbiAgfSwgZG9uZSlcbn1cblxuIiwiXG52YXIga2V5cyA9IGV4cG9ydHMua2V5cyA9XG5mdW5jdGlvbiAob2JqZWN0KSB7XG4gIHJldHVybiB2YWx1ZXMoT2JqZWN0LmtleXMob2JqZWN0KSlcbn1cblxudmFyIG9uY2UgPSBleHBvcnRzLm9uY2UgPVxuZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoYWJvcnQsIGNiKSB7XG4gICAgaWYoYWJvcnQpIHJldHVybiBjYihhYm9ydClcbiAgICBpZih2YWx1ZSAhPSBudWxsKSB7XG4gICAgICB2YXIgX3ZhbHVlID0gdmFsdWU7IHZhbHVlID0gbnVsbFxuICAgICAgY2IobnVsbCwgX3ZhbHVlKVxuICAgIH0gZWxzZVxuICAgICAgY2IodHJ1ZSlcbiAgfVxufVxuXG52YXIgdmFsdWVzID0gZXhwb3J0cy52YWx1ZXMgPSBleHBvcnRzLnJlYWRBcnJheSA9XG5mdW5jdGlvbiAoYXJyYXkpIHtcbiAgaWYoIUFycmF5LmlzQXJyYXkoYXJyYXkpKVxuICAgIGFycmF5ID0gT2JqZWN0LmtleXMoYXJyYXkpLm1hcChmdW5jdGlvbiAoaykge1xuICAgICAgcmV0dXJuIGFycmF5W2tdXG4gICAgfSlcbiAgdmFyIGkgPSAwXG4gIHJldHVybiBmdW5jdGlvbiAoZW5kLCBjYikge1xuICAgIGlmKGVuZClcbiAgICAgIHJldHVybiBjYiAmJiBjYihlbmQpICBcbiAgICBjYihpID49IGFycmF5Lmxlbmd0aCB8fCBudWxsLCBhcnJheVtpKytdKVxuICB9XG59XG5cblxudmFyIGNvdW50ID0gZXhwb3J0cy5jb3VudCA9IFxuZnVuY3Rpb24gKG1heCkge1xuICB2YXIgaSA9IDA7IG1heCA9IG1heCB8fCBJbmZpbml0eVxuICByZXR1cm4gZnVuY3Rpb24gKGVuZCwgY2IpIHtcbiAgICBpZihlbmQpIHJldHVybiBjYiAmJiBjYihlbmQpXG4gICAgaWYoaSA+IG1heClcbiAgICAgIHJldHVybiBjYih0cnVlKVxuICAgIGNiKG51bGwsIGkrKylcbiAgfVxufVxuXG52YXIgaW5maW5pdGUgPSBleHBvcnRzLmluZmluaXRlID0gXG5mdW5jdGlvbiAoZ2VuZXJhdGUpIHtcbiAgZ2VuZXJhdGUgPSBnZW5lcmF0ZSB8fCBNYXRoLnJhbmRvbVxuICByZXR1cm4gZnVuY3Rpb24gKGVuZCwgY2IpIHtcbiAgICBpZihlbmQpIHJldHVybiBjYiAmJiBjYihlbmQpXG4gICAgcmV0dXJuIGNiKG51bGwsIGdlbmVyYXRlKCkpXG4gIH1cbn1cblxudmFyIGRlZmVyID0gZXhwb3J0cy5kZWZlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIF9yZWFkLCBjYnMgPSBbXSwgX2VuZFxuXG4gIHZhciByZWFkID0gZnVuY3Rpb24gKGVuZCwgY2IpIHtcbiAgICBpZighX3JlYWQpIHtcbiAgICAgIF9lbmQgPSBlbmRcbiAgICAgIGNicy5wdXNoKGNiKVxuICAgIH0gXG4gICAgZWxzZSBfcmVhZChlbmQsIGNiKVxuICB9XG4gIHJlYWQucmVzb2x2ZSA9IGZ1bmN0aW9uIChyZWFkKSB7XG4gICAgaWYoX3JlYWQpIHRocm93IG5ldyBFcnJvcignYWxyZWFkeSByZXNvbHZlZCcpXG4gICAgX3JlYWQgPSByZWFkXG4gICAgaWYoIV9yZWFkKSB0aHJvdyBuZXcgRXJyb3IoJ25vIHJlYWQgY2Fubm90IHJlc29sdmUhJyArIF9yZWFkKVxuICAgIHdoaWxlKGNicy5sZW5ndGgpXG4gICAgICBfcmVhZChfZW5kLCBjYnMuc2hpZnQoKSlcbiAgfVxuICByZWFkLmFib3J0ID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgcmVhZC5yZXNvbHZlKGZ1bmN0aW9uIChfLCBjYikge1xuICAgICAgY2IoZXJyIHx8IHRydWUpXG4gICAgfSlcbiAgfVxuICByZXR1cm4gcmVhZFxufVxuXG52YXIgZW1wdHkgPSBleHBvcnRzLmVtcHR5ID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZnVuY3Rpb24gKGFib3J0LCBjYikge1xuICAgIGNiKHRydWUpXG4gIH1cbn1cblxudmFyIGRlcHRoRmlyc3QgPSBleHBvcnRzLmRlcHRoRmlyc3QgPVxuZnVuY3Rpb24gKHN0YXJ0LCBjcmVhdGVTdHJlYW0pIHtcbiAgdmFyIHJlYWRzID0gW11cblxuICByZWFkcy51bnNoaWZ0KG9uY2Uoc3RhcnQpKVxuXG4gIHJldHVybiBmdW5jdGlvbiBuZXh0IChlbmQsIGNiKSB7XG4gICAgaWYoIXJlYWRzLmxlbmd0aClcbiAgICAgIHJldHVybiBjYih0cnVlKVxuICAgIHJlYWRzWzBdKGVuZCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgaWYoZW5kKSB7XG4gICAgICAgIC8vaWYgdGhpcyBzdHJlYW0gaGFzIGVuZGVkLCBnbyB0byB0aGUgbmV4dCBxdWV1ZVxuICAgICAgICByZWFkcy5zaGlmdCgpXG4gICAgICAgIHJldHVybiBuZXh0KG51bGwsIGNiKVxuICAgICAgfVxuICAgICAgcmVhZHMudW5zaGlmdChjcmVhdGVTdHJlYW0oZGF0YSkpXG4gICAgICBjYihlbmQsIGRhdGEpXG4gICAgfSlcbiAgfVxufVxuLy93aWR0aCBmaXJzdCBpcyBqdXN0IGxpa2UgZGVwdGggZmlyc3QsXG4vL2J1dCBwdXNoIGVhY2ggbmV3IHN0cmVhbSBvbnRvIHRoZSBlbmQgb2YgdGhlIHF1ZXVlXG52YXIgd2lkdGhGaXJzdCA9IGV4cG9ydHMud2lkdGhGaXJzdCA9IFxuZnVuY3Rpb24gKHN0YXJ0LCBjcmVhdGVTdHJlYW0pIHtcbiAgdmFyIHJlYWRzID0gW11cblxuICByZWFkcy5wdXNoKG9uY2Uoc3RhcnQpKVxuXG4gIHJldHVybiBmdW5jdGlvbiBuZXh0IChlbmQsIGNiKSB7XG4gICAgaWYoIXJlYWRzLmxlbmd0aClcbiAgICAgIHJldHVybiBjYih0cnVlKVxuICAgIHJlYWRzWzBdKGVuZCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgaWYoZW5kKSB7XG4gICAgICAgIHJlYWRzLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIG5leHQobnVsbCwgY2IpXG4gICAgICB9XG4gICAgICByZWFkcy5wdXNoKGNyZWF0ZVN0cmVhbShkYXRhKSlcbiAgICAgIGNiKGVuZCwgZGF0YSlcbiAgICB9KVxuICB9XG59XG5cbi8vdGhpcyBjYW1lIG91dCBkaWZmZXJlbnQgdG8gdGhlIGZpcnN0IChzdHJtKVxuLy9hdHRlbXB0IGF0IGxlYWZGaXJzdCwgYnV0IGl0J3Mgc3RpbGwgYSB2YWxpZFxuLy90b3BvbG9naWNhbCBzb3J0LlxudmFyIGxlYWZGaXJzdCA9IGV4cG9ydHMubGVhZkZpcnN0ID0gXG5mdW5jdGlvbiAoc3RhcnQsIGNyZWF0ZVN0cmVhbSkge1xuICB2YXIgcmVhZHMgPSBbXVxuICB2YXIgb3V0cHV0ID0gW11cbiAgcmVhZHMucHVzaChvbmNlKHN0YXJ0KSlcbiAgXG4gIHJldHVybiBmdW5jdGlvbiBuZXh0IChlbmQsIGNiKSB7XG4gICAgcmVhZHNbMF0oZW5kLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmQpIHtcbiAgICAgICAgcmVhZHMuc2hpZnQoKVxuICAgICAgICBpZighb3V0cHV0Lmxlbmd0aClcbiAgICAgICAgICByZXR1cm4gY2IodHJ1ZSlcbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIG91dHB1dC5zaGlmdCgpKVxuICAgICAgfVxuICAgICAgcmVhZHMudW5zaGlmdChjcmVhdGVTdHJlYW0oZGF0YSkpXG4gICAgICBvdXRwdXQudW5zaGlmdChkYXRhKVxuICAgICAgbmV4dChudWxsLCBjYilcbiAgICB9KVxuICB9XG59XG5cbiIsInZhciB1ICAgICAgPSByZXF1aXJlKCdwdWxsLWNvcmUnKVxudmFyIHNvdXJjZXMgPSByZXF1aXJlKCcuL3NvdXJjZXMnKVxudmFyIHNpbmtzID0gcmVxdWlyZSgnLi9zaW5rcycpXG5cbnZhciBwcm9wICAgPSB1LnByb3BcbnZhciBpZCAgICAgPSB1LmlkXG52YXIgdGVzdGVyID0gdS50ZXN0ZXJcblxudmFyIG1hcCA9IGV4cG9ydHMubWFwID0gXG5mdW5jdGlvbiAocmVhZCwgbWFwKSB7XG4gIG1hcCA9IHByb3AobWFwKSB8fCBpZFxuICByZXR1cm4gZnVuY3Rpb24gKGVuZCwgY2IpIHtcbiAgICByZWFkKGVuZCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgdmFyIGRhdGEgPSAhZW5kID8gbWFwKGRhdGEpIDogbnVsbFxuICAgICAgY2IoZW5kLCBkYXRhKVxuICAgIH0pXG4gIH1cbn1cblxudmFyIGFzeW5jTWFwID0gZXhwb3J0cy5hc3luY01hcCA9XG5mdW5jdGlvbiAocmVhZCwgbWFwKSB7XG4gIGlmKCFtYXApIHJldHVybiByZWFkXG4gIHJldHVybiBmdW5jdGlvbiAoZW5kLCBjYikge1xuICAgIGlmKGVuZCkgcmV0dXJuIHJlYWQoZW5kLCBjYikgLy9hYm9ydFxuICAgIHJlYWQobnVsbCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgaWYoZW5kKSByZXR1cm4gY2IoZW5kLCBkYXRhKVxuICAgICAgbWFwKGRhdGEsIGNiKVxuICAgIH0pXG4gIH1cbn1cblxudmFyIHBhcmFNYXAgPSBleHBvcnRzLnBhcmFNYXAgPVxuZnVuY3Rpb24gKHJlYWQsIG1hcCwgd2lkdGgpIHtcbiAgaWYoIW1hcCkgcmV0dXJuIHJlYWRcbiAgdmFyIGVuZGVkID0gZmFsc2UsIHF1ZXVlID0gW10sIF9jYlxuXG4gIGZ1bmN0aW9uIGRyYWluICgpIHtcbiAgICBpZighX2NiKSByZXR1cm5cbiAgICB2YXIgY2IgPSBfY2JcbiAgICBfY2IgPSBudWxsXG4gICAgaWYocXVldWUubGVuZ3RoKVxuICAgICAgcmV0dXJuIGNiKG51bGwsIHF1ZXVlLnNoaWZ0KCkpXG4gICAgZWxzZSBpZihlbmRlZCAmJiAhbilcbiAgICAgIHJldHVybiBjYihlbmRlZClcbiAgICBfY2IgPSBjYlxuICB9XG5cbiAgZnVuY3Rpb24gcHVsbCAoKSB7XG4gICAgcmVhZChudWxsLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmQpIHtcbiAgICAgICAgZW5kZWQgPSBlbmRcbiAgICAgICAgcmV0dXJuIGRyYWluKClcbiAgICAgIH1cbiAgICAgIG4rK1xuICAgICAgbWFwKGRhdGEsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgICAgbi0tXG5cbiAgICAgICAgcXVldWUucHVzaChkYXRhKVxuICAgICAgICBkcmFpbigpXG4gICAgICB9KVxuXG4gICAgICBpZihuIDwgd2lkdGggJiYgIWVuZGVkKVxuICAgICAgICBwdWxsKClcbiAgICB9KVxuICB9XG5cbiAgdmFyIG4gPSAwXG4gIHJldHVybiBmdW5jdGlvbiAoZW5kLCBjYikge1xuICAgIGlmKGVuZCkgcmV0dXJuIHJlYWQoZW5kLCBjYikgLy9hYm9ydFxuICAgIC8vY29udGludWUgdG8gcmVhZCB3aGlsZSB0aGVyZSBhcmUgbGVzcyB0aGFuIDMgbWFwcyBpbiBmbGlnaHRcbiAgICBfY2IgPSBjYlxuICAgIGlmKHF1ZXVlLmxlbmd0aCB8fCBlbmRlZClcbiAgICAgIHB1bGwoKSwgZHJhaW4oKVxuICAgIGVsc2UgcHVsbCgpXG4gIH1cbiAgcmV0dXJuIGhpZ2hXYXRlck1hcmsoYXN5bmNNYXAocmVhZCwgbWFwKSwgd2lkdGgpXG59XG5cbnZhciBmaWx0ZXIgPSBleHBvcnRzLmZpbHRlciA9XG5mdW5jdGlvbiAocmVhZCwgdGVzdCkge1xuICAvL3JlZ2V4cFxuICB0ZXN0ID0gdGVzdGVyKHRlc3QpXG4gIHJldHVybiBmdW5jdGlvbiBuZXh0IChlbmQsIGNiKSB7XG4gICAgcmVhZChlbmQsIGZ1bmN0aW9uIChlbmQsIGRhdGEpIHtcbiAgICAgIGlmKCFlbmQgJiYgIXRlc3QoZGF0YSkpXG4gICAgICAgIHJldHVybiBuZXh0KGVuZCwgY2IpXG4gICAgICBjYihlbmQsIGRhdGEpXG4gICAgfSlcbiAgfVxufVxuXG52YXIgZmlsdGVyTm90ID0gZXhwb3J0cy5maWx0ZXJOb3QgPVxuZnVuY3Rpb24gKHJlYWQsIHRlc3QpIHtcbiAgdGVzdCA9IHRlc3Rlcih0ZXN0KVxuICByZXR1cm4gZmlsdGVyKHJlYWQsIGZ1bmN0aW9uIChlKSB7XG4gICAgcmV0dXJuICF0ZXN0KGUpXG4gIH0pXG59XG5cbnZhciB0aHJvdWdoID0gZXhwb3J0cy50aHJvdWdoID0gXG5mdW5jdGlvbiAocmVhZCwgb3AsIG9uRW5kKSB7XG4gIHZhciBhID0gZmFsc2VcbiAgZnVuY3Rpb24gb25jZSAoYWJvcnQpIHtcbiAgICBpZihhIHx8ICFvbkVuZCkgcmV0dXJuXG4gICAgYSA9IHRydWVcbiAgICBvbkVuZChhYm9ydCA9PT0gdHJ1ZSA/IG51bGwgOiBhYm9ydClcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoZW5kLCBjYikge1xuICAgIGlmKGVuZCkgb25jZShlbmQpXG4gICAgcmV0dXJuIHJlYWQoZW5kLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZighZW5kKSBvcCAmJiBvcChkYXRhKVxuICAgICAgZWxzZSBvbmNlKGVuZClcbiAgICAgIGNiKGVuZCwgZGF0YSlcbiAgICB9KVxuICB9XG59XG5cbnZhciB0YWtlID0gZXhwb3J0cy50YWtlID1cbmZ1bmN0aW9uIChyZWFkLCB0ZXN0KSB7XG4gIHZhciBlbmRlZCA9IGZhbHNlXG4gIGlmKCdudW1iZXInID09PSB0eXBlb2YgdGVzdCkge1xuICAgIHZhciBuID0gdGVzdDsgdGVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuIC0tXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgaWYoZW5kZWQpIHJldHVybiBjYihlbmRlZClcbiAgICBpZihlbmRlZCA9IGVuZCkgcmV0dXJuIHJlYWQoZW5kZWQsIGNiKVxuXG4gICAgcmVhZChudWxsLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmRlZCA9IGVuZGVkIHx8IGVuZCkgcmV0dXJuIGNiKGVuZGVkKVxuICAgICAgaWYoIXRlc3QoZGF0YSkpIHtcbiAgICAgICAgZW5kZWQgPSB0cnVlXG4gICAgICAgIHJlYWQodHJ1ZSwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgICAgIGNiKGVuZGVkLCBkYXRhKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBjYihudWxsLCBkYXRhKVxuICAgIH0pXG4gIH1cbn1cblxudmFyIHVuaXF1ZSA9IGV4cG9ydHMudW5pcXVlID0gZnVuY3Rpb24gKHJlYWQsIGZpZWxkLCBpbnZlcnQpIHtcbiAgZmllbGQgPSBwcm9wKGZpZWxkKSB8fCBpZFxuICB2YXIgc2VlbiA9IHt9XG4gIHJldHVybiBmaWx0ZXIocmVhZCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIga2V5ID0gZmllbGQoZGF0YSlcbiAgICBpZihzZWVuW2tleV0pIHJldHVybiAhIWludmVydCAvL2ZhbHNlLCBieSBkZWZhdWx0XG4gICAgZWxzZSBzZWVuW2tleV0gPSB0cnVlXG4gICAgcmV0dXJuICFpbnZlcnQgLy90cnVlIGJ5IGRlZmF1bHRcbiAgfSlcbn1cblxudmFyIG5vblVuaXF1ZSA9IGV4cG9ydHMubm9uVW5pcXVlID0gZnVuY3Rpb24gKHJlYWQsIGZpZWxkKSB7XG4gIHJldHVybiB1bmlxdWUocmVhZCwgZmllbGQsIHRydWUpXG59XG5cbnZhciBncm91cCA9IGV4cG9ydHMuZ3JvdXAgPVxuZnVuY3Rpb24gKHJlYWQsIHNpemUpIHtcbiAgdmFyIGVuZGVkOyBzaXplID0gc2l6ZSB8fCA1XG4gIHZhciBxdWV1ZSA9IFtdXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgLy90aGlzIG1lYW5zIHRoYXQgdGhlIHVwc3RyZWFtIGlzIHNlbmRpbmcgYW4gZXJyb3IuXG4gICAgaWYoZW5kKSByZXR1cm4gcmVhZChlbmRlZCA9IGVuZCwgY2IpXG4gICAgLy90aGlzIG1lYW5zIHRoYXQgd2UgcmVhZCBhbiBlbmQgYmVmb3JlLlxuICAgIGlmKGVuZGVkKSByZXR1cm4gY2IoZW5kZWQpXG5cbiAgICByZWFkKG51bGwsIGZ1bmN0aW9uIG5leHQoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmRlZCA9IGVuZGVkIHx8IGVuZCkge1xuICAgICAgICBpZighcXVldWUubGVuZ3RoKVxuICAgICAgICAgIHJldHVybiBjYihlbmRlZClcblxuICAgICAgICB2YXIgX3F1ZXVlID0gcXVldWU7IHF1ZXVlID0gW11cbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIF9xdWV1ZSlcbiAgICAgIH1cbiAgICAgIHF1ZXVlLnB1c2goZGF0YSlcbiAgICAgIGlmKHF1ZXVlLmxlbmd0aCA8IHNpemUpXG4gICAgICAgIHJldHVybiByZWFkKG51bGwsIG5leHQpXG5cbiAgICAgIHZhciBfcXVldWUgPSBxdWV1ZTsgcXVldWUgPSBbXVxuICAgICAgY2IobnVsbCwgX3F1ZXVlKVxuICAgIH0pXG4gIH1cbn1cblxudmFyIGZsYXR0ZW4gPSBleHBvcnRzLmZsYXR0ZW4gPSBmdW5jdGlvbiAocmVhZCkge1xuICB2YXIgX3JlYWRcbiAgcmV0dXJuIGZ1bmN0aW9uIChhYm9ydCwgY2IpIHtcbiAgICBpZihfcmVhZCkgbmV4dENodW5rKClcbiAgICBlbHNlICAgICAgbmV4dFN0cmVhbSgpXG5cbiAgICBmdW5jdGlvbiBuZXh0Q2h1bmsgKCkge1xuICAgICAgX3JlYWQobnVsbCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgICBpZihlbmQpIG5leHRTdHJlYW0oKVxuICAgICAgICBlbHNlICAgIGNiKG51bGwsIGRhdGEpXG4gICAgICB9KVxuICAgIH1cbiAgICBmdW5jdGlvbiBuZXh0U3RyZWFtICgpIHtcbiAgICAgIHJlYWQobnVsbCwgZnVuY3Rpb24gKGVuZCwgc3RyZWFtKSB7XG4gICAgICAgIGlmKGVuZClcbiAgICAgICAgICByZXR1cm4gY2IoZW5kKVxuICAgICAgICBpZihBcnJheS5pc0FycmF5KHN0cmVhbSkpXG4gICAgICAgICAgc3RyZWFtID0gc291cmNlcy52YWx1ZXMoc3RyZWFtKVxuICAgICAgICBlbHNlIGlmKCdmdW5jdGlvbicgIT0gdHlwZW9mIHN0cmVhbSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4cGVjdGVkIHN0cmVhbSBvZiBzdHJlYW1zJylcbiAgICAgICAgXG4gICAgICAgIF9yZWFkID0gc3RyZWFtXG4gICAgICAgIG5leHRDaHVuaygpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG52YXIgcHJlcGVuZCA9XG5leHBvcnRzLnByZXBlbmQgPVxuZnVuY3Rpb24gKHJlYWQsIGhlYWQpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKGFib3J0LCBjYikge1xuICAgIGlmKGhlYWQgIT09IG51bGwpIHtcbiAgICAgIGlmKGFib3J0KVxuICAgICAgICByZXR1cm4gcmVhZChhYm9ydCwgY2IpXG4gICAgICB2YXIgX2hlYWQgPSBoZWFkXG4gICAgICBoZWFkID0gbnVsbFxuICAgICAgY2IobnVsbCwgX2hlYWQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWQoYWJvcnQsIGNiKVxuICAgIH1cbiAgfVxuXG59XG5cbi8vdmFyIGRyYWluSWYgPSBleHBvcnRzLmRyYWluSWYgPSBmdW5jdGlvbiAob3AsIGRvbmUpIHtcbi8vICBzaW5rcy5kcmFpbihcbi8vfVxuXG52YXIgX3JlZHVjZSA9IGV4cG9ydHMuX3JlZHVjZSA9IGZ1bmN0aW9uIChyZWFkLCByZWR1Y2UsIGluaXRpYWwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjbG9zZSwgY2IpIHtcbiAgICBpZihjbG9zZSkgcmV0dXJuIHJlYWQoY2xvc2UsIGNiKVxuICAgIGlmKGVuZGVkKSByZXR1cm4gY2IoZW5kZWQpXG5cbiAgICBzaW5rcy5kcmFpbihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaW5pdGlhbCA9IHJlZHVjZShpbml0aWFsLCBpdGVtKVxuICAgIH0sIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgIGVuZGVkID0gZXJyIHx8IHRydWVcbiAgICAgIGlmKCFlcnIpIGNiKG51bGwsIGluaXRpYWwpXG4gICAgICBlbHNlICAgICBjYihlbmRlZClcbiAgICB9KVxuICAgIChyZWFkKVxuICB9XG59XG5cbnZhciBuZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2tcblxudmFyIGhpZ2hXYXRlck1hcmsgPSBleHBvcnRzLmhpZ2hXYXRlck1hcmsgPSBcbmZ1bmN0aW9uIChyZWFkLCBoaWdoV2F0ZXJNYXJrKSB7XG4gIHZhciBidWZmZXIgPSBbXSwgd2FpdGluZyA9IFtdLCBlbmRlZCwgcmVhZGluZyA9IGZhbHNlXG4gIGhpZ2hXYXRlck1hcmsgPSBoaWdoV2F0ZXJNYXJrIHx8IDEwXG5cbiAgZnVuY3Rpb24gcmVhZEFoZWFkICgpIHtcbiAgICB3aGlsZSh3YWl0aW5nLmxlbmd0aCAmJiAoYnVmZmVyLmxlbmd0aCB8fCBlbmRlZCkpXG4gICAgICB3YWl0aW5nLnNoaWZ0KCkoZW5kZWQsIGVuZGVkID8gbnVsbCA6IGJ1ZmZlci5zaGlmdCgpKVxuICB9XG5cbiAgZnVuY3Rpb24gbmV4dCAoKSB7XG4gICAgaWYoZW5kZWQgfHwgcmVhZGluZyB8fCBidWZmZXIubGVuZ3RoID49IGhpZ2hXYXRlck1hcmspXG4gICAgICByZXR1cm5cbiAgICByZWFkaW5nID0gdHJ1ZVxuICAgIHJldHVybiByZWFkKGVuZGVkLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICByZWFkaW5nID0gZmFsc2VcbiAgICAgIGVuZGVkID0gZW5kZWQgfHwgZW5kXG4gICAgICBpZihkYXRhICE9IG51bGwpIGJ1ZmZlci5wdXNoKGRhdGEpXG4gICAgICBcbiAgICAgIG5leHQoKTsgcmVhZEFoZWFkKClcbiAgICB9KVxuICB9XG5cbiAgbmV4dFRpY2sobmV4dClcblxuICByZXR1cm4gZnVuY3Rpb24gKGVuZCwgY2IpIHtcbiAgICBlbmRlZCA9IGVuZGVkIHx8IGVuZFxuICAgIHdhaXRpbmcucHVzaChjYilcblxuICAgIG5leHQoKTsgcmVhZEFoZWFkKClcbiAgfVxufVxuXG5cblxuIiwidmFyIHNvdXJjZXMgID0gcmVxdWlyZSgnLi9zb3VyY2VzJylcbnZhciBzaW5rcyAgICA9IHJlcXVpcmUoJy4vc2lua3MnKVxudmFyIHRocm91Z2hzID0gcmVxdWlyZSgnLi90aHJvdWdocycpXG52YXIgdSAgICAgICAgPSByZXF1aXJlKCdwdWxsLWNvcmUnKVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uIChmdW4pIHtcbiAgcmV0dXJuICdmdW5jdGlvbicgPT09IHR5cGVvZiBmdW5cbn1cblxuZnVuY3Rpb24gaXNSZWFkZXIgKGZ1bikge1xuICByZXR1cm4gZnVuICYmIChmdW4udHlwZSA9PT0gXCJUaHJvdWdoXCIgfHwgZnVuLmxlbmd0aCA9PT0gMSlcbn1cbnZhciBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwdWxsICgpIHtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcblxuICBpZihpc1JlYWRlcihhcmdzWzBdKSlcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlYWQpIHtcbiAgICAgIGFyZ3MudW5zaGlmdChyZWFkKVxuICAgICAgcmV0dXJuIHB1bGwuYXBwbHkobnVsbCwgYXJncylcbiAgICB9XG5cbiAgdmFyIHJlYWQgPSBhcmdzLnNoaWZ0KClcblxuICAvL2lmIHRoZSBmaXJzdCBmdW5jdGlvbiBpcyBhIGR1cGxleCBzdHJlYW0sXG4gIC8vcGlwZSBmcm9tIHRoZSBzb3VyY2UuXG4gIGlmKGlzRnVuY3Rpb24ocmVhZC5zb3VyY2UpKVxuICAgIHJlYWQgPSByZWFkLnNvdXJjZVxuXG4gIGZ1bmN0aW9uIG5leHQgKCkge1xuICAgIHZhciBzID0gYXJncy5zaGlmdCgpXG5cbiAgICBpZihudWxsID09IHMpXG4gICAgICByZXR1cm4gbmV4dCgpXG5cbiAgICBpZihpc0Z1bmN0aW9uKHMpKSByZXR1cm4gc1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyZWFkKSB7XG4gICAgICBzLnNpbmsocmVhZClcbiAgICAgIC8vdGhpcyBzdXBwb3J0cyBwaXBlaW5nIHRocm91Z2ggYSBkdXBsZXggc3RyZWFtXG4gICAgICAvL3B1bGwoYSwgYiwgYSkgXCJ0ZWxlcGhvbmUgc3R5bGVcIi5cbiAgICAgIC8vaWYgdGhpcyBzdHJlYW0gaXMgaW4gdGhlIGEgKGZpcnN0ICYgbGFzdCBwb3NpdGlvbilcbiAgICAgIC8vcy5zb3VyY2Ugd2lsbCBoYXZlIGFscmVhZHkgYmVlbiB1c2VkLCBidXQgdGhpcyBzaG91bGQgbmV2ZXIgYmUgY2FsbGVkXG4gICAgICAvL3NvIHRoYXQgaXMgb2theS5cbiAgICAgIHJldHVybiBzLnNvdXJjZVxuICAgIH1cbiAgfVxuXG4gIHdoaWxlKGFyZ3MubGVuZ3RoKVxuICAgIHJlYWQgPSBuZXh0KCkgKHJlYWQpXG5cbiAgcmV0dXJuIHJlYWRcbn1cblxuXG5mb3IodmFyIGsgaW4gc291cmNlcylcbiAgZXhwb3J0c1trXSA9IHUuU291cmNlKHNvdXJjZXNba10pXG5cbmZvcih2YXIgayBpbiB0aHJvdWdocylcbiAgZXhwb3J0c1trXSA9IHUuVGhyb3VnaCh0aHJvdWdoc1trXSlcblxuZm9yKHZhciBrIGluIHNpbmtzKVxuICBleHBvcnRzW2tdID0gdS5TaW5rKHNpbmtzW2tdKVxuXG52YXIgbWF5YmUgPSByZXF1aXJlKCcuL21heWJlJykoZXhwb3J0cylcblxuZm9yKHZhciBrIGluIG1heWJlKVxuICBleHBvcnRzW2tdID0gbWF5YmVba11cblxuZXhwb3J0cy5EdXBsZXggID0gXG5leHBvcnRzLlRocm91Z2ggPSBleHBvcnRzLnBpcGVhYmxlICAgICAgID0gdS5UaHJvdWdoXG5leHBvcnRzLlNvdXJjZSAgPSBleHBvcnRzLnBpcGVhYmxlU291cmNlID0gdS5Tb3VyY2VcbmV4cG9ydHMuU2luayAgICA9IGV4cG9ydHMucGlwZWFibGVTaW5rICAgPSB1LlNpbmtcblxuXG4iLCJ2YXIgdSA9IHJlcXVpcmUoJ3B1bGwtY29yZScpXG52YXIgcHJvcCA9IHUucHJvcFxudmFyIGlkICAgPSB1LmlkXG52YXIgbWF5YmVTaW5rID0gdS5tYXliZVNpbmtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocHVsbCkge1xuXG4gIHZhciBleHBvcnRzID0ge31cbiAgdmFyIGRyYWluID0gcHVsbC5kcmFpblxuXG4gIHZhciBmaW5kID1cbiAgZXhwb3J0cy5maW5kID0gZnVuY3Rpb24gKHRlc3QsIGNiKSB7XG4gICAgcmV0dXJuIG1heWJlU2luayhmdW5jdGlvbiAoY2IpIHtcbiAgICAgIHZhciBlbmRlZCA9IGZhbHNlXG4gICAgICBpZighY2IpXG4gICAgICAgIGNiID0gdGVzdCwgdGVzdCA9IGlkXG4gICAgICBlbHNlXG4gICAgICAgIHRlc3QgPSBwcm9wKHRlc3QpIHx8IGlkXG5cbiAgICAgIHJldHVybiBkcmFpbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBpZih0ZXN0KGRhdGEpKSB7XG4gICAgICAgICAgZW5kZWQgPSB0cnVlXG4gICAgICAgICAgY2IobnVsbCwgZGF0YSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYoZW5kZWQpIHJldHVybiAvL2FscmVhZHkgY2FsbGVkIGJhY2tcbiAgICAgICAgY2IoZXJyID09PSB0cnVlID8gbnVsbCA6IGVyciwgbnVsbClcbiAgICAgIH0pXG5cbiAgICB9LCBjYilcbiAgfVxuXG4gIHZhciByZWR1Y2UgPSBleHBvcnRzLnJlZHVjZSA9XG4gIGZ1bmN0aW9uIChyZWR1Y2UsIGFjYywgY2IpIHtcblxuICAgIHJldHVybiBtYXliZVNpbmsoZnVuY3Rpb24gKGNiKSB7XG4gICAgICByZXR1cm4gZHJhaW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgYWNjID0gcmVkdWNlKGFjYywgZGF0YSlcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgY2IoZXJyLCBhY2MpXG4gICAgICB9KVxuXG4gICAgfSwgY2IpXG4gIH1cblxuICB2YXIgY29sbGVjdCA9IGV4cG9ydHMuY29sbGVjdCA9IGV4cG9ydHMud3JpdGVBcnJheSA9XG4gIGZ1bmN0aW9uIChjYikge1xuICAgIHJldHVybiByZWR1Y2UoZnVuY3Rpb24gKGFyciwgaXRlbSkge1xuICAgICAgYXJyLnB1c2goaXRlbSlcbiAgICAgIHJldHVybiBhcnJcbiAgICB9LCBbXSwgY2IpXG4gIH1cblxuICB2YXIgY29uY2F0ID0gZXhwb3J0cy5jb25jYXQgPVxuICBmdW5jdGlvbiAoY2IpIHtcbiAgICByZXR1cm4gcmVkdWNlKGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gYSArIGJcbiAgICB9LCAnJywgY2IpXG4gIH1cblxuICByZXR1cm4gZXhwb3J0c1xufVxuIiwidmFyIGRyYWluID0gZXhwb3J0cy5kcmFpbiA9IGZ1bmN0aW9uIChyZWFkLCBvcCwgZG9uZSkge1xuXG4gIDsoZnVuY3Rpb24gbmV4dCgpIHtcbiAgICB2YXIgbG9vcCA9IHRydWUsIGNiZWQgPSBmYWxzZVxuICAgIHdoaWxlKGxvb3ApIHtcbiAgICAgIGNiZWQgPSBmYWxzZVxuICAgICAgcmVhZChudWxsLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICAgIGNiZWQgPSB0cnVlXG4gICAgICAgIGlmKGVuZCkge1xuICAgICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICAgIGlmKGRvbmUpIGRvbmUoZW5kID09PSB0cnVlID8gbnVsbCA6IGVuZClcbiAgICAgICAgICBlbHNlIGlmKGVuZCAmJiBlbmQgIT09IHRydWUpXG4gICAgICAgICAgICB0aHJvdyBlbmRcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKG9wICYmIGZhbHNlID09PSBvcChkYXRhKSkge1xuICAgICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICAgIHJlYWQodHJ1ZSwgZG9uZSB8fCBmdW5jdGlvbiAoKSB7fSlcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmKCFsb29wKXtcbiAgICAgICAgICBuZXh0KClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGlmKCFjYmVkKSB7XG4gICAgICAgIGxvb3AgPSBmYWxzZVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICB9XG4gIH0pKClcbn1cblxudmFyIG9uRW5kID0gZXhwb3J0cy5vbkVuZCA9IGZ1bmN0aW9uIChyZWFkLCBkb25lKSB7XG4gIHJldHVybiBkcmFpbihyZWFkLCBudWxsLCBkb25lKVxufVxuXG52YXIgbG9nID0gZXhwb3J0cy5sb2cgPSBmdW5jdGlvbiAocmVhZCwgZG9uZSkge1xuICByZXR1cm4gZHJhaW4ocmVhZCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhkYXRhKVxuICB9LCBkb25lKVxufVxuXG4iLCJcbnZhciBrZXlzID0gZXhwb3J0cy5rZXlzID1cbmZ1bmN0aW9uIChvYmplY3QpIHtcbiAgcmV0dXJuIHZhbHVlcyhPYmplY3Qua2V5cyhvYmplY3QpKVxufVxuXG52YXIgb25jZSA9IGV4cG9ydHMub25jZSA9XG5mdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhYm9ydCwgY2IpIHtcbiAgICBpZihhYm9ydCkgcmV0dXJuIGNiKGFib3J0KVxuICAgIGlmKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIHZhciBfdmFsdWUgPSB2YWx1ZTsgdmFsdWUgPSBudWxsXG4gICAgICBjYihudWxsLCBfdmFsdWUpXG4gICAgfSBlbHNlXG4gICAgICBjYih0cnVlKVxuICB9XG59XG5cbnZhciB2YWx1ZXMgPSBleHBvcnRzLnZhbHVlcyA9IGV4cG9ydHMucmVhZEFycmF5ID1cbmZ1bmN0aW9uIChhcnJheSkge1xuICBpZighQXJyYXkuaXNBcnJheShhcnJheSkpXG4gICAgYXJyYXkgPSBPYmplY3Qua2V5cyhhcnJheSkubWFwKGZ1bmN0aW9uIChrKSB7XG4gICAgICByZXR1cm4gYXJyYXlba11cbiAgICB9KVxuICB2YXIgaSA9IDBcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgaWYoZW5kKVxuICAgICAgcmV0dXJuIGNiICYmIGNiKGVuZClcbiAgICBjYihpID49IGFycmF5Lmxlbmd0aCB8fCBudWxsLCBhcnJheVtpKytdKVxuICB9XG59XG5cblxudmFyIGNvdW50ID0gZXhwb3J0cy5jb3VudCA9XG5mdW5jdGlvbiAobWF4KSB7XG4gIHZhciBpID0gMDsgbWF4ID0gbWF4IHx8IEluZmluaXR5XG4gIHJldHVybiBmdW5jdGlvbiAoZW5kLCBjYikge1xuICAgIGlmKGVuZCkgcmV0dXJuIGNiICYmIGNiKGVuZClcbiAgICBpZihpID4gbWF4KVxuICAgICAgcmV0dXJuIGNiKHRydWUpXG4gICAgY2IobnVsbCwgaSsrKVxuICB9XG59XG5cbnZhciBpbmZpbml0ZSA9IGV4cG9ydHMuaW5maW5pdGUgPVxuZnVuY3Rpb24gKGdlbmVyYXRlKSB7XG4gIGdlbmVyYXRlID0gZ2VuZXJhdGUgfHwgTWF0aC5yYW5kb21cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgaWYoZW5kKSByZXR1cm4gY2IgJiYgY2IoZW5kKVxuICAgIHJldHVybiBjYihudWxsLCBnZW5lcmF0ZSgpKVxuICB9XG59XG5cbnZhciBkZWZlciA9IGV4cG9ydHMuZGVmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBfcmVhZCwgY2JzID0gW10sIF9lbmRcblxuICB2YXIgcmVhZCA9IGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgaWYoIV9yZWFkKSB7XG4gICAgICBfZW5kID0gZW5kXG4gICAgICBjYnMucHVzaChjYilcbiAgICB9IFxuICAgIGVsc2UgX3JlYWQoZW5kLCBjYilcbiAgfVxuICByZWFkLnJlc29sdmUgPSBmdW5jdGlvbiAocmVhZCkge1xuICAgIGlmKF9yZWFkKSB0aHJvdyBuZXcgRXJyb3IoJ2FscmVhZHkgcmVzb2x2ZWQnKVxuICAgIF9yZWFkID0gcmVhZFxuICAgIGlmKCFfcmVhZCkgdGhyb3cgbmV3IEVycm9yKCdubyByZWFkIGNhbm5vdCByZXNvbHZlIScgKyBfcmVhZClcbiAgICB3aGlsZShjYnMubGVuZ3RoKVxuICAgICAgX3JlYWQoX2VuZCwgY2JzLnNoaWZ0KCkpXG4gIH1cbiAgcmVhZC5hYm9ydCA9IGZ1bmN0aW9uKGVycikge1xuICAgIHJlYWQucmVzb2x2ZShmdW5jdGlvbiAoXywgY2IpIHtcbiAgICAgIGNiKGVyciB8fCB0cnVlKVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIHJlYWRcbn1cblxudmFyIGVtcHR5ID0gZXhwb3J0cy5lbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChhYm9ydCwgY2IpIHtcbiAgICBjYih0cnVlKVxuICB9XG59XG5cbnZhciBlcnJvciA9IGV4cG9ydHMuZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoYWJvcnQsIGNiKSB7XG4gICAgY2IoZXJyKVxuICB9XG59XG5cbnZhciBkZXB0aEZpcnN0ID0gZXhwb3J0cy5kZXB0aEZpcnN0ID1cbmZ1bmN0aW9uIChzdGFydCwgY3JlYXRlU3RyZWFtKSB7XG4gIHZhciByZWFkcyA9IFtdXG5cbiAgcmVhZHMudW5zaGlmdChvbmNlKHN0YXJ0KSlcblxuICByZXR1cm4gZnVuY3Rpb24gbmV4dCAoZW5kLCBjYikge1xuICAgIGlmKCFyZWFkcy5sZW5ndGgpXG4gICAgICByZXR1cm4gY2IodHJ1ZSlcbiAgICByZWFkc1swXShlbmQsIGZ1bmN0aW9uIChlbmQsIGRhdGEpIHtcbiAgICAgIGlmKGVuZCkge1xuICAgICAgICAvL2lmIHRoaXMgc3RyZWFtIGhhcyBlbmRlZCwgZ28gdG8gdGhlIG5leHQgcXVldWVcbiAgICAgICAgcmVhZHMuc2hpZnQoKVxuICAgICAgICByZXR1cm4gbmV4dChudWxsLCBjYilcbiAgICAgIH1cbiAgICAgIHJlYWRzLnVuc2hpZnQoY3JlYXRlU3RyZWFtKGRhdGEpKVxuICAgICAgY2IoZW5kLCBkYXRhKVxuICAgIH0pXG4gIH1cbn1cbi8vd2lkdGggZmlyc3QgaXMganVzdCBsaWtlIGRlcHRoIGZpcnN0LFxuLy9idXQgcHVzaCBlYWNoIG5ldyBzdHJlYW0gb250byB0aGUgZW5kIG9mIHRoZSBxdWV1ZVxudmFyIHdpZHRoRmlyc3QgPSBleHBvcnRzLndpZHRoRmlyc3QgPVxuZnVuY3Rpb24gKHN0YXJ0LCBjcmVhdGVTdHJlYW0pIHtcbiAgdmFyIHJlYWRzID0gW11cblxuICByZWFkcy5wdXNoKG9uY2Uoc3RhcnQpKVxuXG4gIHJldHVybiBmdW5jdGlvbiBuZXh0IChlbmQsIGNiKSB7XG4gICAgaWYoIXJlYWRzLmxlbmd0aClcbiAgICAgIHJldHVybiBjYih0cnVlKVxuICAgIHJlYWRzWzBdKGVuZCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgaWYoZW5kKSB7XG4gICAgICAgIHJlYWRzLnNoaWZ0KClcbiAgICAgICAgcmV0dXJuIG5leHQobnVsbCwgY2IpXG4gICAgICB9XG4gICAgICByZWFkcy5wdXNoKGNyZWF0ZVN0cmVhbShkYXRhKSlcbiAgICAgIGNiKGVuZCwgZGF0YSlcbiAgICB9KVxuICB9XG59XG5cbi8vdGhpcyBjYW1lIG91dCBkaWZmZXJlbnQgdG8gdGhlIGZpcnN0IChzdHJtKVxuLy9hdHRlbXB0IGF0IGxlYWZGaXJzdCwgYnV0IGl0J3Mgc3RpbGwgYSB2YWxpZFxuLy90b3BvbG9naWNhbCBzb3J0LlxudmFyIGxlYWZGaXJzdCA9IGV4cG9ydHMubGVhZkZpcnN0ID1cbmZ1bmN0aW9uIChzdGFydCwgY3JlYXRlU3RyZWFtKSB7XG4gIHZhciByZWFkcyA9IFtdXG4gIHZhciBvdXRwdXQgPSBbXVxuICByZWFkcy5wdXNoKG9uY2Uoc3RhcnQpKVxuXG4gIHJldHVybiBmdW5jdGlvbiBuZXh0IChlbmQsIGNiKSB7XG4gICAgcmVhZHNbMF0oZW5kLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmQpIHtcbiAgICAgICAgcmVhZHMuc2hpZnQoKVxuICAgICAgICBpZighb3V0cHV0Lmxlbmd0aClcbiAgICAgICAgICByZXR1cm4gY2IodHJ1ZSlcbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIG91dHB1dC5zaGlmdCgpKVxuICAgICAgfVxuICAgICAgcmVhZHMudW5zaGlmdChjcmVhdGVTdHJlYW0oZGF0YSkpXG4gICAgICBvdXRwdXQudW5zaGlmdChkYXRhKVxuICAgICAgbmV4dChudWxsLCBjYilcbiAgICB9KVxuICB9XG59XG5cbiIsInZhciB1ICAgICAgPSByZXF1aXJlKCdwdWxsLWNvcmUnKVxudmFyIHNvdXJjZXMgPSByZXF1aXJlKCcuL3NvdXJjZXMnKVxudmFyIHNpbmtzID0gcmVxdWlyZSgnLi9zaW5rcycpXG5cbnZhciBwcm9wICAgPSB1LnByb3BcbnZhciBpZCAgICAgPSB1LmlkXG52YXIgdGVzdGVyID0gdS50ZXN0ZXJcblxudmFyIG1hcCA9IGV4cG9ydHMubWFwID1cbmZ1bmN0aW9uIChyZWFkLCBtYXApIHtcbiAgbWFwID0gcHJvcChtYXApIHx8IGlkXG4gIHJldHVybiBmdW5jdGlvbiAoYWJvcnQsIGNiKSB7XG4gICAgcmVhZChhYm9ydCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgdHJ5IHtcbiAgICAgIGRhdGEgPSAhZW5kID8gbWFwKGRhdGEpIDogbnVsbFxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiByZWFkKGVyciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBjYihlcnIpXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICBjYihlbmQsIGRhdGEpXG4gICAgfSlcbiAgfVxufVxuXG52YXIgYXN5bmNNYXAgPSBleHBvcnRzLmFzeW5jTWFwID1cbmZ1bmN0aW9uIChyZWFkLCBtYXApIHtcbiAgaWYoIW1hcCkgcmV0dXJuIHJlYWRcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgaWYoZW5kKSByZXR1cm4gcmVhZChlbmQsIGNiKSAvL2Fib3J0XG4gICAgcmVhZChudWxsLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmQpIHJldHVybiBjYihlbmQsIGRhdGEpXG4gICAgICBtYXAoZGF0YSwgY2IpXG4gICAgfSlcbiAgfVxufVxuXG52YXIgcGFyYU1hcCA9IGV4cG9ydHMucGFyYU1hcCA9XG5mdW5jdGlvbiAocmVhZCwgbWFwLCB3aWR0aCkge1xuICBpZighbWFwKSByZXR1cm4gcmVhZFxuICB2YXIgZW5kZWQgPSBmYWxzZSwgcXVldWUgPSBbXSwgX2NiXG5cbiAgZnVuY3Rpb24gZHJhaW4gKCkge1xuICAgIGlmKCFfY2IpIHJldHVyblxuICAgIHZhciBjYiA9IF9jYlxuICAgIF9jYiA9IG51bGxcbiAgICBpZihxdWV1ZS5sZW5ndGgpXG4gICAgICByZXR1cm4gY2IobnVsbCwgcXVldWUuc2hpZnQoKSlcbiAgICBlbHNlIGlmKGVuZGVkICYmICFuKVxuICAgICAgcmV0dXJuIGNiKGVuZGVkKVxuICAgIF9jYiA9IGNiXG4gIH1cblxuICBmdW5jdGlvbiBwdWxsICgpIHtcbiAgICByZWFkKG51bGwsIGZ1bmN0aW9uIChlbmQsIGRhdGEpIHtcbiAgICAgIGlmKGVuZCkge1xuICAgICAgICBlbmRlZCA9IGVuZFxuICAgICAgICByZXR1cm4gZHJhaW4oKVxuICAgICAgfVxuICAgICAgbisrXG4gICAgICBtYXAoZGF0YSwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuICAgICAgICBuLS1cblxuICAgICAgICBxdWV1ZS5wdXNoKGRhdGEpXG4gICAgICAgIGRyYWluKClcbiAgICAgIH0pXG5cbiAgICAgIGlmKG4gPCB3aWR0aCAmJiAhZW5kZWQpXG4gICAgICAgIHB1bGwoKVxuICAgIH0pXG4gIH1cblxuICB2YXIgbiA9IDBcbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgaWYoZW5kKSByZXR1cm4gcmVhZChlbmQsIGNiKSAvL2Fib3J0XG4gICAgLy9jb250aW51ZSB0byByZWFkIHdoaWxlIHRoZXJlIGFyZSBsZXNzIHRoYW4gMyBtYXBzIGluIGZsaWdodFxuICAgIF9jYiA9IGNiXG4gICAgaWYocXVldWUubGVuZ3RoIHx8IGVuZGVkKVxuICAgICAgcHVsbCgpLCBkcmFpbigpXG4gICAgZWxzZSBwdWxsKClcbiAgfVxuICByZXR1cm4gaGlnaFdhdGVyTWFyayhhc3luY01hcChyZWFkLCBtYXApLCB3aWR0aClcbn1cblxudmFyIGZpbHRlciA9IGV4cG9ydHMuZmlsdGVyID1cbmZ1bmN0aW9uIChyZWFkLCB0ZXN0KSB7XG4gIC8vcmVnZXhwXG4gIHRlc3QgPSB0ZXN0ZXIodGVzdClcbiAgcmV0dXJuIGZ1bmN0aW9uIG5leHQgKGVuZCwgY2IpIHtcbiAgICB2YXIgc3luYywgbG9vcCA9IHRydWVcbiAgICB3aGlsZShsb29wKSB7XG4gICAgICBsb29wID0gZmFsc2VcbiAgICAgIHN5bmMgPSB0cnVlXG4gICAgICByZWFkKGVuZCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgICBpZighZW5kICYmICF0ZXN0KGRhdGEpKVxuICAgICAgICAgIHJldHVybiBzeW5jID8gbG9vcCA9IHRydWUgOiBuZXh0KGVuZCwgY2IpXG4gICAgICAgIGNiKGVuZCwgZGF0YSlcbiAgICAgIH0pXG4gICAgICBzeW5jID0gZmFsc2VcbiAgICB9XG4gIH1cbn1cblxudmFyIGZpbHRlck5vdCA9IGV4cG9ydHMuZmlsdGVyTm90ID1cbmZ1bmN0aW9uIChyZWFkLCB0ZXN0KSB7XG4gIHRlc3QgPSB0ZXN0ZXIodGVzdClcbiAgcmV0dXJuIGZpbHRlcihyZWFkLCBmdW5jdGlvbiAoZSkge1xuICAgIHJldHVybiAhdGVzdChlKVxuICB9KVxufVxuXG52YXIgdGhyb3VnaCA9IGV4cG9ydHMudGhyb3VnaCA9XG5mdW5jdGlvbiAocmVhZCwgb3AsIG9uRW5kKSB7XG4gIHZhciBhID0gZmFsc2VcbiAgZnVuY3Rpb24gb25jZSAoYWJvcnQpIHtcbiAgICBpZihhIHx8ICFvbkVuZCkgcmV0dXJuXG4gICAgYSA9IHRydWVcbiAgICBvbkVuZChhYm9ydCA9PT0gdHJ1ZSA/IG51bGwgOiBhYm9ydClcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoZW5kLCBjYikge1xuICAgIGlmKGVuZCkgb25jZShlbmQpXG4gICAgcmV0dXJuIHJlYWQoZW5kLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZighZW5kKSBvcCAmJiBvcChkYXRhKVxuICAgICAgZWxzZSBvbmNlKGVuZClcbiAgICAgIGNiKGVuZCwgZGF0YSlcbiAgICB9KVxuICB9XG59XG5cbnZhciB0YWtlID0gZXhwb3J0cy50YWtlID1cbmZ1bmN0aW9uIChyZWFkLCB0ZXN0KSB7XG4gIHZhciBlbmRlZCA9IGZhbHNlXG4gIGlmKCdudW1iZXInID09PSB0eXBlb2YgdGVzdCkge1xuICAgIHZhciBuID0gdGVzdDsgdGVzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuIC0tXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgaWYoZW5kZWQpIHJldHVybiBjYihlbmRlZClcbiAgICBpZihlbmRlZCA9IGVuZCkgcmV0dXJuIHJlYWQoZW5kZWQsIGNiKVxuXG4gICAgcmVhZChudWxsLCBmdW5jdGlvbiAoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmRlZCA9IGVuZGVkIHx8IGVuZCkgcmV0dXJuIGNiKGVuZGVkKVxuICAgICAgaWYoIXRlc3QoZGF0YSkpIHtcbiAgICAgICAgZW5kZWQgPSB0cnVlXG4gICAgICAgIHJlYWQodHJ1ZSwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgICAgIGNiKGVuZGVkLCBkYXRhKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBjYihudWxsLCBkYXRhKVxuICAgIH0pXG4gIH1cbn1cblxudmFyIHVuaXF1ZSA9IGV4cG9ydHMudW5pcXVlID0gZnVuY3Rpb24gKHJlYWQsIGZpZWxkLCBpbnZlcnQpIHtcbiAgZmllbGQgPSBwcm9wKGZpZWxkKSB8fCBpZFxuICB2YXIgc2VlbiA9IHt9XG4gIHJldHVybiBmaWx0ZXIocmVhZCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIga2V5ID0gZmllbGQoZGF0YSlcbiAgICBpZihzZWVuW2tleV0pIHJldHVybiAhIWludmVydCAvL2ZhbHNlLCBieSBkZWZhdWx0XG4gICAgZWxzZSBzZWVuW2tleV0gPSB0cnVlXG4gICAgcmV0dXJuICFpbnZlcnQgLy90cnVlIGJ5IGRlZmF1bHRcbiAgfSlcbn1cblxudmFyIG5vblVuaXF1ZSA9IGV4cG9ydHMubm9uVW5pcXVlID0gZnVuY3Rpb24gKHJlYWQsIGZpZWxkKSB7XG4gIHJldHVybiB1bmlxdWUocmVhZCwgZmllbGQsIHRydWUpXG59XG5cbnZhciBncm91cCA9IGV4cG9ydHMuZ3JvdXAgPVxuZnVuY3Rpb24gKHJlYWQsIHNpemUpIHtcbiAgdmFyIGVuZGVkOyBzaXplID0gc2l6ZSB8fCA1XG4gIHZhciBxdWV1ZSA9IFtdXG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChlbmQsIGNiKSB7XG4gICAgLy90aGlzIG1lYW5zIHRoYXQgdGhlIHVwc3RyZWFtIGlzIHNlbmRpbmcgYW4gZXJyb3IuXG4gICAgaWYoZW5kKSByZXR1cm4gcmVhZChlbmRlZCA9IGVuZCwgY2IpXG4gICAgLy90aGlzIG1lYW5zIHRoYXQgd2UgcmVhZCBhbiBlbmQgYmVmb3JlLlxuICAgIGlmKGVuZGVkKSByZXR1cm4gY2IoZW5kZWQpXG5cbiAgICByZWFkKG51bGwsIGZ1bmN0aW9uIG5leHQoZW5kLCBkYXRhKSB7XG4gICAgICBpZihlbmRlZCA9IGVuZGVkIHx8IGVuZCkge1xuICAgICAgICBpZighcXVldWUubGVuZ3RoKVxuICAgICAgICAgIHJldHVybiBjYihlbmRlZClcblxuICAgICAgICB2YXIgX3F1ZXVlID0gcXVldWU7IHF1ZXVlID0gW11cbiAgICAgICAgcmV0dXJuIGNiKG51bGwsIF9xdWV1ZSlcbiAgICAgIH1cbiAgICAgIHF1ZXVlLnB1c2goZGF0YSlcbiAgICAgIGlmKHF1ZXVlLmxlbmd0aCA8IHNpemUpXG4gICAgICAgIHJldHVybiByZWFkKG51bGwsIG5leHQpXG5cbiAgICAgIHZhciBfcXVldWUgPSBxdWV1ZTsgcXVldWUgPSBbXVxuICAgICAgY2IobnVsbCwgX3F1ZXVlKVxuICAgIH0pXG4gIH1cbn1cblxudmFyIGZsYXR0ZW4gPSBleHBvcnRzLmZsYXR0ZW4gPSBmdW5jdGlvbiAocmVhZCkge1xuICB2YXIgX3JlYWRcbiAgcmV0dXJuIGZ1bmN0aW9uIChhYm9ydCwgY2IpIHtcbiAgICBpZihfcmVhZCkgbmV4dENodW5rKClcbiAgICBlbHNlICAgICAgbmV4dFN0cmVhbSgpXG5cbiAgICBmdW5jdGlvbiBuZXh0Q2h1bmsgKCkge1xuICAgICAgX3JlYWQobnVsbCwgZnVuY3Rpb24gKGVuZCwgZGF0YSkge1xuICAgICAgICBpZihlbmQpIG5leHRTdHJlYW0oKVxuICAgICAgICBlbHNlICAgIGNiKG51bGwsIGRhdGEpXG4gICAgICB9KVxuICAgIH1cbiAgICBmdW5jdGlvbiBuZXh0U3RyZWFtICgpIHtcbiAgICAgIHJlYWQobnVsbCwgZnVuY3Rpb24gKGVuZCwgc3RyZWFtKSB7XG4gICAgICAgIGlmKGVuZClcbiAgICAgICAgICByZXR1cm4gY2IoZW5kKVxuICAgICAgICBpZihBcnJheS5pc0FycmF5KHN0cmVhbSkgfHwgc3RyZWFtICYmICdvYmplY3QnID09PSB0eXBlb2Ygc3RyZWFtKVxuICAgICAgICAgIHN0cmVhbSA9IHNvdXJjZXMudmFsdWVzKHN0cmVhbSlcbiAgICAgICAgZWxzZSBpZignZnVuY3Rpb24nICE9IHR5cGVvZiBzdHJlYW0pXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdleHBlY3RlZCBzdHJlYW0gb2Ygc3RyZWFtcycpXG4gICAgICAgIF9yZWFkID0gc3RyZWFtXG4gICAgICAgIG5leHRDaHVuaygpXG4gICAgICB9KVxuICAgIH1cbiAgfVxufVxuXG52YXIgcHJlcGVuZCA9XG5leHBvcnRzLnByZXBlbmQgPVxuZnVuY3Rpb24gKHJlYWQsIGhlYWQpIHtcblxuICByZXR1cm4gZnVuY3Rpb24gKGFib3J0LCBjYikge1xuICAgIGlmKGhlYWQgIT09IG51bGwpIHtcbiAgICAgIGlmKGFib3J0KVxuICAgICAgICByZXR1cm4gcmVhZChhYm9ydCwgY2IpXG4gICAgICB2YXIgX2hlYWQgPSBoZWFkXG4gICAgICBoZWFkID0gbnVsbFxuICAgICAgY2IobnVsbCwgX2hlYWQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJlYWQoYWJvcnQsIGNiKVxuICAgIH1cbiAgfVxuXG59XG5cbi8vdmFyIGRyYWluSWYgPSBleHBvcnRzLmRyYWluSWYgPSBmdW5jdGlvbiAob3AsIGRvbmUpIHtcbi8vICBzaW5rcy5kcmFpbihcbi8vfVxuXG52YXIgX3JlZHVjZSA9IGV4cG9ydHMuX3JlZHVjZSA9IGZ1bmN0aW9uIChyZWFkLCByZWR1Y2UsIGluaXRpYWwpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChjbG9zZSwgY2IpIHtcbiAgICBpZihjbG9zZSkgcmV0dXJuIHJlYWQoY2xvc2UsIGNiKVxuICAgIGlmKGVuZGVkKSByZXR1cm4gY2IoZW5kZWQpXG5cbiAgICBzaW5rcy5kcmFpbihmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaW5pdGlhbCA9IHJlZHVjZShpbml0aWFsLCBpdGVtKVxuICAgIH0sIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgIGVuZGVkID0gZXJyIHx8IHRydWVcbiAgICAgIGlmKCFlcnIpIGNiKG51bGwsIGluaXRpYWwpXG4gICAgICBlbHNlICAgICBjYihlbmRlZClcbiAgICB9KVxuICAgIChyZWFkKVxuICB9XG59XG5cbnZhciBuZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2tcblxudmFyIGhpZ2hXYXRlck1hcmsgPSBleHBvcnRzLmhpZ2hXYXRlck1hcmsgPVxuZnVuY3Rpb24gKHJlYWQsIGhpZ2hXYXRlck1hcmspIHtcbiAgdmFyIGJ1ZmZlciA9IFtdLCB3YWl0aW5nID0gW10sIGVuZGVkLCBlbmRpbmcsIHJlYWRpbmcgPSBmYWxzZVxuICBoaWdoV2F0ZXJNYXJrID0gaGlnaFdhdGVyTWFyayB8fCAxMFxuXG4gIGZ1bmN0aW9uIHJlYWRBaGVhZCAoKSB7XG4gICAgd2hpbGUod2FpdGluZy5sZW5ndGggJiYgKGJ1ZmZlci5sZW5ndGggfHwgZW5kZWQpKVxuICAgICAgd2FpdGluZy5zaGlmdCgpKGVuZGVkLCBlbmRlZCA/IG51bGwgOiBidWZmZXIuc2hpZnQoKSlcblxuICAgIGlmICghYnVmZmVyLmxlbmd0aCAmJiBlbmRpbmcpIGVuZGVkID0gZW5kaW5nO1xuICB9XG5cbiAgZnVuY3Rpb24gbmV4dCAoKSB7XG4gICAgaWYoZW5kZWQgfHwgZW5kaW5nIHx8IHJlYWRpbmcgfHwgYnVmZmVyLmxlbmd0aCA+PSBoaWdoV2F0ZXJNYXJrKVxuICAgICAgcmV0dXJuXG4gICAgcmVhZGluZyA9IHRydWVcbiAgICByZXR1cm4gcmVhZChlbmRlZCB8fCBlbmRpbmcsIGZ1bmN0aW9uIChlbmQsIGRhdGEpIHtcbiAgICAgIHJlYWRpbmcgPSBmYWxzZVxuICAgICAgZW5kaW5nID0gZW5kaW5nIHx8IGVuZFxuICAgICAgaWYoZGF0YSAhPSBudWxsKSBidWZmZXIucHVzaChkYXRhKVxuXG4gICAgICBuZXh0KCk7IHJlYWRBaGVhZCgpXG4gICAgfSlcbiAgfVxuXG4gIHByb2Nlc3MubmV4dFRpY2sobmV4dClcblxuICByZXR1cm4gZnVuY3Rpb24gKGVuZCwgY2IpIHtcbiAgICBlbmRlZCA9IGVuZGVkIHx8IGVuZFxuICAgIHdhaXRpbmcucHVzaChjYilcblxuICAgIG5leHQoKTsgcmVhZEFoZWFkKClcbiAgfVxufVxuXG52YXIgZmxhdE1hcCA9IGV4cG9ydHMuZmxhdE1hcCA9XG5mdW5jdGlvbiAocmVhZCwgbWFwcGVyKSB7XG4gIG1hcHBlciA9IG1hcHBlciB8fCBpZFxuICB2YXIgcXVldWUgPSBbXSwgZW5kZWRcblxuICByZXR1cm4gZnVuY3Rpb24gKGFib3J0LCBjYikge1xuICAgIGlmKHF1ZXVlLmxlbmd0aCkgcmV0dXJuIGNiKG51bGwsIHF1ZXVlLnNoaWZ0KCkpXG4gICAgZWxzZSBpZihlbmRlZCkgICByZXR1cm4gY2IoZW5kZWQpXG5cbiAgICByZWFkKGFib3J0LCBmdW5jdGlvbiBuZXh0IChlbmQsIGRhdGEpIHtcbiAgICAgIGlmKGVuZCkgZW5kZWQgPSBlbmRcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgYWRkID0gbWFwcGVyKGRhdGEpXG4gICAgICAgIHdoaWxlKGFkZCAmJiBhZGQubGVuZ3RoKVxuICAgICAgICAgIHF1ZXVlLnB1c2goYWRkLnNoaWZ0KCkpXG4gICAgICB9XG5cbiAgICAgIGlmKHF1ZXVlLmxlbmd0aCkgY2IobnVsbCwgcXVldWUuc2hpZnQoKSlcbiAgICAgIGVsc2UgaWYoZW5kZWQpICAgY2IoZW5kZWQpXG4gICAgICBlbHNlICAgICAgICAgICAgIHJlYWQobnVsbCwgbmV4dClcbiAgICB9KVxuICB9XG59XG5cbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBqc29ucGFyc2UgPSByZXF1aXJlKCdjb2cvanNvbnBhcnNlJyk7XG5cbi8qKlxuICAjIyMgc2lnbmFsbGVyIHByb2Nlc3MgaGFuZGxpbmdcblxuICBXaGVuIGEgc2lnbmFsbGVyJ3MgdW5kZXJsaW5nIG1lc3NlbmdlciBlbWl0cyBhIGBkYXRhYCBldmVudCB0aGlzIGlzXG4gIGRlbGVnYXRlZCB0byBhIHNpbXBsZSBtZXNzYWdlIHBhcnNlciwgd2hpY2ggYXBwbGllcyB0aGUgZm9sbG93aW5nIHNpbXBsZVxuICBsb2dpYzpcblxuICAtIElzIHRoZSBtZXNzYWdlIGEgYC90b2AgbWVzc2FnZS4gSWYgc28sIHNlZSBpZiB0aGUgbWVzc2FnZSBpcyBmb3IgdGhpc1xuICAgIHNpZ25hbGxlciAoY2hlY2tpbmcgdGhlIHRhcmdldCBpZCAtIDJuZCBhcmcpLiAgSWYgc28gcGFzcyB0aGVcbiAgICByZW1haW5kZXIgb2YgdGhlIG1lc3NhZ2Ugb250byB0aGUgc3RhbmRhcmQgcHJvY2Vzc2luZyBjaGFpbi4gIElmIG5vdCxcbiAgICBkaXNjYXJkIHRoZSBtZXNzYWdlLlxuXG4gIC0gSXMgdGhlIG1lc3NhZ2UgYSBjb21tYW5kIG1lc3NhZ2UgKHByZWZpeGVkIHdpdGggYSBmb3J3YXJkIHNsYXNoKS4gSWYgc28sXG4gICAgbG9vayBmb3IgYW4gYXBwcm9wcmlhdGUgbWVzc2FnZSBoYW5kbGVyIGFuZCBwYXNzIHRoZSBtZXNzYWdlIHBheWxvYWQgb25cbiAgICB0byBpdC5cblxuICAtIEZpbmFsbHksIGRvZXMgdGhlIG1lc3NhZ2UgbWF0Y2ggYW55IHBhdHRlcm5zIHRoYXQgd2UgYXJlIGxpc3RlbmluZyBmb3I/XG4gICAgSWYgc28sIHRoZW4gcGFzcyB0aGUgZW50aXJlIG1lc3NhZ2UgY29udGVudHMgb250byB0aGUgcmVnaXN0ZXJlZCBoYW5kbGVyLlxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHNpZ25hbGxlciwgb3B0cykge1xuICB2YXIgaGFuZGxlcnMgPSByZXF1aXJlKCcuL2hhbmRsZXJzJykoc2lnbmFsbGVyLCBvcHRzKTtcblxuICBmdW5jdGlvbiBzZW5kRXZlbnQocGFydHMsIHNyY1N0YXRlLCBkYXRhKSB7XG4gICAgLy8gaW5pdGlhbGlzZSB0aGUgZXZlbnQgbmFtZVxuICAgIHZhciBldnROYW1lID0gJ21lc3NhZ2U6JyArIHBhcnRzWzBdLnNsaWNlKDEpO1xuXG4gICAgLy8gY29udmVydCBhbnkgdmFsaWQganNvbiBvYmplY3RzIHRvIGpzb25cbiAgICB2YXIgYXJncyA9IHBhcnRzLnNsaWNlKDIpLm1hcChqc29ucGFyc2UpO1xuXG4gICAgc2lnbmFsbGVyLmFwcGx5KFxuICAgICAgc2lnbmFsbGVyLFxuICAgICAgW2V2dE5hbWVdLmNvbmNhdChhcmdzKS5jb25jYXQoW3NyY1N0YXRlLCBkYXRhXSlcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9yaWdpbmFsRGF0YSkge1xuICAgIHZhciBkYXRhID0gb3JpZ2luYWxEYXRhO1xuICAgIHZhciBpc01hdGNoID0gdHJ1ZTtcbiAgICB2YXIgcGFydHM7XG4gICAgdmFyIGhhbmRsZXI7XG4gICAgdmFyIHNyY0RhdGE7XG4gICAgdmFyIHNyY1N0YXRlO1xuICAgIHZhciBpc0RpcmVjdE1lc3NhZ2UgPSBmYWxzZTtcblxuICAgIC8vIGRpc2NhcmQgcHJpbXVzIG1lc3NhZ2VzXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5zbGljZSgwLCA2KSA9PT0gJ3ByaW11cycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmb3JjZSB0aGUgaWQgaW50byBzdHJpbmcgZm9ybWF0IHNvIHdlIGNhbiBydW4gbGVuZ3RoIGFuZCBjb21wYXJpc29uIHRlc3RzIG9uIGl0XG4gICAgdmFyIGlkID0gc2lnbmFsbGVyLmlkICsgJyc7XG5cbiAgICAvLyBwcm9jZXNzIC90byBtZXNzYWdlc1xuICAgIGlmIChkYXRhLnNsaWNlKDAsIDMpID09PSAnL3RvJykge1xuICAgICAgaXNNYXRjaCA9IGRhdGEuc2xpY2UoNCwgaWQubGVuZ3RoICsgNCkgPT09IGlkO1xuICAgICAgaWYgKGlzTWF0Y2gpIHtcbiAgICAgICAgcGFydHMgPSBkYXRhLnNsaWNlKDUgKyBpZC5sZW5ndGgpLnNwbGl0KCd8JykubWFwKGpzb25wYXJzZSk7XG5cbiAgICAgICAgLy8gZ2V0IHRoZSBzb3VyY2UgZGF0YVxuICAgICAgICBpc0RpcmVjdE1lc3NhZ2UgPSB0cnVlO1xuXG4gICAgICAgIC8vIGV4dHJhY3QgdGhlIHZlY3RvciBjbG9jayBhbmQgdXBkYXRlIHRoZSBwYXJ0c1xuICAgICAgICBwYXJ0cyA9IHBhcnRzLm1hcChqc29ucGFyc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIHRoaXMgaXMgbm90IGEgbWF0Y2gsIHRoZW4gYmFpbFxuICAgIGlmICghIGlzTWF0Y2gpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBjaG9wIHRoZSBkYXRhIGludG8gcGFydHNcbiAgICBzaWduYWxsZXIoJ3Jhd2RhdGEnLCBkYXRhKTtcbiAgICBwYXJ0cyA9IHBhcnRzIHx8IGRhdGEuc3BsaXQoJ3wnKS5tYXAoanNvbnBhcnNlKTtcblxuICAgIC8vIGlmIHdlIGhhdmUgYSBzcGVjaWZpYyBoYW5kbGVyIGZvciB0aGUgYWN0aW9uLCB0aGVuIGludm9rZVxuICAgIGlmICh0eXBlb2YgcGFydHNbMF0gPT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIGV4dHJhY3QgdGhlIG1ldGFkYXRhIGZyb20gdGhlIGlucHV0IGRhdGFcbiAgICAgIHNyY0RhdGEgPSBwYXJ0c1sxXTtcblxuICAgICAgLy8gaWYgd2UgZ290IGRhdGEgZnJvbSBvdXJzZWxmLCB0aGVuIHRoaXMgaXMgcHJldHR5IGR1bWJcbiAgICAgIC8vIGJ1dCBpZiB3ZSBoYXZlIHRoZW4gdGhyb3cgaXQgYXdheVxuICAgICAgaWYgKHNyY0RhdGEgJiYgc3JjRGF0YS5pZCA9PT0gc2lnbmFsbGVyLmlkKSB7XG4gICAgICAgIHJldHVybiBjb25zb2xlLndhcm4oJ2dvdCBkYXRhIGZyb20gb3Vyc2VsZiwgZGlzY2FyZGluZycpO1xuICAgICAgfVxuXG4gICAgICAvLyBnZXQgdGhlIHNvdXJjZSBzdGF0ZVxuICAgICAgc3JjU3RhdGUgPSBzaWduYWxsZXIucGVlcnMuZ2V0KHNyY0RhdGEgJiYgc3JjRGF0YS5pZCkgfHwgc3JjRGF0YTtcblxuICAgICAgLy8gaGFuZGxlIGNvbW1hbmRzXG4gICAgICBpZiAocGFydHNbMF0uY2hhckF0KDApID09PSAnLycpIHtcbiAgICAgICAgLy8gbG9vayBmb3IgYSBoYW5kbGVyIGZvciB0aGUgbWVzc2FnZSB0eXBlXG4gICAgICAgIGhhbmRsZXIgPSBoYW5kbGVyc1twYXJ0c1swXS5zbGljZSgxKV07XG5cbiAgICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBoYW5kbGVyKFxuICAgICAgICAgICAgcGFydHMuc2xpY2UoMiksXG4gICAgICAgICAgICBwYXJ0c1swXS5zbGljZSgxKSxcbiAgICAgICAgICAgIHNyY0RhdGEsXG4gICAgICAgICAgICBzcmNTdGF0ZSxcbiAgICAgICAgICAgIGlzRGlyZWN0TWVzc2FnZVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc2VuZEV2ZW50KHBhcnRzLCBzcmNTdGF0ZSwgb3JpZ2luYWxEYXRhKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gb3RoZXJ3aXNlLCBlbWl0IGRhdGFcbiAgICAgIGVsc2Uge1xuICAgICAgICBzaWduYWxsZXIoXG4gICAgICAgICAgJ2RhdGEnLFxuICAgICAgICAgIHBhcnRzLnNsaWNlKDAsIDEpLmNvbmNhdChwYXJ0cy5zbGljZSgyKSksXG4gICAgICAgICAgc3JjRGF0YSxcbiAgICAgICAgICBzcmNTdGF0ZSxcbiAgICAgICAgICBpc0RpcmVjdE1lc3NhZ2VcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59O1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKCdydGMvY2xlYW51cCcpO1xuXG52YXIgQ0FOTk9UX0NMT1NFX1NUQVRFUyA9IFtcbiAgJ2Nsb3NlZCdcbl07XG5cbnZhciBFVkVOVFNfREVDT1VQTEVfQkMgPSBbXG4gICdhZGRzdHJlYW0nLFxuICAnZGF0YWNoYW5uZWwnLFxuICAnaWNlY2FuZGlkYXRlJyxcbiAgJ25lZ290aWF0aW9ubmVlZGVkJyxcbiAgJ3JlbW92ZXN0cmVhbScsXG4gICdzaWduYWxpbmdzdGF0ZWNoYW5nZSdcbl07XG5cbnZhciBFVkVOVFNfREVDT1VQTEVfQUMgPSBbXG4gICdpY2Vjb25uZWN0aW9uc3RhdGVjaGFuZ2UnXG5dO1xuXG4vKipcbiAgIyMjIHJ0Yy10b29scy9jbGVhbnVwXG5cbiAgYGBgXG4gIGNsZWFudXAocGMpXG4gIGBgYFxuXG4gIFRoZSBgY2xlYW51cGAgZnVuY3Rpb24gaXMgdXNlZCB0byBlbnN1cmUgdGhhdCBhIHBlZXIgY29ubmVjdGlvbiBpcyBwcm9wZXJseVxuICBjbG9zZWQgYW5kIHJlYWR5IHRvIGJlIGNsZWFuZWQgdXAgYnkgdGhlIGJyb3dzZXIuXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwYykge1xuICAvLyBzZWUgaWYgd2UgY2FuIGNsb3NlIHRoZSBjb25uZWN0aW9uXG4gIHZhciBjdXJyZW50U3RhdGUgPSBwYy5pY2VDb25uZWN0aW9uU3RhdGU7XG4gIHZhciBjYW5DbG9zZSA9IENBTk5PVF9DTE9TRV9TVEFURVMuaW5kZXhPZihjdXJyZW50U3RhdGUpIDwgMDtcblxuICBmdW5jdGlvbiBkZWNvdXBsZShldmVudHMpIHtcbiAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihldnROYW1lKSB7XG4gICAgICBpZiAocGNbJ29uJyArIGV2dE5hbWVdKSB7XG4gICAgICAgIHBjWydvbicgKyBldnROYW1lXSA9IG51bGw7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBkZWNvdXBsZSBcImJlZm9yZSBjbG9zZVwiIGV2ZW50c1xuICBkZWNvdXBsZShFVkVOVFNfREVDT1VQTEVfQkMpO1xuXG4gIGlmIChjYW5DbG9zZSkge1xuICAgIGRlYnVnKCdhdHRlbXB0aW5nIGNvbm5lY3Rpb24gY2xvc2UsIGN1cnJlbnQgc3RhdGU6ICcrIHBjLmljZUNvbm5lY3Rpb25TdGF0ZSk7XG4gICAgcGMuY2xvc2UoKTtcbiAgfVxuXG4gIC8vIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJzXG4gIC8vIGFmdGVyIGEgc2hvcnQgZGVsYXkgZ2l2aW5nIHRoZSBjb25uZWN0aW9uIHRpbWUgdG8gdHJpZ2dlclxuICAvLyBjbG9zZSBhbmQgaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlIGV2ZW50c1xuICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIGRlY291cGxlKEVWRU5UU19ERUNPVVBMRV9BQyk7XG4gIH0sIDEwMCk7XG59O1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIG1idXMgPSByZXF1aXJlKCdtYnVzJyk7XG52YXIgcXVldWUgPSByZXF1aXJlKCdydGMtdGFza3F1ZXVlJyk7XG52YXIgY2xlYW51cCA9IHJlcXVpcmUoJy4vY2xlYW51cCcpO1xudmFyIG1vbml0b3IgPSByZXF1aXJlKCcuL21vbml0b3InKTtcbnZhciB0aHJvdHRsZSA9IHJlcXVpcmUoJ2NvZy90aHJvdHRsZScpO1xudmFyIENMT1NFRF9TVEFURVMgPSBbICdjbG9zZWQnLCAnZmFpbGVkJyBdO1xudmFyIENIRUNLSU5HX1NUQVRFUyA9IFsgJ2NoZWNraW5nJyBdO1xuXG4vKipcbiAgIyMjIHJ0Yy10b29scy9jb3VwbGVcblxuICAjIyMjIGNvdXBsZShwYywgdGFyZ2V0SWQsIHNpZ25hbGxlciwgb3B0cz8pXG5cbiAgQ291cGxlIGEgV2ViUlRDIGNvbm5lY3Rpb24gd2l0aCBhbm90aGVyIHdlYnJ0YyBjb25uZWN0aW9uIGlkZW50aWZpZWQgYnlcbiAgYHRhcmdldElkYCB2aWEgdGhlIHNpZ25hbGxlci5cblxuICBUaGUgZm9sbG93aW5nIG9wdGlvbnMgY2FuIGJlIHByb3ZpZGVkIGluIHRoZSBgb3B0c2AgYXJndW1lbnQ6XG5cbiAgLSBgc2RwZmlsdGVyYCAoZGVmYXVsdDogbnVsbClcblxuICAgIEEgc2ltcGxlIGZ1bmN0aW9uIGZvciBmaWx0ZXJpbmcgU0RQIGFzIHBhcnQgb2YgdGhlIHBlZXJcbiAgICBjb25uZWN0aW9uIGhhbmRzaGFrZSAoc2VlIHRoZSBVc2luZyBGaWx0ZXJzIGRldGFpbHMgYmVsb3cpLlxuXG4gICMjIyMjIEV4YW1wbGUgVXNhZ2VcblxuICBgYGBqc1xuICB2YXIgY291cGxlID0gcmVxdWlyZSgncnRjL2NvdXBsZScpO1xuXG4gIGNvdXBsZShwYywgJzU0ODc5OTY1LWNlNDMtNDI2ZS1hOGVmLTA5YWMxZTM5YTE2ZCcsIHNpZ25hbGxlcik7XG4gIGBgYFxuXG4gICMjIyMjIFVzaW5nIEZpbHRlcnNcblxuICBJbiBjZXJ0YWluIGluc3RhbmNlcyB5b3UgbWF5IHdpc2ggdG8gbW9kaWZ5IHRoZSByYXcgU0RQIHRoYXQgaXMgcHJvdmlkZWRcbiAgYnkgdGhlIGBjcmVhdGVPZmZlcmAgYW5kIGBjcmVhdGVBbnN3ZXJgIGNhbGxzLiAgVGhpcyBjYW4gYmUgZG9uZSBieSBwYXNzaW5nXG4gIGEgYHNkcGZpbHRlcmAgZnVuY3Rpb24gKG9yIGFycmF5KSBpbiB0aGUgb3B0aW9ucy4gIEZvciBleGFtcGxlOlxuXG4gIGBgYGpzXG4gIC8vIHJ1biB0aGUgc2RwIGZyb20gdGhyb3VnaCBhIGxvY2FsIHR3ZWFrU2RwIGZ1bmN0aW9uLlxuICBjb3VwbGUocGMsICc1NDg3OTk2NS1jZTQzLTQyNmUtYThlZi0wOWFjMWUzOWExNmQnLCBzaWduYWxsZXIsIHtcbiAgICBzZHBmaWx0ZXI6IHR3ZWFrU2RwXG4gIH0pO1xuICBgYGBcblxuKiovXG5mdW5jdGlvbiBjb3VwbGUocGMsIHRhcmdldElkLCBzaWduYWxsZXIsIG9wdHMpIHtcbiAgdmFyIGRlYnVnTGFiZWwgPSAob3B0cyB8fCB7fSkuZGVidWdMYWJlbCB8fCAncnRjJztcbiAgdmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKGRlYnVnTGFiZWwgKyAnL2NvdXBsZScpO1xuXG4gIC8vIGNyZWF0ZSBhIG1vbml0b3IgZm9yIHRoZSBjb25uZWN0aW9uXG4gIHZhciBtb24gPSBtb25pdG9yKHBjLCB0YXJnZXRJZCwgc2lnbmFsbGVyLCAob3B0cyB8fCB7fSkubG9nZ2VyKTtcbiAgdmFyIGVtaXQgPSBtYnVzKCcnLCBtb24pO1xuICB2YXIgcmVhY3RpdmUgPSAob3B0cyB8fCB7fSkucmVhY3RpdmU7XG4gIHZhciBlbmRPZkNhbmRpZGF0ZXMgPSB0cnVlO1xuXG4gIC8vIGNvbmZpZ3VyZSB0aGUgdGltZSB0byB3YWl0IGJldHdlZW4gcmVjZWl2aW5nIGEgJ2Rpc2Nvbm5lY3QnXG4gIC8vIGljZUNvbm5lY3Rpb25TdGF0ZSBhbmQgZGV0ZXJtaW5pbmcgdGhhdCB3ZSBhcmUgY2xvc2VkXG4gIHZhciBkaXNjb25uZWN0VGltZW91dCA9IChvcHRzIHx8IHt9KS5kaXNjb25uZWN0VGltZW91dCB8fCAxMDAwMDtcbiAgdmFyIGRpc2Nvbm5lY3RUaW1lcjtcblxuICAvLyBpbml0aWxhaXNlIHRoZSBuZWdvdGlhdGlvbiBoZWxwZXJzXG4gIHZhciBpc01hc3RlciA9IHNpZ25hbGxlci5pc01hc3Rlcih0YXJnZXRJZCk7XG5cbiAgLy8gaW5pdGlhbGlzZSB0aGUgcHJvY2Vzc2luZyBxdWV1ZSAob25lIGF0IGEgdGltZSBwbGVhc2UpXG4gIHZhciBxID0gcXVldWUocGMsIG9wdHMpO1xuXG4gIHZhciBjcmVhdGVPclJlcXVlc3RPZmZlciA9IHRocm90dGxlKGZ1bmN0aW9uKCkge1xuICAgIGlmICghIGlzTWFzdGVyKSB7XG4gICAgICByZXR1cm4gc2lnbmFsbGVyLnRvKHRhcmdldElkKS5zZW5kKCcvbmVnb3RpYXRlJyk7XG4gICAgfVxuXG4gICAgcS5jcmVhdGVPZmZlcigpO1xuICB9LCAxMDAsIHsgbGVhZGluZzogZmFsc2UgfSk7XG5cbiAgdmFyIGRlYm91bmNlT2ZmZXIgPSB0aHJvdHRsZShxLmNyZWF0ZU9mZmVyLCAxMDAsIHsgbGVhZGluZzogZmFsc2UgfSk7XG5cbiAgZnVuY3Rpb24gZGVjb3VwbGUoKSB7XG4gICAgZGVidWcoJ2RlY291cGxpbmcgJyArIHNpZ25hbGxlci5pZCArICcgZnJvbSAnICsgdGFyZ2V0SWQpO1xuXG4gICAgLy8gc3RvcCB0aGUgbW9uaXRvclxuLy8gICAgIG1vbi5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICBtb24uc3RvcCgpO1xuXG4gICAgLy8gY2xlYW51cCB0aGUgcGVlcmNvbm5lY3Rpb25cbiAgICBjbGVhbnVwKHBjKTtcblxuICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnNcbiAgICBzaWduYWxsZXIucmVtb3ZlTGlzdGVuZXIoJ3NkcCcsIGhhbmRsZVNkcCk7XG4gICAgc2lnbmFsbGVyLnJlbW92ZUxpc3RlbmVyKCdjYW5kaWRhdGUnLCBoYW5kbGVDYW5kaWRhdGUpO1xuICAgIHNpZ25hbGxlci5yZW1vdmVMaXN0ZW5lcignbmVnb3RpYXRlJywgaGFuZGxlTmVnb3RpYXRlUmVxdWVzdCk7XG5cbiAgICAvLyByZW1vdmUgbGlzdGVuZXJzICh2ZXJzaW9uID49IDUpXG4gICAgc2lnbmFsbGVyLnJlbW92ZUxpc3RlbmVyKCdtZXNzYWdlOnNkcCcsIGhhbmRsZVNkcCk7XG4gICAgc2lnbmFsbGVyLnJlbW92ZUxpc3RlbmVyKCdtZXNzYWdlOmNhbmRpZGF0ZScsIGhhbmRsZUNhbmRpZGF0ZSk7XG4gICAgc2lnbmFsbGVyLnJlbW92ZUxpc3RlbmVyKCdtZXNzYWdlOm5lZ290aWF0ZScsIGhhbmRsZU5lZ290aWF0ZVJlcXVlc3QpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlQ2FuZGlkYXRlKGRhdGEpIHtcbiAgICBxLmFkZEljZUNhbmRpZGF0ZShkYXRhKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZVNkcChzZHAsIHNyYykge1xuICAgIGVtaXQoJ3NkcC5yZW1vdGUnLCBzZHApO1xuXG4gICAgLy8gaWYgdGhlIHNvdXJjZSBpcyB1bmtub3duIG9yIG5vdCBhIG1hdGNoLCB0aGVuIGRvbid0IHByb2Nlc3NcbiAgICBpZiAoKCEgc3JjKSB8fCAoc3JjLmlkICE9PSB0YXJnZXRJZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBxLnNldFJlbW90ZURlc2NyaXB0aW9uKHNkcCk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVDb25uZWN0aW9uQ2xvc2UoKSB7XG4gICAgZGVidWcoJ2NhcHR1cmVkIHBjIGNsb3NlLCBpY2VDb25uZWN0aW9uU3RhdGUgPSAnICsgcGMuaWNlQ29ubmVjdGlvblN0YXRlKTtcbiAgICBkZWNvdXBsZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRGlzY29ubmVjdCgpIHtcbiAgICBkZWJ1ZygnY2FwdHVyZWQgcGMgZGlzY29ubmVjdCwgbW9uaXRvcmluZyBjb25uZWN0aW9uIHN0YXR1cycpO1xuXG4gICAgLy8gc3RhcnQgdGhlIGRpc2Nvbm5lY3QgdGltZXJcbiAgICBkaXNjb25uZWN0VGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgZGVidWcoJ21hbnVhbGx5IGNsb3NpbmcgY29ubmVjdGlvbiBhZnRlciBkaXNjb25uZWN0IHRpbWVvdXQnKTtcbiAgICAgIGNsZWFudXAocGMpO1xuICAgIH0sIGRpc2Nvbm5lY3RUaW1lb3V0KTtcblxuICAgIG1vbi5vbignc3RhdGVjaGFuZ2UnLCBoYW5kbGVEaXNjb25uZWN0QWJvcnQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRGlzY29ubmVjdEFib3J0KCkge1xuICAgIGRlYnVnKCdjb25uZWN0aW9uIHN0YXRlIGNoYW5nZWQgdG86ICcgKyBwYy5pY2VDb25uZWN0aW9uU3RhdGUpO1xuXG4gICAgLy8gaWYgdGhlIHN0YXRlIGlzIGNoZWNraW5nLCB0aGVuIGRvIG5vdCByZXNldCB0aGUgZGlzY29ubmVjdCB0aW1lciBhc1xuICAgIC8vIHdlIGFyZSBkb2luZyBvdXIgb3duIGNoZWNraW5nXG4gICAgaWYgKENIRUNLSU5HX1NUQVRFUy5pbmRleE9mKHBjLmljZUNvbm5lY3Rpb25TdGF0ZSkgPj0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlc2V0RGlzY29ubmVjdFRpbWVyKCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIGEgY2xvc2VkIG9yIGZhaWxlZCBzdGF0dXMsIHRoZW4gY2xvc2UgdGhlIGNvbm5lY3Rpb25cbiAgICBpZiAoQ0xPU0VEX1NUQVRFUy5pbmRleE9mKHBjLmljZUNvbm5lY3Rpb25TdGF0ZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIG1vbignY2xvc2VkJyk7XG4gICAgfVxuXG4gICAgbW9uLm9uY2UoJ2Rpc2Nvbm5lY3QnLCBoYW5kbGVEaXNjb25uZWN0KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUxvY2FsQ2FuZGlkYXRlKGV2dCkge1xuICAgIHZhciBkYXRhO1xuXG4gICAgaWYgKGV2dC5jYW5kaWRhdGUpIHtcbiAgICAgIHJlc2V0RGlzY29ubmVjdFRpbWVyKCk7XG5cbiAgICAgIC8vIGZvcm11bGF0ZSBpbnRvIGEgc3BlY2lmaWMgZGF0YSBvYmplY3Qgc28gd2Ugd29uJ3QgYmUgdXBzZXQgYnkgcGx1Z2luXG4gICAgICAvLyBzcGVjaWZpYyBpbXBsZW1lbnRhdGlvbnMgb2YgdGhlIGNhbmRpZGF0ZSBkYXRhIGZvcm1hdCAoaS5lLiBleHRyYSBmaWVsZHMpXG4gICAgICBkYXRhID0ge1xuICAgICAgICBjYW5kaWRhdGU6IGV2dC5jYW5kaWRhdGUuY2FuZGlkYXRlLFxuICAgICAgICBzZHBNaWQ6IGV2dC5jYW5kaWRhdGUuc2RwTWlkLFxuICAgICAgICBzZHBNTGluZUluZGV4OiBldnQuY2FuZGlkYXRlLnNkcE1MaW5lSW5kZXhcbiAgICAgIH07XG5cbiAgICAgIGVtaXQoJ2ljZS5sb2NhbCcsIGRhdGEpO1xuICAgICAgc2lnbmFsbGVyLnRvKHRhcmdldElkKS5zZW5kKCcvY2FuZGlkYXRlJywgZGF0YSk7XG4gICAgICBlbmRPZkNhbmRpZGF0ZXMgPSBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAoISBlbmRPZkNhbmRpZGF0ZXMpIHtcbiAgICAgIGVuZE9mQ2FuZGlkYXRlcyA9IHRydWU7XG4gICAgICBlbWl0KCdpY2UuZ2F0aGVyY29tcGxldGUnKTtcbiAgICAgIHNpZ25hbGxlci50byh0YXJnZXRJZCkuc2VuZCgnL2VuZG9mY2FuZGlkYXRlcycsIHt9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVOZWdvdGlhdGVSZXF1ZXN0KHNyYykge1xuICAgIGlmIChzcmMuaWQgPT09IHRhcmdldElkKSB7XG4gICAgICBlbWl0KCduZWdvdGlhdGUucmVxdWVzdCcsIHNyYy5pZCk7XG4gICAgICBkZWJvdW5jZU9mZmVyKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzZXREaXNjb25uZWN0VGltZXIoKSB7XG4gICAgbW9uLm9mZignc3RhdGVjaGFuZ2UnLCBoYW5kbGVEaXNjb25uZWN0QWJvcnQpO1xuXG4gICAgLy8gY2xlYXIgdGhlIGRpc2Nvbm5lY3QgdGltZXJcbiAgICBkZWJ1ZygncmVzZXQgZGlzY29ubmVjdCB0aW1lciwgc3RhdGU6ICcgKyBwYy5pY2VDb25uZWN0aW9uU3RhdGUpO1xuICAgIGNsZWFyVGltZW91dChkaXNjb25uZWN0VGltZXIpO1xuICB9XG5cbiAgLy8gd2hlbiByZWdvdGlhdGlvbiBpcyBuZWVkZWQgbG9vayBmb3IgdGhlIHBlZXJcbiAgaWYgKHJlYWN0aXZlKSB7XG4gICAgcGMub25uZWdvdGlhdGlvbm5lZWRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgZW1pdCgnbmVnb3RpYXRlLnJlbmVnb3RpYXRlJyk7XG4gICAgICBjcmVhdGVPclJlcXVlc3RPZmZlcigpO1xuICAgIH07XG4gIH1cblxuICBwYy5vbmljZWNhbmRpZGF0ZSA9IGhhbmRsZUxvY2FsQ2FuZGlkYXRlO1xuXG4gIC8vIHdoZW4gdGhlIHRhc2sgcXVldWUgdGVsbHMgdXMgd2UgaGF2ZSBzZHAgYXZhaWxhYmxlLCBzZW5kIHRoYXQgb3ZlciB0aGUgd2lyZVxuICBxLm9uKCdzZHAubG9jYWwnLCBmdW5jdGlvbihkZXNjKSB7XG4gICAgc2lnbmFsbGVyLnRvKHRhcmdldElkKS5zZW5kKCcvc2RwJywgZGVzYyk7XG4gIH0pO1xuXG4gIC8vIHdoZW4gd2UgcmVjZWl2ZSBzZHAsIHRoZW5cbiAgc2lnbmFsbGVyLm9uKCdzZHAnLCBoYW5kbGVTZHApO1xuICBzaWduYWxsZXIub24oJ2NhbmRpZGF0ZScsIGhhbmRsZUNhbmRpZGF0ZSk7XG5cbiAgLy8gbGlzdGVuZXJzIChzaWduYWxsZXIgPj0gNSlcbiAgc2lnbmFsbGVyLm9uKCdtZXNzYWdlOnNkcCcsIGhhbmRsZVNkcCk7XG4gIHNpZ25hbGxlci5vbignbWVzc2FnZTpjYW5kaWRhdGUnLCBoYW5kbGVDYW5kaWRhdGUpO1xuXG4gIC8vIGlmIHRoaXMgaXMgYSBtYXN0ZXIgY29ubmVjdGlvbiwgbGlzdGVuIGZvciBuZWdvdGlhdGUgZXZlbnRzXG4gIGlmIChpc01hc3Rlcikge1xuICAgIHNpZ25hbGxlci5vbignbmVnb3RpYXRlJywgaGFuZGxlTmVnb3RpYXRlUmVxdWVzdCk7XG4gICAgc2lnbmFsbGVyLm9uKCdtZXNzYWdlOm5lZ290aWF0ZScsIGhhbmRsZU5lZ290aWF0ZVJlcXVlc3QpOyAvLyBzaWduYWxsZXIgPj0gNVxuICB9XG5cbiAgLy8gd2hlbiB0aGUgY29ubmVjdGlvbiBjbG9zZXMsIHJlbW92ZSBldmVudCBoYW5kbGVyc1xuICBtb24ub25jZSgnY2xvc2VkJywgaGFuZGxlQ29ubmVjdGlvbkNsb3NlKTtcbiAgbW9uLm9uY2UoJ2Rpc2Nvbm5lY3RlZCcsIGhhbmRsZURpc2Nvbm5lY3QpO1xuXG4gIC8vIHBhdGNoIGluIHRoZSBjcmVhdGUgb2ZmZXIgZnVuY3Rpb25zXG4gIG1vbi5jcmVhdGVPZmZlciA9IGNyZWF0ZU9yUmVxdWVzdE9mZmVyO1xuXG4gIHJldHVybiBtb247XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY291cGxlO1xuIiwiLyoganNoaW50IG5vZGU6IHRydWUgKi9cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMjIyBydGMtdG9vbHMvZGV0ZWN0XG5cbiAgUHJvdmlkZSB0aGUgW3J0Yy1jb3JlL2RldGVjdF0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtY29yZSNkZXRlY3QpXG4gIGZ1bmN0aW9uYWxpdHkuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgncnRjLWNvcmUvZGV0ZWN0Jyk7XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVidWcgPSByZXF1aXJlKCdjb2cvbG9nZ2VyJykoJ2dlbmVyYXRvcnMnKTtcbnZhciBkZXRlY3QgPSByZXF1aXJlKCcuL2RldGVjdCcpO1xudmFyIGRlZmF1bHRzID0gcmVxdWlyZSgnY29nL2RlZmF1bHRzJyk7XG5cbnZhciBtYXBwaW5ncyA9IHtcbiAgY3JlYXRlOiB7XG4gICAgZHRsczogZnVuY3Rpb24oYykge1xuICAgICAgaWYgKCEgZGV0ZWN0Lm1veikge1xuICAgICAgICBjLm9wdGlvbmFsID0gKGMub3B0aW9uYWwgfHwgW10pLmNvbmNhdCh7IER0bHNTcnRwS2V5QWdyZWVtZW50OiB0cnVlIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gICMjIyBydGMtdG9vbHMvZ2VuZXJhdG9yc1xuXG4gIFRoZSBnZW5lcmF0b3JzIHBhY2thZ2UgcHJvdmlkZXMgc29tZSB1dGlsaXR5IG1ldGhvZHMgZm9yIGdlbmVyYXRpbmdcbiAgY29uc3RyYWludCBvYmplY3RzIGFuZCBzaW1pbGFyIGNvbnN0cnVjdHMuXG5cbiAgYGBganNcbiAgdmFyIGdlbmVyYXRvcnMgPSByZXF1aXJlKCdydGMvZ2VuZXJhdG9ycycpO1xuICBgYGBcblxuKiovXG5cbi8qKlxuICAjIyMjIGdlbmVyYXRvcnMuY29uZmlnKGNvbmZpZylcblxuICBHZW5lcmF0ZSBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHN1aXRhYmxlIGZvciBwYXNzaW5nIGludG8gYW4gVzNDXG4gIFJUQ1BlZXJDb25uZWN0aW9uIGNvbnN0cnVjdG9yIGZpcnN0IGFyZ3VtZW50LCBiYXNlZCBvbiBvdXIgY3VzdG9tIGNvbmZpZy5cblxuICBJbiB0aGUgZXZlbnQgdGhhdCB5b3UgdXNlIHNob3J0IHRlcm0gYXV0aGVudGljYXRpb24gZm9yIFRVUk4sIGFuZCB5b3Ugd2FudFxuICB0byBnZW5lcmF0ZSBuZXcgYGljZVNlcnZlcnNgIHJlZ3VsYXJseSwgeW91IGNhbiBzcGVjaWZ5IGFuIGljZVNlcnZlckdlbmVyYXRvclxuICB0aGF0IHdpbGwgYmUgdXNlZCBwcmlvciB0byBjb3VwbGluZy4gVGhpcyBnZW5lcmF0b3Igc2hvdWxkIHJldHVybiBhIGZ1bGx5XG4gIGNvbXBsaWFudCBXM0MgKFJUQ0ljZVNlcnZlciBkaWN0aW9uYXJ5KVtodHRwOi8vd3d3LnczLm9yZy9UUi93ZWJydGMvI2lkbC1kZWYtUlRDSWNlU2VydmVyXS5cblxuICBJZiB5b3UgcGFzcyBpbiBib3RoIGEgZ2VuZXJhdG9yIGFuZCBpY2VTZXJ2ZXJzLCB0aGUgaWNlU2VydmVycyBfd2lsbCBiZVxuICBpZ25vcmVkIGFuZCB0aGUgZ2VuZXJhdG9yIHVzZWQgaW5zdGVhZC5cbioqL1xuXG5leHBvcnRzLmNvbmZpZyA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICB2YXIgaWNlU2VydmVyR2VuZXJhdG9yID0gKGNvbmZpZyB8fCB7fSkuaWNlU2VydmVyR2VuZXJhdG9yO1xuXG4gIHJldHVybiBkZWZhdWx0cyh7fSwgY29uZmlnLCB7XG4gICAgaWNlU2VydmVyczogdHlwZW9mIGljZVNlcnZlckdlbmVyYXRvciA9PSAnZnVuY3Rpb24nID8gaWNlU2VydmVyR2VuZXJhdG9yKCkgOiBbXVxuICB9KTtcbn07XG5cbi8qKlxuICAjIyMjIGdlbmVyYXRvcnMuY29ubmVjdGlvbkNvbnN0cmFpbnRzKGZsYWdzLCBjb25zdHJhaW50cylcblxuICBUaGlzIGlzIGEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBnZW5lcmF0ZSBhcHByb3ByaWF0ZSBjb25uZWN0aW9uXG4gIGNvbnN0cmFpbnRzIGZvciBhIG5ldyBgUlRDUGVlckNvbm5lY3Rpb25gIG9iamVjdCB3aGljaCBpcyBjb25zdHJ1Y3RlZFxuICBpbiB0aGUgZm9sbG93aW5nIHdheTpcblxuICBgYGBqc1xuICB2YXIgY29ubiA9IG5ldyBSVENQZWVyQ29ubmVjdGlvbihmbGFncywgY29uc3RyYWludHMpO1xuICBgYGBcblxuICBJbiBtb3N0IGNhc2VzIHRoZSBjb25zdHJhaW50cyBvYmplY3QgY2FuIGJlIGxlZnQgZW1wdHksIGJ1dCB3aGVuIGNyZWF0aW5nXG4gIGRhdGEgY2hhbm5lbHMgc29tZSBhZGRpdGlvbmFsIG9wdGlvbnMgYXJlIHJlcXVpcmVkLiAgVGhpcyBmdW5jdGlvblxuICBjYW4gZ2VuZXJhdGUgdGhvc2UgYWRkaXRpb25hbCBvcHRpb25zIGFuZCBpbnRlbGxpZ2VudGx5IGNvbWJpbmUgYW55XG4gIHVzZXIgZGVmaW5lZCBjb25zdHJhaW50cyAoaW4gYGNvbnN0cmFpbnRzYCkgd2l0aCBzaG9ydGhhbmQgZmxhZ3MgdGhhdFxuICBtaWdodCBiZSBwYXNzZWQgd2hpbGUgdXNpbmcgdGhlIGBydGMuY3JlYXRlQ29ubmVjdGlvbmAgaGVscGVyLlxuKiovXG5leHBvcnRzLmNvbm5lY3Rpb25Db25zdHJhaW50cyA9IGZ1bmN0aW9uKGZsYWdzLCBjb25zdHJhaW50cykge1xuICB2YXIgZ2VuZXJhdGVkID0ge307XG4gIHZhciBtID0gbWFwcGluZ3MuY3JlYXRlO1xuICB2YXIgb3V0O1xuXG4gIC8vIGl0ZXJhdGUgdGhyb3VnaCB0aGUgZmxhZ3MgYW5kIGFwcGx5IHRoZSBjcmVhdGUgbWFwcGluZ3NcbiAgT2JqZWN0LmtleXMoZmxhZ3MgfHwge30pLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKG1ba2V5XSkge1xuICAgICAgbVtrZXldKGdlbmVyYXRlZCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBnZW5lcmF0ZSB0aGUgY29ubmVjdGlvbiBjb25zdHJhaW50c1xuICBvdXQgPSBkZWZhdWx0cyh7fSwgY29uc3RyYWludHMsIGdlbmVyYXRlZCk7XG4gIGRlYnVnKCdnZW5lcmF0ZWQgY29ubmVjdGlvbiBjb25zdHJhaW50czogJywgb3V0KTtcblxuICByZXR1cm4gb3V0O1xufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gICMgcnRjLXRvb2xzXG5cbiAgVGhlIGBydGMtdG9vbHNgIG1vZHVsZSBkb2VzIG1vc3Qgb2YgdGhlIGhlYXZ5IGxpZnRpbmcgd2l0aGluIHRoZVxuICBbcnRjLmlvXShodHRwOi8vcnRjLmlvKSBzdWl0ZS4gIFByaW1hcmlseSBpdCBoYW5kbGVzIHRoZSBsb2dpYyBvZiBjb3VwbGluZ1xuICBhIGxvY2FsIGBSVENQZWVyQ29ubmVjdGlvbmAgd2l0aCBpdCdzIHJlbW90ZSBjb3VudGVycGFydCB2aWEgYW5cbiAgW3J0Yy1zaWduYWxsZXJdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXNpZ25hbGxlcikgc2lnbmFsbGluZ1xuICBjaGFubmVsLlxuXG4gICMjIEdldHRpbmcgU3RhcnRlZFxuXG4gIElmIHlvdSBkZWNpZGUgdGhhdCB0aGUgYHJ0Yy10b29sc2AgbW9kdWxlIGlzIGEgYmV0dGVyIGZpdCBmb3IgeW91IHRoYW4gZWl0aGVyXG4gIFtydGMtcXVpY2tjb25uZWN0XShodHRwczovL2dpdGh1Yi5jb20vcnRjLWlvL3J0Yy1xdWlja2Nvbm5lY3QpIG9yXG4gIFtydGNdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjKSB0aGVuIHRoZSBjb2RlIHNuaXBwZXQgYmVsb3dcbiAgd2lsbCBwcm92aWRlIHlvdSBhIGd1aWRlIG9uIGhvdyB0byBnZXQgc3RhcnRlZCB1c2luZyBpdCBpbiBjb25qdW5jdGlvbiB3aXRoXG4gIHRoZSBbcnRjLXNpZ25hbGxlcl0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtc2lnbmFsbGVyKSAodmVyc2lvbiA1LjAgYW5kIGFib3ZlKVxuICBhbmQgW3J0Yy1tZWRpYV0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtbWVkaWEpIG1vZHVsZXM6XG5cbiAgPDw8IGV4YW1wbGVzL2dldHRpbmctc3RhcnRlZC5qc1xuXG4gIFRoaXMgY29kZSBkZWZpbml0ZWx5IGRvZXNuJ3QgY292ZXIgYWxsIHRoZSBjYXNlcyB0aGF0IHlvdSBuZWVkIHRvIGNvbnNpZGVyXG4gIChpLmUuIHBlZXJzIGxlYXZpbmcsIGV0YykgYnV0IGl0IHNob3VsZCBkZW1vbnN0cmF0ZSBob3cgdG86XG5cbiAgMS4gQ2FwdHVyZSB2aWRlbyBhbmQgYWRkIGl0IHRvIGEgcGVlciBjb25uZWN0aW9uXG4gIDIuIENvdXBsZSBhIGxvY2FsIHBlZXIgY29ubmVjdGlvbiB3aXRoIGEgcmVtb3RlIHBlZXIgY29ubmVjdGlvblxuICAzLiBEZWFsIHdpdGggdGhlIHJlbW90ZSBzdGVhbSBiZWluZyBkaXNjb3ZlcmVkIGFuZCBob3cgdG8gcmVuZGVyXG4gICAgIHRoYXQgdG8gdGhlIGxvY2FsIGludGVyZmFjZS5cblxuICAjIyBSZWZlcmVuY2VcblxuKiovXG5cbnZhciBnZW4gPSByZXF1aXJlKCcuL2dlbmVyYXRvcnMnKTtcblxuLy8gZXhwb3J0IGRldGVjdFxudmFyIGRldGVjdCA9IGV4cG9ydHMuZGV0ZWN0ID0gcmVxdWlyZSgnLi9kZXRlY3QnKTtcbnZhciBmaW5kUGx1Z2luID0gcmVxdWlyZSgncnRjLWNvcmUvcGx1Z2luJyk7XG5cbi8vIGV4cG9ydCBjb2cgbG9nZ2VyIGZvciBjb252ZW5pZW5jZVxuZXhwb3J0cy5sb2dnZXIgPSByZXF1aXJlKCdjb2cvbG9nZ2VyJyk7XG5cbi8vIGV4cG9ydCBwZWVyIGNvbm5lY3Rpb25cbnZhciBSVENQZWVyQ29ubmVjdGlvbiA9XG5leHBvcnRzLlJUQ1BlZXJDb25uZWN0aW9uID0gZGV0ZWN0KCdSVENQZWVyQ29ubmVjdGlvbicpO1xuXG4vLyBhZGQgdGhlIGNvdXBsZSB1dGlsaXR5XG5leHBvcnRzLmNvdXBsZSA9IHJlcXVpcmUoJy4vY291cGxlJyk7XG5cbi8qKlxuICAjIyMgY3JlYXRlQ29ubmVjdGlvblxuXG4gIGBgYFxuICBjcmVhdGVDb25uZWN0aW9uKG9wdHM/LCBjb25zdHJhaW50cz8pID0+IFJUQ1BlZXJDb25uZWN0aW9uXG4gIGBgYFxuXG4gIENyZWF0ZSBhIG5ldyBgUlRDUGVlckNvbm5lY3Rpb25gIGF1dG8gZ2VuZXJhdGluZyBkZWZhdWx0IG9wdHMgYXMgcmVxdWlyZWQuXG5cbiAgYGBganNcbiAgdmFyIGNvbm47XG5cbiAgLy8gdGhpcyBpcyBva1xuICBjb25uID0gcnRjLmNyZWF0ZUNvbm5lY3Rpb24oKTtcblxuICAvLyBhbmQgc28gaXMgdGhpc1xuICBjb25uID0gcnRjLmNyZWF0ZUNvbm5lY3Rpb24oe1xuICAgIGljZVNlcnZlcnM6IFtdXG4gIH0pO1xuICBgYGBcbioqL1xuZXhwb3J0cy5jcmVhdGVDb25uZWN0aW9uID0gZnVuY3Rpb24ob3B0cywgY29uc3RyYWludHMpIHtcbiAgdmFyIHBsdWdpbiA9IGZpbmRQbHVnaW4oKG9wdHMgfHwge30pLnBsdWdpbnMpO1xuICB2YXIgUGVlckNvbm5lY3Rpb24gPSAob3B0cyB8fCB7fSkuUlRDUGVlckNvbm5lY3Rpb24gfHwgUlRDUGVlckNvbm5lY3Rpb247XG5cbiAgLy8gZ2VuZXJhdGUgdGhlIGNvbmZpZyBiYXNlZCBvbiBvcHRpb25zIHByb3ZpZGVkXG4gIHZhciBjb25maWcgPSBnZW4uY29uZmlnKG9wdHMpO1xuXG4gIC8vIGdlbmVyYXRlIGFwcHJvcHJpYXRlIGNvbm5lY3Rpb24gY29uc3RyYWludHNcbiAgY29uc3RyYWludHMgPSBnZW4uY29ubmVjdGlvbkNvbnN0cmFpbnRzKG9wdHMsIGNvbnN0cmFpbnRzKTtcblxuICBpZiAocGx1Z2luICYmIHR5cGVvZiBwbHVnaW4uY3JlYXRlQ29ubmVjdGlvbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHBsdWdpbi5jcmVhdGVDb25uZWN0aW9uKGNvbmZpZywgY29uc3RyYWludHMpO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQZWVyQ29ubmVjdGlvbihjb25maWcsIGNvbnN0cmFpbnRzKTtcbn07XG4iLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgbWJ1cyA9IHJlcXVpcmUoJ21idXMnKTtcblxuLy8gZGVmaW5lIHNvbWUgc3RhdGUgbWFwcGluZ3MgdG8gc2ltcGxpZnkgdGhlIGV2ZW50cyB3ZSBnZW5lcmF0ZVxudmFyIHN0YXRlTWFwcGluZ3MgPSB7XG4gIGNvbXBsZXRlZDogJ2Nvbm5lY3RlZCdcbn07XG5cbi8vIGRlZmluZSB0aGUgZXZlbnRzIHRoYXQgd2UgbmVlZCB0byB3YXRjaCBmb3IgcGVlciBjb25uZWN0aW9uXG4vLyBzdGF0ZSBjaGFuZ2VzXG52YXIgcGVlclN0YXRlRXZlbnRzID0gW1xuICAnc2lnbmFsaW5nc3RhdGVjaGFuZ2UnLFxuICAnaWNlY29ubmVjdGlvbnN0YXRlY2hhbmdlJyxcbl07XG5cbi8qKlxuICAjIyMgcnRjLXRvb2xzL21vbml0b3JcblxuICBgYGBcbiAgbW9uaXRvcihwYywgdGFyZ2V0SWQsIHNpZ25hbGxlciwgcGFyZW50QnVzKSA9PiBtYnVzXG4gIGBgYFxuXG4gIFRoZSBtb25pdG9yIGlzIGEgdXNlZnVsIHRvb2wgZm9yIGRldGVybWluaW5nIHRoZSBzdGF0ZSBvZiBgcGNgIChhblxuICBgUlRDUGVlckNvbm5lY3Rpb25gKSBpbnN0YW5jZSBpbiB0aGUgY29udGV4dCBvZiB5b3VyIGFwcGxpY2F0aW9uLiBUaGVcbiAgbW9uaXRvciB1c2VzIGJvdGggdGhlIGBpY2VDb25uZWN0aW9uU3RhdGVgIGluZm9ybWF0aW9uIG9mIHRoZSBwZWVyXG4gIGNvbm5lY3Rpb24gYW5kIGFsc28gdGhlIHZhcmlvdXNcbiAgW3NpZ25hbGxlciBldmVudHNdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjLXNpZ25hbGxlciNzaWduYWxsZXItZXZlbnRzKVxuICB0byBkZXRlcm1pbmUgd2hlbiB0aGUgY29ubmVjdGlvbiBoYXMgYmVlbiBgY29ubmVjdGVkYCBhbmQgd2hlbiBpdCBoYXNcbiAgYmVlbiBgZGlzY29ubmVjdGVkYC5cblxuICBBIG1vbml0b3IgY3JlYXRlZCBgbWJ1c2AgaXMgcmV0dXJuZWQgYXMgdGhlIHJlc3VsdCBvZiBhXG4gIFtjb3VwbGVdKGh0dHBzOi8vZ2l0aHViLmNvbS9ydGMtaW8vcnRjI3J0Y2NvdXBsZSkgYmV0d2VlbiBhIGxvY2FsIHBlZXJcbiAgY29ubmVjdGlvbiBhbmQgaXQncyByZW1vdGUgY291bnRlcnBhcnQuXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwYywgdGFyZ2V0SWQsIHNpZ25hbGxlciwgcGFyZW50QnVzKSB7XG4gIHZhciBtb25pdG9yID0gbWJ1cygnJywgcGFyZW50QnVzKTtcbiAgdmFyIHN0YXRlO1xuXG4gIGZ1bmN0aW9uIGNoZWNrU3RhdGUoKSB7XG4gICAgdmFyIG5ld1N0YXRlID0gZ2V0TWFwcGVkU3RhdGUocGMuaWNlQ29ubmVjdGlvblN0YXRlKTtcblxuICAgIC8vIGZsYWcgdGhlIHdlIGhhZCBhIHN0YXRlIGNoYW5nZVxuICAgIG1vbml0b3IoJ3N0YXRlY2hhbmdlJywgcGMsIG5ld1N0YXRlKTtcblxuICAgIC8vIGlmIHRoZSBhY3RpdmUgc3RhdGUgaGFzIGNoYW5nZWQsIHRoZW4gc2VuZCB0aGUgYXBwb3ByaWF0ZSBtZXNzYWdlXG4gICAgaWYgKHN0YXRlICE9PSBuZXdTdGF0ZSkge1xuICAgICAgbW9uaXRvcihuZXdTdGF0ZSk7XG4gICAgICBzdGF0ZSA9IG5ld1N0YXRlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZUNsb3NlKCkge1xuICAgIG1vbml0b3IoJ2Nsb3NlZCcpO1xuICB9XG5cbiAgcGMub25jbG9zZSA9IGhhbmRsZUNsb3NlO1xuICBwZWVyU3RhdGVFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldnROYW1lKSB7XG4gICAgcGNbJ29uJyArIGV2dE5hbWVdID0gY2hlY2tTdGF0ZTtcbiAgfSk7XG5cbiAgbW9uaXRvci5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgcGMub25jbG9zZSA9IG51bGw7XG4gICAgcGVlclN0YXRlRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZ0TmFtZSkge1xuICAgICAgcGNbJ29uJyArIGV2dE5hbWVdID0gbnVsbDtcbiAgICB9KTtcbiAgfTtcblxuICBtb25pdG9yLmNoZWNrU3RhdGUgPSBjaGVja1N0YXRlO1xuXG4gIC8vIGlmIHdlIGhhdmVuJ3QgYmVlbiBwcm92aWRlZCBhIHZhbGlkIHBlZXIgY29ubmVjdGlvbiwgYWJvcnRcbiAgaWYgKCEgcGMpIHtcbiAgICByZXR1cm4gbW9uaXRvcjtcbiAgfVxuXG4gIC8vIGRldGVybWluZSB0aGUgaW5pdGlhbCBpcyBhY3RpdmUgc3RhdGVcbiAgc3RhdGUgPSBnZXRNYXBwZWRTdGF0ZShwYy5pY2VDb25uZWN0aW9uU3RhdGUpO1xuXG4gIHJldHVybiBtb25pdG9yO1xufTtcblxuLyogaW50ZXJuYWwgaGVscGVycyAqL1xuXG5mdW5jdGlvbiBnZXRNYXBwZWRTdGF0ZShzdGF0ZSkge1xuICByZXR1cm4gc3RhdGVNYXBwaW5nc1tzdGF0ZV0gfHwgc3RhdGU7XG59XG4iLCJ2YXIgZGV0ZWN0ID0gcmVxdWlyZSgncnRjLWNvcmUvZGV0ZWN0Jyk7XG52YXIgZmluZFBsdWdpbiA9IHJlcXVpcmUoJ3J0Yy1jb3JlL3BsdWdpbicpO1xudmFyIFByaW9yaXR5UXVldWUgPSByZXF1aXJlKCdwcmlvcml0eXF1ZXVlanMnKTtcblxuLy8gc29tZSB2YWxpZGF0aW9uIHJvdXRpbmVzXG52YXIgY2hlY2tDYW5kaWRhdGUgPSByZXF1aXJlKCdydGMtdmFsaWRhdG9yL2NhbmRpZGF0ZScpO1xuXG4vLyB0aGUgc2RwIGNsZWFuZXJcbnZhciBzZHBjbGVhbiA9IHJlcXVpcmUoJ3J0Yy1zZHBjbGVhbicpO1xuXG52YXIgUFJJT1JJVFlfTE9XID0gMTAwO1xudmFyIFBSSU9SSVRZX1dBSVQgPSAxMDAwO1xuXG4vLyBwcmlvcml0eSBvcmRlciAobG93ZXIgaXMgYmV0dGVyKVxudmFyIERFRkFVTFRfUFJJT1JJVElFUyA9IFtcbiAgJ2NhbmRpZGF0ZScsXG4gICdzZXRMb2NhbERlc2NyaXB0aW9uJyxcbiAgJ3NldFJlbW90ZURlc2NyaXB0aW9uJyxcbiAgJ2NyZWF0ZUFuc3dlcicsXG4gICdjcmVhdGVPZmZlcidcbl07XG5cbi8vIGRlZmluZSBldmVudCBtYXBwaW5nc1xudmFyIE1FVEhPRF9FVkVOVFMgPSB7XG4gIHNldExvY2FsRGVzY3JpcHRpb246ICdzZXRsb2NhbGRlc2MnLFxuICBzZXRSZW1vdGVEZXNjcmlwdGlvbjogJ3NldHJlbW90ZWRlc2MnLFxuICBjcmVhdGVPZmZlcjogJ29mZmVyJyxcbiAgY3JlYXRlQW5zd2VyOiAnYW5zd2VyJ1xufTtcblxuLy8gZGVmaW5lIHN0YXRlcyBpbiB3aGljaCB3ZSB3aWxsIGF0dGVtcHQgdG8gZmluYWxpemUgYSBjb25uZWN0aW9uIG9uIHJlY2VpdmluZyBhIHJlbW90ZSBvZmZlclxudmFyIFZBTElEX1JFU1BPTlNFX1NUQVRFUyA9IFsnaGF2ZS1yZW1vdGUtb2ZmZXInLCAnaGF2ZS1sb2NhbC1wcmFuc3dlciddO1xuXG4vKipcbiAgIyBydGMtdGFza3F1ZXVlXG5cbiAgVGhpcyBpcyBhIHBhY2thZ2UgdGhhdCBhc3Npc3RzIHdpdGggYXBwbHlpbmcgYWN0aW9ucyB0byBhbiBgUlRDUGVlckNvbm5lY3Rpb25gXG4gIGluIGFzIHJlbGlhYmxlIG9yZGVyIGFzIHBvc3NpYmxlLiBJdCBpcyBwcmltYXJpbHkgdXNlZCBieSB0aGUgY291cGxpbmcgbG9naWNcbiAgb2YgdGhlIFtgcnRjLXRvb2xzYF0oaHR0cHM6Ly9naXRodWIuY29tL3J0Yy1pby9ydGMtdG9vbHMpLlxuXG4gICMjIEV4YW1wbGUgVXNhZ2VcblxuICBGb3IgdGhlIG1vbWVudCwgcmVmZXIgdG8gdGhlIHNpbXBsZSBjb3VwbGluZyB0ZXN0IGFzIGFuIGV4YW1wbGUgb2YgaG93IHRvIHVzZVxuICB0aGlzIHBhY2thZ2UgKHNlZSBiZWxvdyk6XG5cbiAgPDw8IHRlc3QvY291cGxlLmpzXG5cbioqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihwYywgb3B0cykge1xuICAvLyBjcmVhdGUgdGhlIHRhc2sgcXVldWVcbiAgdmFyIHF1ZXVlID0gbmV3IFByaW9yaXR5UXVldWUob3JkZXJUYXNrcyk7XG4gIHZhciB0cSA9IHJlcXVpcmUoJ21idXMnKSgnJywgKG9wdHMgfHwge30pLmxvZ2dlcik7XG5cbiAgLy8gaW5pdGlhbGlzZSB0YXNrIGltcG9ydGFuY2VcbiAgdmFyIHByaW9yaXRpZXMgPSAob3B0cyB8fCB7fSkucHJpb3JpdGllcyB8fCBERUZBVUxUX1BSSU9SSVRJRVM7XG5cbiAgLy8gY2hlY2sgZm9yIHBsdWdpbiB1c2FnZVxuICB2YXIgcGx1Z2luID0gZmluZFBsdWdpbigob3B0cyB8fCB7fSkucGx1Z2lucyk7XG5cbiAgLy8gaW5pdGlhbGlzZSBzdGF0ZSB0cmFja2luZ1xuICB2YXIgY2hlY2tRdWV1ZVRpbWVyID0gMDtcbiAgdmFyIGN1cnJlbnRUYXNrO1xuICB2YXIgZGVmYXVsdEZhaWwgPSB0cS5iaW5kKHRxLCAnZmFpbCcpO1xuXG4gIC8vIGxvb2sgZm9yIGFuIHNkcGZpbHRlciBmdW5jdGlvbiAoYWxsb3cgc2xpZ2h0IG1pcy1zcGVsbGluZ3MpXG4gIHZhciBzZHBGaWx0ZXIgPSAob3B0cyB8fCB7fSkuc2RwZmlsdGVyIHx8IChvcHRzIHx8IHt9KS5zZHBGaWx0ZXI7XG5cbiAgLy8gaW5pdGlhbGlzZSBzZXNzaW9uIGRlc2NyaXB0aW9uIGFuZCBpY2VjYW5kaWRhdGUgb2JqZWN0c1xuICB2YXIgUlRDU2Vzc2lvbkRlc2NyaXB0aW9uID0gKG9wdHMgfHwge30pLlJUQ1Nlc3Npb25EZXNjcmlwdGlvbiB8fFxuICAgIGRldGVjdCgnUlRDU2Vzc2lvbkRlc2NyaXB0aW9uJyk7XG5cbiAgdmFyIFJUQ0ljZUNhbmRpZGF0ZSA9IChvcHRzIHx8IHt9KS5SVENJY2VDYW5kaWRhdGUgfHxcbiAgICBkZXRlY3QoJ1JUQ0ljZUNhbmRpZGF0ZScpO1xuXG4gIGZ1bmN0aW9uIGFib3J0UXVldWUoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnIpO1xuICB9XG5cbiAgZnVuY3Rpb24gYXBwbHlDYW5kaWRhdGUodGFzaywgbmV4dCkge1xuICAgIHZhciBkYXRhID0gdGFzay5hcmdzWzBdO1xuICAgIHZhciBjYW5kaWRhdGUgPSBkYXRhICYmIGRhdGEuY2FuZGlkYXRlICYmIGNyZWF0ZUljZUNhbmRpZGF0ZShkYXRhKTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZU9rKCkge1xuICAgICAgdHEoJ2ljZS5yZW1vdGUuYXBwbGllZCcsIGNhbmRpZGF0ZSk7XG4gICAgICBuZXh0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlRmFpbChlcnIpIHtcbiAgICAgIHRxKCdpY2UucmVtb3RlLmludmFsaWQnLCBjYW5kaWRhdGUpO1xuICAgICAgbmV4dChlcnIpO1xuICAgIH1cblxuICAgIC8vIHdlIGhhdmUgYSBudWxsIGNhbmRpZGF0ZSwgd2UgaGF2ZSBmaW5pc2hlZCBnYXRoZXJpbmcgY2FuZGlkYXRlc1xuICAgIGlmICghIGNhbmRpZGF0ZSkge1xuICAgICAgcmV0dXJuIG5leHQoKTtcbiAgICB9XG5cbiAgICBwYy5hZGRJY2VDYW5kaWRhdGUoY2FuZGlkYXRlLCBoYW5kbGVPaywgaGFuZGxlRmFpbCk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1F1ZXVlKCkge1xuICAgIC8vIHBlZWsgYXQgdGhlIG5leHQgaXRlbSBvbiB0aGUgcXVldWVcbiAgICB2YXIgbmV4dCA9ICghIHF1ZXVlLmlzRW1wdHkoKSkgJiYgKCEgY3VycmVudFRhc2spICYmIHF1ZXVlLnBlZWsoKTtcbiAgICB2YXIgcmVhZHkgPSBuZXh0ICYmIHRlc3RSZWFkeShuZXh0KTtcbiAgICB2YXIgcmV0cnkgPSAoISBxdWV1ZS5pc0VtcHR5KCkpICYmIGlzTm90Q2xvc2VkKHBjKTtcblxuICAgIC8vIHJlc2V0IHRoZSBxdWV1ZSB0aW1lclxuICAgIGNoZWNrUXVldWVUaW1lciA9IDA7XG5cbiAgICAvLyBpZiB3ZSBkb24ndCBoYXZlIGEgdGFzayByZWFkeSwgdGhlbiBhYm9ydFxuICAgIGlmICghIHJlYWR5KSB7XG4gICAgICByZXR1cm4gcmV0cnkgJiYgdHJpZ2dlclF1ZXVlQ2hlY2soKTtcbiAgICB9XG5cbiAgICAvLyB1cGRhdGUgdGhlIGN1cnJlbnQgdGFzayAoZGVxdWV1ZSlcbiAgICBjdXJyZW50VGFzayA9IHF1ZXVlLmRlcSgpO1xuXG4gICAgLy8gcHJvY2VzcyB0aGUgdGFza1xuICAgIGN1cnJlbnRUYXNrLmZuKGN1cnJlbnRUYXNrLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIHZhciBmYWlsID0gY3VycmVudFRhc2suZmFpbCB8fCBkZWZhdWx0RmFpbDtcbiAgICAgIHZhciBwYXNzID0gY3VycmVudFRhc2sucGFzcztcbiAgICAgIHZhciB0YXNrTmFtZSA9IGN1cnJlbnRUYXNrLm5hbWU7XG5cbiAgICAgIC8vIGlmIGVycm9yZWQsIGZhaWxcbiAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih0YXNrTmFtZSArICcgdGFzayBmYWlsZWQ6ICcsIGVycik7XG4gICAgICAgIHJldHVybiBmYWlsKGVycik7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgcGFzcyA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHBhc3MuYXBwbHkoY3VycmVudFRhc2ssIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICB9XG5cbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGN1cnJlbnRUYXNrID0gbnVsbDtcbiAgICAgICAgdHJpZ2dlclF1ZXVlQ2hlY2soKTtcbiAgICAgIH0sIDApO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2xlYW5zZHAoZGVzYykge1xuICAgIC8vIGVuc3VyZSB3ZSBoYXZlIGNsZWFuIHNkcFxuICAgIHZhciBzZHBFcnJvcnMgPSBbXTtcbiAgICB2YXIgc2RwID0gZGVzYyAmJiBzZHBjbGVhbihkZXNjLnNkcCwgeyBjb2xsZWN0b3I6IHNkcEVycm9ycyB9KTtcblxuICAgIC8vIGlmIHdlIGRvbid0IGhhdmUgYSBtYXRjaCwgbG9nIHNvbWUgaW5mb1xuICAgIGlmIChkZXNjICYmIHNkcCAhPT0gZGVzYy5zZHApIHtcbiAgICAgIGNvbnNvbGUuaW5mbygnaW52YWxpZCBsaW5lcyByZW1vdmVkIGZyb20gc2RwOiAnLCBzZHBFcnJvcnMpO1xuICAgICAgZGVzYy5zZHAgPSBzZHA7XG4gICAgfVxuXG4gICAgLy8gaWYgYSBmaWx0ZXIgaGFzIGJlZW4gc3BlY2lmaWVkLCB0aGVuIGFwcGx5IHRoZSBmaWx0ZXJcbiAgICBpZiAodHlwZW9mIHNkcEZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBkZXNjLnNkcCA9IHNkcEZpbHRlcihkZXNjLnNkcCwgcGMpO1xuICAgIH1cblxuICAgIHJldHVybiBkZXNjO1xuICB9XG5cbiAgZnVuY3Rpb24gY29tcGxldGVDb25uZWN0aW9uKCkge1xuICAgIGlmIChWQUxJRF9SRVNQT05TRV9TVEFURVMuaW5kZXhPZihwYy5zaWduYWxpbmdTdGF0ZSkgPj0gMCkge1xuICAgICAgcmV0dXJuIHRxLmNyZWF0ZUFuc3dlcigpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUljZUNhbmRpZGF0ZShkYXRhKSB7XG4gICAgaWYgKHBsdWdpbiAmJiB0eXBlb2YgcGx1Z2luLmNyZWF0ZUljZUNhbmRpZGF0ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcGx1Z2luLmNyZWF0ZUljZUNhbmRpZGF0ZShkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJUQ0ljZUNhbmRpZGF0ZShkYXRhKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbihkYXRhKSB7XG4gICAgaWYgKHBsdWdpbiAmJiB0eXBlb2YgcGx1Z2luLmNyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gcGx1Z2luLmNyZWF0ZVNlc3Npb25EZXNjcmlwdGlvbihkYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJUQ1Nlc3Npb25EZXNjcmlwdGlvbihkYXRhKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXRTZHAoKSB7XG4gICAgdHEoJ3NkcC5sb2NhbCcsIHRoaXMuYXJnc1swXSk7XG4gIH1cblxuICBmdW5jdGlvbiBlbnF1ZXVlKG5hbWUsIGhhbmRsZXIsIG9wdHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgICAgaWYgKG9wdHMgJiYgdHlwZW9mIG9wdHMucHJvY2Vzc0FyZ3MgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhcmdzID0gYXJncy5tYXAob3B0cy5wcm9jZXNzQXJncyk7XG4gICAgICB9XG5cbiAgICAgIHF1ZXVlLmVucSh7XG4gICAgICAgIGFyZ3M6IGFyZ3MsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIGZuOiBoYW5kbGVyLFxuXG4gICAgICAgIC8vIGluaXRpbGFpc2UgYW55IGNoZWNrcyB0aGF0IG5lZWQgdG8gYmUgZG9uZSBwcmlvclxuICAgICAgICAvLyB0byB0aGUgdGFzayBleGVjdXRpbmdcbiAgICAgICAgY2hlY2tzOiBbIGlzTm90Q2xvc2VkIF0uY29uY2F0KChvcHRzIHx8IHt9KS5jaGVja3MgfHwgW10pLFxuXG4gICAgICAgIC8vIGluaXRpYWxpc2UgdGhlIHBhc3MgYW5kIGZhaWwgaGFuZGxlcnNcbiAgICAgICAgcGFzczogKG9wdHMgfHwge30pLnBhc3MsXG4gICAgICAgIGZhaWw6IChvcHRzIHx8IHt9KS5mYWlsXG4gICAgICB9KTtcblxuICAgICAgdHJpZ2dlclF1ZXVlQ2hlY2soKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gZXhlY01ldGhvZCh0YXNrLCBuZXh0KSB7XG4gICAgdmFyIGZuID0gcGNbdGFzay5uYW1lXTtcbiAgICB2YXIgZXZlbnROYW1lID0gTUVUSE9EX0VWRU5UU1t0YXNrLm5hbWVdIHx8ICh0YXNrLm5hbWUgfHwgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIGNiQXJncyA9IFsgc3VjY2VzcywgZmFpbCBdO1xuICAgIHZhciBpc09mZmVyID0gdGFzay5uYW1lID09PSAnY3JlYXRlT2ZmZXInO1xuXG4gICAgZnVuY3Rpb24gZmFpbChlcnIpIHtcbiAgICAgIHRxLmFwcGx5KHRxLCBbICduZWdvdGlhdGUuZXJyb3InLCB0YXNrLm5hbWUsIGVyciBdLmNvbmNhdCh0YXNrLmFyZ3MpKTtcbiAgICAgIG5leHQoZXJyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xuICAgICAgdHEuYXBwbHkodHEsIFsgWyduZWdvdGlhdGUnLCBldmVudE5hbWUsICdvayddLCB0YXNrLm5hbWUgXS5jb25jYXQodGFzay5hcmdzKSk7XG4gICAgICBuZXh0LmFwcGx5KG51bGwsIFtudWxsXS5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBmbiAhPSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gbmV4dChuZXcgRXJyb3IoJ2Nhbm5vdCBjYWxsIFwiJyArIHRhc2submFtZSArICdcIiBvbiBSVENQZWVyQ29ubmVjdGlvbicpKTtcbiAgICB9XG5cbiAgICAvLyBpbnZva2UgdGhlIGZ1bmN0aW9uXG4gICAgdHEuYXBwbHkodHEsIFsnbmVnb3RpYXRlLicgKyBldmVudE5hbWVdLmNvbmNhdCh0YXNrLmFyZ3MpKTtcbiAgICBmbi5hcHBseShcbiAgICAgIHBjLFxuICAgICAgdGFzay5hcmdzLmNvbmNhdChjYkFyZ3MpLmNvbmNhdChpc09mZmVyID8gZ2VuZXJhdGVDb25zdHJhaW50cygpIDogW10pXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGV4dHJhY3RDYW5kaWRhdGVFdmVudERhdGEoZGF0YSkge1xuICAgIC8vIGV4dHJhY3QgbmVzdGVkIGNhbmRpZGF0ZSBkYXRhIChsaWtlIHdlIHdpbGwgc2VlIGluIGFuIGV2ZW50IGJlaW5nIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uKVxuICAgIHdoaWxlIChkYXRhICYmIGRhdGEuY2FuZGlkYXRlICYmIGRhdGEuY2FuZGlkYXRlLmNhbmRpZGF0ZSkge1xuICAgICAgZGF0YSA9IGRhdGEuY2FuZGlkYXRlO1xuICAgIH1cblxuICAgIHJldHVybiBkYXRhO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2VuZXJhdGVDb25zdHJhaW50cygpIHtcbiAgICB2YXIgYWxsb3dlZEtleXMgPSB7XG4gICAgICBvZmZlcnRvcmVjZWl2ZXZpZGVvOiAnT2ZmZXJUb1JlY2VpdmVWaWRlbycsXG4gICAgICBvZmZlcnRvcmVjZWl2ZWF1ZGlvOiAnT2ZmZXJUb1JlY2VpdmVBdWRpbycsXG4gICAgICBpY2VyZXN0YXJ0OiAnSWNlUmVzdGFydCcsXG4gICAgICB2b2ljZWFjdGl2aXR5ZGV0ZWN0aW9uOiAnVm9pY2VBY3Rpdml0eURldGVjdGlvbidcbiAgICB9O1xuXG4gICAgdmFyIGNvbnN0cmFpbnRzID0ge1xuICAgICAgT2ZmZXJUb1JlY2VpdmVWaWRlbzogdHJ1ZSxcbiAgICAgIE9mZmVyVG9SZWNlaXZlQXVkaW86IHRydWVcbiAgICB9O1xuXG4gICAgLy8gdXBkYXRlIGtub3duIGtleXMgdG8gbWF0Y2hcbiAgICBPYmplY3Qua2V5cyhvcHRzIHx8IHt9KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgaWYgKGFsbG93ZWRLZXlzW2tleS50b0xvd2VyQ2FzZSgpXSkge1xuICAgICAgICBjb25zdHJhaW50c1thbGxvd2VkS2V5c1trZXkudG9Mb3dlckNhc2UoKV1dID0gb3B0c1trZXldO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHsgbWFuZGF0b3J5OiBjb25zdHJhaW50cyB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzTG9jYWxPclJlbW90ZURlc2MocGMsIHRhc2spIHtcbiAgICByZXR1cm4gcGMuX19oYXNEZXNjIHx8IChwYy5fX2hhc0Rlc2MgPSAhIXBjLnJlbW90ZURlc2NyaXB0aW9uKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTm90TmVnb3RpYXRpbmcocGMpIHtcbiAgICByZXR1cm4gcGMuc2lnbmFsaW5nU3RhdGUgIT09ICdoYXZlLWxvY2FsLW9mZmVyJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTm90Q2xvc2VkKHBjKSB7XG4gICAgcmV0dXJuIHBjLnNpZ25hbGluZ1N0YXRlICE9PSAnY2xvc2VkJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzU3RhYmxlKHBjKSB7XG4gICAgcmV0dXJuIHBjLnNpZ25hbGluZ1N0YXRlID09PSAnc3RhYmxlJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzVmFsaWRDYW5kaWRhdGUocGMsIGRhdGEpIHtcbiAgICByZXR1cm4gZGF0YS5fX3ZhbGlkIHx8XG4gICAgICAoZGF0YS5fX3ZhbGlkID0gY2hlY2tDYW5kaWRhdGUoZGF0YS5hcmdzWzBdKS5sZW5ndGggPT09IDApO1xuICB9XG5cbiAgZnVuY3Rpb24gb3JkZXJUYXNrcyhhLCBiKSB7XG4gICAgLy8gYXBwbHkgZWFjaCBvZiB0aGUgY2hlY2tzIGZvciBlYWNoIHRhc2tcbiAgICB2YXIgdGFza3MgPSBbYSxiXTtcbiAgICB2YXIgcmVhZGluZXNzID0gdGFza3MubWFwKHRlc3RSZWFkeSk7XG4gICAgdmFyIHRhc2tQcmlvcml0aWVzID0gdGFza3MubWFwKGZ1bmN0aW9uKHRhc2ssIGlkeCkge1xuICAgICAgdmFyIHJlYWR5ID0gcmVhZGluZXNzW2lkeF07XG4gICAgICB2YXIgcHJpb3JpdHkgPSByZWFkeSAmJiBwcmlvcml0aWVzLmluZGV4T2YodGFzay5uYW1lKTtcblxuICAgICAgcmV0dXJuIHJlYWR5ID8gKHByaW9yaXR5ID49IDAgPyBwcmlvcml0eSA6IFBSSU9SSVRZX0xPVykgOiBQUklPUklUWV9XQUlUO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRhc2tQcmlvcml0aWVzWzFdIC0gdGFza1ByaW9yaXRpZXNbMF07XG4gIH1cblxuICAvLyBjaGVjayB3aGV0aGVyIGEgdGFzayBpcyByZWFkeSAoZG9lcyBpdCBwYXNzIGFsbCB0aGUgY2hlY2tzKVxuICBmdW5jdGlvbiB0ZXN0UmVhZHkodGFzaykge1xuICAgIHJldHVybiAodGFzay5jaGVja3MgfHwgW10pLnJlZHVjZShmdW5jdGlvbihtZW1vLCBjaGVjaykge1xuICAgICAgcmV0dXJuIG1lbW8gJiYgY2hlY2socGMsIHRhc2spO1xuICAgIH0sIHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJpZ2dlclF1ZXVlQ2hlY2soKSB7XG4gICAgaWYgKGNoZWNrUXVldWVUaW1lcikgcmV0dXJuO1xuICAgIGNoZWNrUXVldWVUaW1lciA9IHNldFRpbWVvdXQoY2hlY2tRdWV1ZSwgNTApO1xuICB9XG5cbiAgLy8gcGF0Y2ggaW4gdGhlIHF1ZXVlIGhlbHBlciBtZXRob2RzXG4gIHRxLmFkZEljZUNhbmRpZGF0ZSA9IGVucXVldWUoJ2FkZEljZUNhbmRpZGF0ZScsIGFwcGx5Q2FuZGlkYXRlLCB7XG4gICAgcHJvY2Vzc0FyZ3M6IGV4dHJhY3RDYW5kaWRhdGVFdmVudERhdGEsXG4gICAgY2hlY2tzOiBbIGhhc0xvY2FsT3JSZW1vdGVEZXNjLCBpc1ZhbGlkQ2FuZGlkYXRlIF1cbiAgfSk7XG5cbiAgdHEuc2V0TG9jYWxEZXNjcmlwdGlvbiA9IGVucXVldWUoJ3NldExvY2FsRGVzY3JpcHRpb24nLCBleGVjTWV0aG9kLCB7XG4gICAgcHJvY2Vzc0FyZ3M6IGNsZWFuc2RwLFxuICAgIHBhc3M6IGVtaXRTZHBcbiAgfSk7XG5cbiAgdHEuc2V0UmVtb3RlRGVzY3JpcHRpb24gPSBlbnF1ZXVlKCdzZXRSZW1vdGVEZXNjcmlwdGlvbicsIGV4ZWNNZXRob2QsIHtcbiAgICBwcm9jZXNzQXJnczogY3JlYXRlU2Vzc2lvbkRlc2NyaXB0aW9uLFxuICAgIHBhc3M6IGNvbXBsZXRlQ29ubmVjdGlvblxuICB9KTtcblxuICB0cS5jcmVhdGVPZmZlciA9IGVucXVldWUoJ2NyZWF0ZU9mZmVyJywgZXhlY01ldGhvZCwge1xuICAgIGNoZWNrczogWyBpc05vdE5lZ290aWF0aW5nIF0sXG4gICAgcGFzczogdHEuc2V0TG9jYWxEZXNjcmlwdGlvblxuICB9KTtcblxuICB0cS5jcmVhdGVBbnN3ZXIgPSBlbnF1ZXVlKCdjcmVhdGVBbnN3ZXInLCBleGVjTWV0aG9kLCB7XG4gICAgcGFzczogdHEuc2V0TG9jYWxEZXNjcmlwdGlvblxuICB9KTtcblxuICByZXR1cm4gdHE7XG59O1xuIiwiLyoqXG4gKiBFeHBvc2UgYFByaW9yaXR5UXVldWVgLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IFByaW9yaXR5UXVldWU7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYSBuZXcgZW1wdHkgYFByaW9yaXR5UXVldWVgIHdpdGggdGhlIGdpdmVuIGBjb21wYXJhdG9yKGEsIGIpYFxuICogZnVuY3Rpb24sIHVzZXMgYC5ERUZBVUxUX0NPTVBBUkFUT1IoKWAgd2hlbiBubyBmdW5jdGlvbiBpcyBwcm92aWRlZC5cbiAqXG4gKiBUaGUgY29tcGFyYXRvciBmdW5jdGlvbiBtdXN0IHJldHVybiBhIHBvc2l0aXZlIG51bWJlciB3aGVuIGBhID4gYmAsIDAgd2hlblxuICogYGEgPT0gYmAgYW5kIGEgbmVnYXRpdmUgbnVtYmVyIHdoZW4gYGEgPCBiYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufVxuICogQHJldHVybiB7UHJpb3JpdHlRdWV1ZX1cbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIFByaW9yaXR5UXVldWUoY29tcGFyYXRvcikge1xuICB0aGlzLl9jb21wYXJhdG9yID0gY29tcGFyYXRvciB8fCBQcmlvcml0eVF1ZXVlLkRFRkFVTFRfQ09NUEFSQVRPUjtcbiAgdGhpcy5fZWxlbWVudHMgPSBbXTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyBgYWAgYW5kIGBiYCwgd2hlbiBgYSA+IGJgIGl0IHJldHVybnMgYSBwb3NpdGl2ZSBudW1iZXIsIHdoZW5cbiAqIGl0IHJldHVybnMgMCBhbmQgd2hlbiBgYSA8IGJgIGl0IHJldHVybnMgYSBuZWdhdGl2ZSBudW1iZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8TnVtYmVyfSBhXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IGJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW9yaXR5UXVldWUuREVGQVVMVF9DT01QQVJBVE9SID0gZnVuY3Rpb24oYSwgYikge1xuICBpZiAoYSBpbnN0YW5jZW9mIE51bWJlciAmJiBiIGluc3RhbmNlb2YgTnVtYmVyKSB7XG4gICAgcmV0dXJuIGEgLSBiO1xuICB9IGVsc2Uge1xuICAgIGEgPSBhLnRvU3RyaW5nKCk7XG4gICAgYiA9IGIudG9TdHJpbmcoKTtcblxuICAgIGlmIChhID09IGIpIHJldHVybiAwO1xuXG4gICAgcmV0dXJuIChhID4gYikgPyAxIDogLTE7XG4gIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoZSBwcmlvcml0eSBxdWV1ZSBpcyBlbXB0eSBvciBub3QuXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW9yaXR5UXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc2l6ZSgpID09PSAwO1xufTtcblxuLyoqXG4gKiBQZWVrcyBhdCB0aGUgdG9wIGVsZW1lbnQgb2YgdGhlIHByaW9yaXR5IHF1ZXVlLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEB0aHJvd3Mge0Vycm9yfSB3aGVuIHRoZSBxdWV1ZSBpcyBlbXB0eS5cbiAqIEBhcGkgcHVibGljXG4gKi9cblByaW9yaXR5UXVldWUucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHRoaXMuaXNFbXB0eSgpKSB0aHJvdyBuZXcgRXJyb3IoJ1ByaW9yaXR5UXVldWUgaXMgZW1wdHknKTtcblxuICByZXR1cm4gdGhpcy5fZWxlbWVudHNbMF07XG59O1xuXG4vKipcbiAqIERlcXVldWVzIHRoZSB0b3AgZWxlbWVudCBvZiB0aGUgcHJpb3JpdHkgcXVldWUuXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQHRocm93cyB7RXJyb3J9IHdoZW4gdGhlIHF1ZXVlIGlzIGVtcHR5LlxuICogQGFwaSBwdWJsaWNcbiAqL1xuUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuZGVxID0gZnVuY3Rpb24oKSB7XG4gIHZhciBmaXJzdCA9IHRoaXMucGVlaygpO1xuICB2YXIgbGFzdCA9IHRoaXMuX2VsZW1lbnRzLnBvcCgpO1xuICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZSgpO1xuXG4gIGlmIChzaXplID09PSAwKSByZXR1cm4gZmlyc3Q7XG5cbiAgdGhpcy5fZWxlbWVudHNbMF0gPSBsYXN0O1xuICB2YXIgY3VycmVudCA9IDA7XG5cbiAgd2hpbGUgKGN1cnJlbnQgPCBzaXplKSB7XG4gICAgdmFyIGxhcmdlc3QgPSBjdXJyZW50O1xuICAgIHZhciBsZWZ0ID0gKDIgKiBjdXJyZW50KSArIDE7XG4gICAgdmFyIHJpZ2h0ID0gKDIgKiBjdXJyZW50KSArIDI7XG5cbiAgICBpZiAobGVmdCA8IHNpemUgJiYgdGhpcy5fY29tcGFyZShsZWZ0LCBsYXJnZXN0KSA+IDApIHtcbiAgICAgIGxhcmdlc3QgPSBsZWZ0O1xuICAgIH1cblxuICAgIGlmIChyaWdodCA8IHNpemUgJiYgdGhpcy5fY29tcGFyZShyaWdodCwgbGFyZ2VzdCkgPiAwKSB7XG4gICAgICBsYXJnZXN0ID0gcmlnaHQ7XG4gICAgfVxuXG4gICAgaWYgKGxhcmdlc3QgPT09IGN1cnJlbnQpIGJyZWFrO1xuXG4gICAgdGhpcy5fc3dhcChsYXJnZXN0LCBjdXJyZW50KTtcbiAgICBjdXJyZW50ID0gbGFyZ2VzdDtcbiAgfVxuXG4gIHJldHVybiBmaXJzdDtcbn07XG5cbi8qKlxuICogRW5xdWV1ZXMgdGhlIGBlbGVtZW50YCBhdCB0aGUgcHJpb3JpdHkgcXVldWUgYW5kIHJldHVybnMgaXRzIG5ldyBzaXplLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50XG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5Qcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5lbnEgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIHZhciBzaXplID0gdGhpcy5fZWxlbWVudHMucHVzaChlbGVtZW50KTtcbiAgdmFyIGN1cnJlbnQgPSBzaXplIC0gMTtcblxuICB3aGlsZSAoY3VycmVudCA+IDApIHtcbiAgICB2YXIgcGFyZW50ID0gTWF0aC5mbG9vcigoY3VycmVudCAtIDEpIC8gMik7XG5cbiAgICBpZiAodGhpcy5fY29tcGFyZShjdXJyZW50LCBwYXJlbnQpIDwgMCkgYnJlYWs7XG5cbiAgICB0aGlzLl9zd2FwKHBhcmVudCwgY3VycmVudCk7XG4gICAgY3VycmVudCA9IHBhcmVudDtcbiAgfVxuXG4gIHJldHVybiBzaXplO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBwcmlvcml0eSBxdWV1ZS5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5Qcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLl9lbGVtZW50cy5sZW5ndGg7XG59O1xuXG4vKipcbiAqICBJdGVyYXRlcyBvdmVyIHF1ZXVlIGVsZW1lbnRzXG4gKlxuICogIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cblByaW9yaXR5UXVldWUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmbikge1xuICByZXR1cm4gdGhpcy5fZWxlbWVudHMuZm9yRWFjaChmbik7XG59O1xuXG4vKipcbiAqIENvbXBhcmVzIHRoZSB2YWx1ZXMgYXQgcG9zaXRpb24gYGFgIGFuZCBgYmAgaW4gdGhlIHByaW9yaXR5IHF1ZXVlIHVzaW5nIGl0c1xuICogY29tcGFyYXRvciBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYVxuICogQHBhcmFtIHtOdW1iZXJ9IGJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5Qcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5fY29tcGFyZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIHRoaXMuX2NvbXBhcmF0b3IodGhpcy5fZWxlbWVudHNbYV0sIHRoaXMuX2VsZW1lbnRzW2JdKTtcbn07XG5cbi8qKlxuICogU3dhcHMgdGhlIHZhbHVlcyBhdCBwb3NpdGlvbiBgYWAgYW5kIGBiYCBpbiB0aGUgcHJpb3JpdHkgcXVldWUuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGFcbiAqIEBwYXJhbSB7TnVtYmVyfSBiXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuX3N3YXAgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBhdXggPSB0aGlzLl9lbGVtZW50c1thXTtcbiAgdGhpcy5fZWxlbWVudHNbYV0gPSB0aGlzLl9lbGVtZW50c1tiXTtcbiAgdGhpcy5fZWxlbWVudHNbYl0gPSBhdXg7XG59O1xuIiwidmFyIHZhbGlkYXRvcnMgPSBbXG4gIFsgL14oYVxcPWNhbmRpZGF0ZS4qKSQvLCByZXF1aXJlKCdydGMtdmFsaWRhdG9yL2NhbmRpZGF0ZScpIF1cbl07XG5cbnZhciByZVNkcExpbmVCcmVhayA9IC8oXFxyP1xcbnxcXFxcclxcXFxuKS87XG5cbi8qKlxuICAjIHJ0Yy1zZHBjbGVhblxuXG4gIFJlbW92ZSBpbnZhbGlkIGxpbmVzIGZyb20geW91ciBTRFAuXG5cbiAgIyMgV2h5P1xuXG4gIFRoaXMgbW9kdWxlIHJlbW92ZXMgdGhlIG9jY2FzaW9uYWwgXCJiYWQgZWdnXCIgdGhhdCB3aWxsIHNsaXAgaW50byBTRFAgd2hlbiBpdFxuICBpcyBnZW5lcmF0ZWQgYnkgdGhlIGJyb3dzZXIuICBJbiBwYXJ0aWN1bGFyIHRoZXNlIHNpdHVhdGlvbnMgYXJlIGNhdGVyZWQgZm9yOlxuXG4gIC0gaW52YWxpZCBJQ0UgY2FuZGlkYXRlc1xuXG4qKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5wdXQsIG9wdHMpIHtcbiAgdmFyIGxpbmVCcmVhayA9IGRldGVjdExpbmVCcmVhayhpbnB1dCk7XG4gIHZhciBsaW5lcyA9IGlucHV0LnNwbGl0KGxpbmVCcmVhayk7XG4gIHZhciBjb2xsZWN0b3IgPSAob3B0cyB8fCB7fSkuY29sbGVjdG9yO1xuXG4gIC8vIGZpbHRlciBvdXQgaW52YWxpZCBsaW5lc1xuICBsaW5lcyA9IGxpbmVzLmZpbHRlcihmdW5jdGlvbihsaW5lKSB7XG4gICAgLy8gaXRlcmF0ZSB0aHJvdWdoIHRoZSB2YWxpZGF0b3JzIGFuZCB1c2UgdGhlIG9uZSB0aGF0IG1hdGNoZXNcbiAgICB2YXIgdmFsaWRhdG9yID0gdmFsaWRhdG9ycy5yZWR1Y2UoZnVuY3Rpb24obWVtbywgZGF0YSwgaWR4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG1lbW8gIT0gJ3VuZGVmaW5lZCcgPyBtZW1vIDogKGRhdGFbMF0uZXhlYyhsaW5lKSAmJiB7XG4gICAgICAgIGxpbmU6IGxpbmUucmVwbGFjZShkYXRhWzBdLCAnJDEnKSxcbiAgICAgICAgZm46IGRhdGFbMV1cbiAgICAgIH0pO1xuICAgIH0sIHVuZGVmaW5lZCk7XG5cbiAgICAvLyBpZiB3ZSBoYXZlIGEgdmFsaWRhdG9yLCBlbnN1cmUgd2UgaGF2ZSBubyBlcnJvcnNcbiAgICB2YXIgZXJyb3JzID0gdmFsaWRhdG9yID8gdmFsaWRhdG9yLmZuKHZhbGlkYXRvci5saW5lKSA6IFtdO1xuXG4gICAgLy8gaWYgd2UgaGF2ZSBlcnJvcnMgYW5kIGFuIGVycm9yIGNvbGxlY3RvciwgdGhlbiBhZGQgdG8gdGhlIGNvbGxlY3RvclxuICAgIGlmIChjb2xsZWN0b3IpIHtcbiAgICAgIGVycm9ycy5mb3JFYWNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb2xsZWN0b3IucHVzaChlcnIpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9ycy5sZW5ndGggPT09IDA7XG4gIH0pO1xuXG4gIHJldHVybiBsaW5lcy5qb2luKGxpbmVCcmVhayk7XG59O1xuXG5mdW5jdGlvbiBkZXRlY3RMaW5lQnJlYWsoaW5wdXQpIHtcbiAgdmFyIG1hdGNoID0gcmVTZHBMaW5lQnJlYWsuZXhlYyhpbnB1dCk7XG5cbiAgcmV0dXJuIG1hdGNoICYmIG1hdGNoWzBdO1xufVxuIiwidmFyIGRlYnVnID0gcmVxdWlyZSgnY29nL2xvZ2dlcicpKCdydGMtdmFsaWRhdG9yJyk7XG52YXIgcmVQcmVmaXggPSAvXig/OmE9KT9jYW5kaWRhdGU6LztcbnZhciByZUlQID0gL14oXFxkK1xcLil7M31cXGQrJC87XG5cbi8qXG5cbnZhbGlkYXRpb24gcnVsZXMgYXMgcGVyOlxuaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaWV0Zi1tbXVzaWMtaWNlLXNpcC1zZHAtMDMjc2VjdGlvbi04LjFcblxuICAgY2FuZGlkYXRlLWF0dHJpYnV0ZSAgID0gXCJjYW5kaWRhdGVcIiBcIjpcIiBmb3VuZGF0aW9uIFNQIGNvbXBvbmVudC1pZCBTUFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNwb3J0IFNQXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBwcmlvcml0eSBTUFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ubmVjdGlvbi1hZGRyZXNzIFNQICAgICA7ZnJvbSBSRkMgNDU2NlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9ydCAgICAgICAgIDtwb3J0IGZyb20gUkZDIDQ1NjZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIFNQIGNhbmQtdHlwZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgW1NQIHJlbC1hZGRyXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgW1NQIHJlbC1wb3J0XVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgKihTUCBleHRlbnNpb24tYXR0LW5hbWUgU1BcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXh0ZW5zaW9uLWF0dC12YWx1ZSlcblxuICAgZm91bmRhdGlvbiAgICAgICAgICAgID0gMSozMmljZS1jaGFyXG4gICBjb21wb25lbnQtaWQgICAgICAgICAgPSAxKjVESUdJVFxuICAgdHJhbnNwb3J0ICAgICAgICAgICAgID0gXCJVRFBcIiAvIHRyYW5zcG9ydC1leHRlbnNpb25cbiAgIHRyYW5zcG9ydC1leHRlbnNpb24gICA9IHRva2VuICAgICAgICAgICAgICA7IGZyb20gUkZDIDMyNjFcbiAgIHByaW9yaXR5ICAgICAgICAgICAgICA9IDEqMTBESUdJVFxuICAgY2FuZC10eXBlICAgICAgICAgICAgID0gXCJ0eXBcIiBTUCBjYW5kaWRhdGUtdHlwZXNcbiAgIGNhbmRpZGF0ZS10eXBlcyAgICAgICA9IFwiaG9zdFwiIC8gXCJzcmZseFwiIC8gXCJwcmZseFwiIC8gXCJyZWxheVwiIC8gdG9rZW5cbiAgIHJlbC1hZGRyICAgICAgICAgICAgICA9IFwicmFkZHJcIiBTUCBjb25uZWN0aW9uLWFkZHJlc3NcbiAgIHJlbC1wb3J0ICAgICAgICAgICAgICA9IFwicnBvcnRcIiBTUCBwb3J0XG4gICBleHRlbnNpb24tYXR0LW5hbWUgICAgPSB0b2tlblxuICAgZXh0ZW5zaW9uLWF0dC12YWx1ZSAgID0gKlZDSEFSXG4gICBpY2UtY2hhciAgICAgICAgICAgICAgPSBBTFBIQSAvIERJR0lUIC8gXCIrXCIgLyBcIi9cIlxuKi9cbnZhciBwYXJ0VmFsaWRhdGlvbiA9IFtcbiAgWyAvLisvLCAnaW52YWxpZCBmb3VuZGF0aW9uIGNvbXBvbmVudCcsICdmb3VuZGF0aW9uJyBdLFxuICBbIC9cXGQrLywgJ2ludmFsaWQgY29tcG9uZW50IGlkJywgJ2NvbXBvbmVudC1pZCcgXSxcbiAgWyAvKFVEUHxUQ1ApL2ksICd0cmFuc3BvcnQgbXVzdCBiZSBUQ1Agb3IgVURQJywgJ3RyYW5zcG9ydCcgXSxcbiAgWyAvXFxkKy8sICdudW1lcmljIHByaW9yaXR5IGV4cGVjdGVkJywgJ3ByaW9yaXR5JyBdLFxuICBbIHJlSVAsICdpbnZhbGlkIGNvbm5lY3Rpb24gYWRkcmVzcycsICdjb25uZWN0aW9uLWFkZHJlc3MnIF0sXG4gIFsgL1xcZCsvLCAnaW52YWxpZCBjb25uZWN0aW9uIHBvcnQnLCAnY29ubmVjdGlvbi1wb3J0JyBdLFxuICBbIC90eXAvLCAnRXhwZWN0ZWQgXCJ0eXBcIiBpZGVudGlmaWVyJywgJ3R5cGUgY2xhc3NpZmllcicgXSxcbiAgWyAvLisvLCAnSW52YWxpZCBjYW5kaWRhdGUgdHlwZSBzcGVjaWZpZWQnLCAnY2FuZGlkYXRlLXR5cGUnIF1cbl07XG5cbi8qKlxuICAjIyMgYHJ0Yy12YWxpZGF0b3IvY2FuZGlkYXRlYFxuXG4gIFZhbGlkYXRlIHRoYXQgYW4gYFJUQ0ljZUNhbmRpZGF0ZWAgKG9yIHBsYWluIG9sZCBvYmplY3Qgd2l0aCBkYXRhLCBzZHBNaWQsXG4gIGV0YyBhdHRyaWJ1dGVzKSBpcyBhIHZhbGlkIGljZSBjYW5kaWRhdGUuXG5cbiAgU3BlY3MgcmV2aWV3ZWQgYXMgcGFydCBvZiB0aGUgdmFsaWRhdGlvbiBpbXBsZW1lbnRhdGlvbjpcblxuICAtIDxodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9kcmFmdC1pZXRmLW1tdXNpYy1pY2Utc2lwLXNkcC0wMyNzZWN0aW9uLTguMT5cbiAgLSA8aHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNTI0NT5cblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgdmFyIGVycm9ycyA9IFtdO1xuICB2YXIgY2FuZGlkYXRlID0gZGF0YSAmJiAoZGF0YS5jYW5kaWRhdGUgfHwgZGF0YSk7XG4gIHZhciBwcmVmaXhNYXRjaCA9IGNhbmRpZGF0ZSAmJiByZVByZWZpeC5leGVjKGNhbmRpZGF0ZSk7XG4gIHZhciBwYXJ0cyA9IHByZWZpeE1hdGNoICYmIGNhbmRpZGF0ZS5zbGljZShwcmVmaXhNYXRjaFswXS5sZW5ndGgpLnNwbGl0KC9cXHMvKTtcblxuICBpZiAoISBjYW5kaWRhdGUpIHtcbiAgICByZXR1cm4gWyBuZXcgRXJyb3IoJ2VtcHR5IGNhbmRpZGF0ZScpIF07XG4gIH1cblxuICAvLyBjaGVjayB0aGF0IHRoZSBwcmVmaXggbWF0Y2hlcyBleHBlY3RlZFxuICBpZiAoISBwcmVmaXhNYXRjaCkge1xuICAgIHJldHVybiBbIG5ldyBFcnJvcignY2FuZGlkYXRlIGRpZCBub3QgbWF0Y2ggZXhwZWN0ZWQgc2RwIGxpbmUgZm9ybWF0JykgXTtcbiAgfVxuXG4gIC8vIHBlcmZvcm0gdGhlIHBhcnQgdmFsaWRhdGlvblxuICBlcnJvcnMgPSBlcnJvcnMuY29uY2F0KHBhcnRzLm1hcCh2YWxpZGF0ZVBhcnRzKSkuZmlsdGVyKEJvb2xlYW4pO1xuXG4gIHJldHVybiBlcnJvcnM7XG59O1xuXG5mdW5jdGlvbiB2YWxpZGF0ZVBhcnRzKHBhcnQsIGlkeCkge1xuICB2YXIgdmFsaWRhdG9yID0gcGFydFZhbGlkYXRpb25baWR4XTtcblxuICBpZiAodmFsaWRhdG9yICYmICghIHZhbGlkYXRvclswXS50ZXN0KHBhcnQpKSkge1xuICAgIGRlYnVnKHZhbGlkYXRvclsyXSArICcgcGFydCBmYWlsZWQgdmFsaWRhdGlvbjogJyArIHBhcnQpO1xuICAgIHJldHVybiBuZXcgRXJyb3IodmFsaWRhdG9yWzFdKTtcbiAgfVxufVxuIl19
