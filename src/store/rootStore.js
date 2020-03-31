import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';
import { updateServerStatus } from './serverInfo/actions';

export default function configureStore() {
    const store = createStore(rootReducer, applyMiddleware(thunk));

    // Check file storage availability
    store.dispatch(updateServerStatus());

    return store;
}
