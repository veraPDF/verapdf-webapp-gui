import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';
import { updateServerStatus } from './serverInfo/actions';
import { storeFile } from './pdfFiles/actions';
import { updateProfiles } from './validationProfiles/actions';
import { getFile } from '../services/pdfStorage';
import { getUnsavedFile } from './pdfFiles/selectors';
import { JOB_FILE } from './constants';

export default function configureStore() {
    const store = createStore(rootReducer, applyMiddleware(thunk));

    const startupPromises = [];

    // get already stored files
    const fileName = sessionStorage.getItem(JOB_FILE);
    if (fileName) {
        getFile(fileName).then(file => {
            if (file?.size) {
                store.dispatch(storeFile(file, true));
            } else {
                sessionStorage.removeItem(JOB_FILE);
            }
        });
    }

    // Check file storage availability
    store.dispatch(updateServerStatus());
    // Get validationProfiles list
    store.dispatch(updateProfiles());

    function unsavedFilesConfirmation() {
        if (getUnsavedFile(store.getState())) {
            return '';
        }
    }

    if (startupPromises.length > 0) {
        Promise.all(startupPromises).then(() => {
            // TODO: show loading page until app startup is finished.
            //  Check if we need to redirect from Settings to Upload page only after app is fully loaded
            // store.dispatch(finishAppStartup());
        });
    }

    window.onbeforeunload = unsavedFilesConfirmation;

    return store;
}
