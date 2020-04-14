import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';
import { updateServerStatus } from './serverInfo/actions';
import { storeFile } from './pdfFiles/actions';
import { getAllFiles } from '../services/pdfStorage';
import { getUnsavedFile } from './pdfFiles/selectors';

export default function configureStore() {
    const store = createStore(rootReducer, applyMiddleware(thunk));

    // get already stored files
    getAllFiles().then(files => {
        if (files[0] && files[0].size) {
            store.dispatch(storeFile(files[0], true));
        }
    });
    // Check file storage availability
    store.dispatch(updateServerStatus());

    function unsavedFilesConfirmation() {
        if (getUnsavedFile(store.getState())) {
            return '';
        }
    }

    window.onbeforeunload = unsavedFilesConfirmation;

    return store;
}
