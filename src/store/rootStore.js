import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';
import { JOB_FILE } from './constants';
import { finishAppStartup } from './application/actions';
import { updateServerStatus } from './serverInfo/actions';
import { addPdfFile } from './pdfFiles/actions';
import { updateProfiles } from './validationProfiles/actions';
import { getFile } from '../services/pdfStorage';
import { getUnsavedFile } from './pdfFiles/selectors';
import { isLocked } from './application/selectors';

export default function configureStore() {
    const store = createStore(rootReducer, applyMiddleware(thunk));

    window.onbeforeunload = () => {
        // Show confirmation when we reload page while:
        // - selected PDF file is not saved for some reason (and thus cannot be restored)
        // - application is locked, e.g. when job creation was started but not yet complete (and thus cannot be restored)
        if (getUnsavedFile(store.getState()) || isLocked(store.getState())) {
            return '';
        }
    };

    const startupPromises = [];

    // Check server availability
    store.dispatch(updateServerStatus());

    // Restore PDF file if there is any saved in DB
    const restoreFilesPromise = restoreFiles(store);
    if (restoreFilesPromise) {
        startupPromises.push(restoreFilesPromise);
    }

    // Get validationProfiles list
    store.dispatch(updateProfiles());

    if (startupPromises.length > 0) {
        Promise.all(startupPromises).then(() => {
            store.dispatch(finishAppStartup());
        });
    } else {
        store.dispatch(finishAppStartup());
    }

    return store;
}

const restoreFiles = store => {
    const fileName = sessionStorage.getItem(JOB_FILE);
    if (!fileName) {
        return null;
    }

    return getFile(fileName).then(file => {
        if (file?.size) {
            store.dispatch(addPdfFile({ file, hasBackup: true }));
        } else {
            sessionStorage.removeItem(JOB_FILE);
        }
    });
};
