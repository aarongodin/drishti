(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.Drishti = global.Drishti || {})));
}(this, (function (exports) { 'use strict';

function accessProperty(obj, prop, def) {
	var parts = prop.split('.');
	var result = parts.reduce(function (acc, p) {
		return acc ? acc[p] : undefined;
	}, obj);
	return result === undefined ? def : result;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * thank u fbjs
 */

var hasOwn = Object.prototype.hasOwnProperty;

function is(x, y) {
	if (x === y) {
		return x !== 0 || y !== 0 || 1 / x === 1 / y;
	}
	return x !== x && y !== y;
}

function shallowEqual(objA, objB) {
	if (is(objA, objB)) return true;

	if ((typeof objA === 'undefined' ? 'undefined' : _typeof(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : _typeof(objB)) !== 'object' || objB === null) {
		return false;
	}

	var keysA = Object.keys(objA);
	var keysB = Object.keys(objB);

	if (keysA.length !== keysB.length) return false;

	for (var i = 0; i < keysA.length; i++) {
		if (!hasOwn.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
			return false;
		}
	}

	return true;
}

var makeError = function makeError(klass, message) {
	throw new Error("ERROR - drishti:" + klass + " - " + message);
};

/**
 * @private
 * Register an event type as actionable by adding a DOM event listener.
 *
 * @param {View} view
 * @param {string} eventType
 */
var ensureActionable = function ensureActionable(view, eventType) {
	if (view.actionable.includes(eventType)) {
		return;
	}

	view.actionable.push(eventType);
	view.element.addEventListener(eventType, createEventListenerCallback(view, eventType));
};

/**
 * @private
 * Create a DOM event listener callback.
 *
 * @param {View} view
 * @param {string} eventType
 * @return {function}
 */
var createEventListenerCallback = function createEventListenerCallback(view, eventType) {
	return function (browserEvent) {
		var actions = view.actions.get(eventType);
		var target = browserEvent.target;


		actions.forEach(function (callback, selector) {
			if (target.matches(selector)) {
				callback(view.store.dispatch, browserEvent);
			}
		});
	};
};

/**
 * @private
 * Create the Redux subscribe listener to fire store change callbacks based on state changes.
 *
 * @param {View} view
 */
var createStoreSubscribeListener = function createStoreSubscribeListener(view) {
	var currentState = void 0;

	return function () {
		var nextState = view.store.getState();

		view.listeners.forEach(function (callbacks, propertyAccessor) {
			var oldValue = accessProperty(currentState, propertyAccessor);
			var newValue = accessProperty(nextState, propertyAccessor);

			if (!shallowEqual(oldValue, newValue)) {
				callbacks.forEach(function (callback) {
					callback(oldValue, newValue);
				});
			}
		});

		currentState = nextState;
	};
};

/**
 * Check options passed to the View constructor are valid.
 *
 * @param {object} options
 * @throws {Error}
 */
var checkOptionsAreValid = function checkOptionsAreValid(options) {
	if (typeof accessProperty(options, 'element.tagName') !== 'string') {
		makeError(View.displayName, 'options.element must be an Element');
	}

	if (_typeof(accessProperty(options, 'store')) !== 'object') {
		makeError(View.displayName, 'options.store must be defined');
	}

	var store = options.store;


	if (typeof accessProperty(store, 'dispatch') !== 'function' || typeof accessProperty(store, 'subscribe') !== 'function') {
		makeError(View.displayName, 'options.store must be a Redux store');
	}
};

var View = function () {
	/**
  * @constructor
  *
  * @param {object} options
  * @param {Element} options.element
  * @param {ReduxStore} options.store
  */
	function View() {
		var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		classCallCheck(this, View);
		var _options$element = options.element,
		    element = _options$element === undefined ? null : _options$element,
		    _options$store = options.store,
		    store = _options$store === undefined ? null : _options$store;


		checkOptionsAreValid(options);

		/** @type {Element} - A reference to the top-level element for this view */
		this.element = element;

		/** A redux store */
		this.store = store;

		/** @type {Map<string, Map>} - Internal state of registered actions */
		this.actions = new Map();

		/** @type {array} - Internal state of event types that are actionable */
		this.actionable = [];

		/** @type {Map<string, array>} - Internal state of Redux listener callbacks */
		this.listeners = new Map();

		this.store.subscribe(createStoreSubscribeListener(this));
	}

	/**
  * Add an event handler, delegated to events fired on elements matching a selector.
  *
  * @param {string} eventType
  * @param {string} selector
  * @param {function} callback
  */


	createClass(View, [{
		key: 'delegate',
		value: function delegate(eventType, selector, callback) {
			var eventActions = void 0;

			if (!this.actions.has(eventType)) {
				eventActions = new Map();
				this.actions.set(eventType, eventActions);
			} else {
				eventActions = this.actions.get(eventType);
			}

			if (!eventActions.has(selector)) {
				eventActions.set(selector, callback);
				ensureActionable(this, eventType);
			}
		}

		/**
   * Add a callback to be fired when properties on the Redux state change.
   *
   * @param {string} propertyAccessor
   * @param {function} callback
   */

	}, {
		key: 'listen',
		value: function listen(propertyAccessor, callback) {
			if (!Array.isArray(this.listeners.get(propertyAccessor))) {
				this.listeners.set(propertyAccessor, []);
			}

			var callbacks = this.listeners.get(propertyAccessor);
			callbacks.push(callback);
			this.listeners.set(propertyAccessor, callbacks);
		}
	}]);
	return View;
}();

View.displayName = 'View';

exports.View = View;

Object.defineProperty(exports, '__esModule', { value: true });

})));
