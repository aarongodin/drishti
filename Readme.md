# drishti

*Drishti* is a focused, minimal view for [Redux](https://github.com/reactjs/redux) meant for teeny tiny front-end applications.

[![npm](https://img.shields.io/npm/v/drishti.svg?style=flat-square)](https://www.npmjs.com/package/drishti)

### Features

- Delegate browser events
- Connect functions to Redux state values

## View

```js
import { View } from 'drishti';
```

The *View* class exposes two primary methods for interacting with Redux and the DOM—`delegate` and `listen`. The easiest way to use these is to create a class that extends *View*. Calling `delegate` and `listen` in your constructor is the best place to initialize callbacks for DOM events and Redux state changes.

#### constructor

A *View* requires two arguments: an element and a redux store.

```js
const element = document.createElement('div');
const store = createStore((state, action) => state);

const view = new View({ element, store });
```

*Usage in a class*—be sure to call `super` with the passed options. For example:

```js
class HeaderView extends View {
  constructor (options) {
    super(options);

    // ...
  }
}
```

#### delegate

`delegate(eventType: string, selector: string, callback: func): void`

Add a DOM event listener, delegated to events fired on elements matching a selector.

*Ex:*

```js
this.delegate('click', '.navigation-item', (dispatch, event) => {
  dispatch(actions.followNavigation());
});
```

The `callback` argument is called with two arguments: the Redux store's `dispatch` function and the native browser Event object:

`callback(dispatch: func, browserEvent: Event): any`

#### listen

`listen(propertyAccessor: string, callback: func): void`

Add a callback to be fired when properties on the Redux state change.

*Ex:*

```js
this.listen('search.visibility', (previous, next) => {
  this.element.classList.toggle('visible', next);
});
```

Callbacks for `listen()` are given the previous value and next value for the property as arguments.

`callback(previous: any, next: any): any`

#### undelegateAll

`undelegateAll(): void`

Remove the view's delegated event listeners.

## Dependencies

*drishti* has no external dependencies but does depend on these browser APIs:

- WeakMap
- Map
- Set
- Symbol

I recommend [polyfilling these APIs](https://github.com/zloirock/core-js) if you need to support older browsers.