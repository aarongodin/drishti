# drishti

*Drishti* is a focused, intentful view wrapper around [Redux](https://github.com/reactjs/redux) meant for lean front-end applications.

### Features

- Delegate browser events
- Connect arbitrary classes to Redux state values, similar to [react-redux](https://github.com/reactjs/react-redux/)'s `connect()`

### Usage

The `View` class can be instantiated directly or extended.

*Usage as an instance*

```js
import { View } from 'drishti';

// call redux.createStore()

const headerElement = document.querySelector('#header');
const headerView = new View({ store, element: headerElement });

const handleNavigation = (dispatch, browserEvent) => {
  // dispatch an action
};

const setSearchDrawarVisibility = (oldValue, newValue) => {
  headerElement.querySelector('.search-drawar').classList.toggle('visible', newValue);
};

headerView.delegate('click', 'nav a.search-link', handleNavigation);
headerView.listen('searchDrawar.visible', setSearchDrawarVisibility);
```

*...and the same code written as a class.*

```js
import { View } from 'drishti';

// call redux.createStore()

class HeaderView extends View {
  constructor (options) {
    super(options);

    this.delegate('click', 'nav a.search-link', this.handleNavigation);
    this.listen('searchDrawar.visible', setSearchDrawarVisibility);
  }

  handleNavigation (dispatch, browserEvent) {
    // dispatch an action
  }

  setSearchDrawarVisibility (oldValue, newValue) {
    headerElement.querySelector('.search-drawar').classList.toggle('visible', newValue);
  }
}
```

### Detailed docs incoming