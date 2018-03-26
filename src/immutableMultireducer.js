import Immutable from 'immutable';
import { key, KEY_ALL } from './key';
import initAction from './initAction';

export default function immutableMultireducer(reducers, reducerKey) {
  let isCustomMountPoint;
  if (typeof reducers === 'function') {
    if (!reducerKey) {
      throw new Error('No key specified for custom mounting of reducer');
    } else {
      isCustomMountPoint = true;
    }
  }

  const initialState = isCustomMountPoint ?
    reducers(undefined, initAction) :
    new Immutable.Map(reducers).map(reducer => reducer(undefined, initAction));

  return (state = initialState, action) => {
    if (action && action.meta && action.meta[key]) {
      const actionReducerKey = action.meta[key];

      // custom mount point
      if (isCustomMountPoint && (reducerKey === actionReducerKey || KEY_ALL === actionReducerKey)) {
        if (KEY_ALL === actionReducerKey) {
          return reducers(state, {
            ...action,
            meta: {
              ...action.meta,
              [key]: reducerKey,
              [KEY_ALL]: true,
            }
          });
        }
        return reducers(state, action);
      }


      // usual multireducer mounting
      const reducer = reducers[actionReducerKey];

      if (reducer) {
        return state.set(actionReducerKey, reducer(state.get(actionReducerKey), action));
      }
    }

    return state;
  };
}
