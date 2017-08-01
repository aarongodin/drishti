import accessProperty from './util/access-property';
import shallowEqual from './util/shallow-equal';
import { makeError } from './util/log';

const INST_EVENT_LISTENERS = Symbol('INST_EVENT_LISTENERS');

/**
 * @private
 * Register an event type as actionable by adding a DOM event listener.
 *
 * @param {View} view
 * @param {string} eventType
 */
const ensureActionable = (view, eventType) => {
  const instance = instances.get(view);
  const listeners = instance.get(INST_EVENT_LISTENERS);

  if (listeners.some(([actionableEventType]) => eventType === actionableEventType)) {
    return;
  }

  const eventListener = createEventListenerCallback(view, eventType);

  view.element.addEventListener(eventType, eventListener);
  listeners.push([eventType, eventListener]);
  instance.set(INST_EVENT_LISTENERS, listeners);
};

/**
 * @private
 * Create a DOM event listener callback.
 *
 * @param {View} view
 * @param {string} eventType
 * @return {function}
 */
const createEventListenerCallback = (view, eventType) => {
  return (browserEvent) => {
    const actions = view.actions.get(eventType);
    const { target } = browserEvent;

    actions.forEach((callback, selector) => {
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
const createStoreSubscribeListener = (view) => {
  let currentState = view.store.getState();

  return () => {
    const nextState = view.store.getState();

    view.listeners.forEach((callbacks, propertyAccessor) => {
      const oldValue = accessProperty(currentState, propertyAccessor);
      const newValue = accessProperty(nextState, propertyAccessor);

      if (!shallowEqual(oldValue, newValue)) {
        callbacks.forEach(callback => {
          callback(oldValue, newValue);
        });
      }
    });

    currentState = nextState;
  };
};

/**
 * @private
 * Check options passed to the View constructor are valid.
 *
 * @param {object} options
 * @throws {Error}
 */
const checkOptionsAreValid = (options) => {
  if (typeof accessProperty(options, 'element.tagName') !== 'string') {
    makeError(View.displayName, 'options.element must be an Element.');
  }

  if (typeof accessProperty(options, 'store') !== 'object') {
    makeError(View.displayName, 'options.store must be defined');
  }

  const { store } = options;

  if (
    typeof accessProperty(store, 'dispatch') !== 'function' ||
    typeof accessProperty(store, 'subscribe') !== 'function'
  ) {
    makeError(View.displayName, 'options.store must be a Redux store');
  }
};

/**
 * @private
 * Private instance variables.
 *
 * @type {WeakMap<View, Map>}
 */
const instances = new WeakMap();

export class View {
  /**
   * @constructor
   *
   * @param {object} options
   * @param {Element} options.element
   * @param {ReduxStore} options.store
   */
  constructor (options = {}) {
    const {
      element = null,
      store = null
    } = options;

    checkOptionsAreValid(options);

    /** @type {Element} - A reference to the top-level element for this view */
    this.element = element;

    /** A redux store */
    this.store = store;

    /** @type {Map<string, Map>} - Internal state of registered actions */
    this.actions = new Map();

    /** @type {Map<string, array>} - Internal state of Redux listener callbacks */
    this.listeners = new Map();

    this.store.subscribe(createStoreSubscribeListener(this));
    instances.set(this, new Map([[INST_EVENT_LISTENERS, []]]));
  }

  /**
   * Add an event handler, delegated to events fired on elements matching a selector.
   *
   * @param {string} eventType
   * @param {string} selector
   * @param {function} callback
   */
  delegate (eventType, selector, callback) {
    let eventActions;

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
   * Remove the view's delegated event listeners.
   */
  undelegateAll () {
    const instance = instances.get(this);
    const listeners = instance.get(INST_EVENT_LISTENERS);

    listeners.forEach(([eventType, eventListener]) => {
      this.element.removeEventListener(eventType, eventListener);
    });

    instance.set(INST_EVENT_LISTENERS, []);
    this.actions.clear();
  }

  /**
   * Add a callback to be fired when properties on the Redux state change.
   *
   * @param {string} propertyAccessor
   * @param {function} callback
   */
  listen (propertyAccessor, callback) {
    if (!Array.isArray(this.listeners.get(propertyAccessor))) {
      this.listeners.set(propertyAccessor, []);
    }

    const callbacks = this.listeners.get(propertyAccessor);
    callbacks.push(callback);
    this.listeners.set(propertyAccessor, callbacks);
  }
}

View.displayName = 'View';
