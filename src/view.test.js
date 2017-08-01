import { View } from './view';
import { createStore } from 'redux';
import simulant from 'simulant';

const identityReducer = (state, action) => Object.assign({}, state);

describe('View', () => {
  describe('constructor', () => {
    describe('given an element is not passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new View();
        }).toThrow('drishti:View - options.element must be an Element.');
      });
    });

    describe('given an element is present and a store is not passed', () => {
      it('should throw an error', () => {
        expect(() => {
          new View({ element: document.createElement('div') });
        }).toThrow('drishti:View - options.store must be defined');
      });
    });

    describe('given options are passed and the store is not valid', () => {
      it('should throw an error', () => {
        expect(() => {
          new View({ element: document.createElement('div'), store: {} });
        }).toThrow('drishti:View - options.store must be a Redux store');
      });
    });

    describe('given valid options', () => {
      it('should return a View', () => {
        const element = document.createElement('div');
        const store = createStore(identityReducer);
        const v = new View({ element, store });

        expect(v).toBeInstanceOf(View);
        expect(v.element).toEqual(element);
        expect(v.store).toEqual(store);
        expect(v.actions).toBeInstanceOf(Map);
        expect(v.listeners).toBeInstanceOf(Map);
      });
    });
  });

  describe('delegate', () => {
    describe('given there are no delegated events', () => {
      it('should add the delegated callback', () => {
        const element = document.createElement('div');
        const store = createStore(identityReducer);
        const v = new View({ element, store });

        const callback = jest.fn();
        v.delegate('click', '.test', callback);

        expect(v.actions.has('click')).toBe(true);
        expect(v.actions.get('click').get('.test')).toEqual(callback);
      });
    });

    describe('given there are delegated events', () => {
      describe('and there is a new selector', () => {
        it('should add the delegated callback', () => {
          const element = document.createElement('div');
          const store = createStore(identityReducer);
          const v = new View({ element, store });

          const callback = jest.fn();
          const callback2 = jest.fn();
          v.delegate('click', '.test', callback);
          v.delegate('click', '.test2', callback2);

          expect(v.actions.has('click')).toBe(true);
          expect(v.actions.get('click').get('.test')).toEqual(callback);
          expect(v.actions.get('click').get('.test2')).toEqual(callback2);
        });
      });

      describe('and the selector is already set', () => {
        it('should not override the delegated callback', () => {
          const element = document.createElement('div');
          const store = createStore(identityReducer);
          const v = new View({ element, store });

          const callback = jest.fn();
          const callback2 = jest.fn();
          v.delegate('click', '.test', callback);
          v.delegate('click', '.test', callback2);

          expect(v.actions.has('click')).toBe(true);
          expect(v.actions.get('click').get('.test')).toEqual(callback);
        });
      });
    });

    describe('given I click on a matching element', () => {
      it('should fire the callback', () => {
        const element = document.createElement('div');
        element.innerHTML = `
          <p><span class="test">Test</span></p>
        `;

        const store = createStore(identityReducer);
        const callback = jest.fn();
        const v = new View({ element, store });
        v.delegate('click', 'span.test', callback);

        simulant.fire(element.querySelector('span.test'), 'click');
        expect(callback).toHaveBeenCalledWith(store.dispatch, expect.any(MouseEvent));
      });
    });

    describe('given I click on a non-matching element', () => {
      it('should fire the callback', () => {
        const element = document.createElement('div');
        element.innerHTML = `
          <p><span class="test">Test</span><span class="non-matching">Non Matching</span></p>
        `;

        const store = createStore(identityReducer);
        const callback = jest.fn();
        const v = new View({ element, store });
        v.delegate('click', 'span.test', callback);

        simulant.fire(element.querySelector('span.non-matching'), 'click');
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('undelegateAll', () => {
    it('should remove all event listeners', () => {
      const element = document.createElement('div');
      element.innerHTML = `
          <p><span class="test">Test</span><span class="non-matching">Non Matching</span></p>
        `;

      const store = createStore(identityReducer);
      const callback = jest.fn();
      const v = new View({ element, store });
      v.delegate('click', 'span.test', callback);
      v.undelegateAll();

      simulant.fire(element.querySelector('span.test'), 'click');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('listen', () => {
    it('should add a listener', () => {
      const element = document.createElement('div');
      const store = createStore(identityReducer);
      const v = new View({ element, store });

      const callback = jest.fn();
      v.listen('testProp', callback);

      expect(v.listeners.has('testProp')).toBe(true);
      expect(v.listeners.get('testProp')[0]).toEqual(callback);
    });
  });

  describe('given a state change matches a listened property accessor', () => {
    it('should fire the callback', () => {
      const element = document.createElement('div');
      const store = createStore((state, action) => {
        const newState = Object.assign({}, state);
        newState.testProp = action.value;
        return newState;
      });

      const v = new View({ element, store });

      const callback = jest.fn();
      v.listen('testProp', callback);

      store.dispatch({ type: 'test-update', value: 123 });
      store.dispatch({ type: 'test-update', value: 456 });

      expect(callback).toHaveBeenLastCalledWith(123, 456);
    });
  });

  describe('given a state change does not match the listened property accessor', () => {
    it('should not fire the callback', () => {
      const element = document.createElement('div');
      const store = createStore((state, action) => {
        const newState = Object.assign({}, state);
        newState.testProp = action.value;
        return newState;
      });

      const v = new View({ element, store });

      const callback = jest.fn();
      v.listen('testProp2', callback);

      store.dispatch({ type: 'test-update', value: 123 });
      store.dispatch({ type: 'test-update', value: 456 });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
