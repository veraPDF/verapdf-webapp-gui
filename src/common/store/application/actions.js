import { createAction } from 'redux-actions';

import { getFile } from '../pdfFiles/selectors';
import { deleteFile } from '../../services/pdfStorage';
import { getDefaultProfileName } from '../validationProfiles/selectors';
import { storeFile } from '../pdfFiles/actions';
import { JOB_NEW_FILE, JOB_OLD_FILE, JOB_SETTINGS } from '../constants';

const { PUBLIC_URL, REACT_APP_BASE_NAME } = process.env;

export const finishAppStartup = createAction('APP_STARTUP_FINISH');

export const lockApp = createAction('APP_LOCK_SET', () => true);

export const unlockApp = createAction('APP_LOCK_SET', () => false);

export const resetApp = createAction('APP_RESET');

export const reset = () => async (dispatch, getState) => {
    const file = getFile(getState());
    const fileName = sessionStorage.getItem(JOB_NEW_FILE);
    const jobSettings = sessionStorage.getItem(JOB_SETTINGS);
    const profile = getDefaultProfileName(getState());

    // Reset redux state, this will clean it and show Loading view
    dispatch(resetApp({ profile }));

    // Delete file from IndexDB if there is any
    if (file) {
        await deleteFile(file);
    }

    // Reset session storage
    sessionStorage.clear();

    // Save old file and job settings
    sessionStorage.setItem(JOB_OLD_FILE, fileName);
    if (jobSettings) {
        sessionStorage.setItem(JOB_SETTINGS, jobSettings);
    }

    // Redirect to start screen and hide Loading view
    window.location.replace(PUBLIC_URL);
};

export const resetOnFileUpload = file => async (dispatch, getState) => {
    const profile = getDefaultProfileName(getState());
    const oldFile = getFile(getState());

    // Reset redux state, this will clean it and show Loading view
    await dispatch(resetApp({ profile }));

    // Delete file from IndexDB if there is any
    if (oldFile) {
        await deleteFile(oldFile);
    }

    await dispatch(storeFile(file));

    window.history.replaceState(null, '', REACT_APP_BASE_NAME);
    window.location.replace(PUBLIC_URL);
};

export const setPage = createAction('APP_PAGE_SET', page => page);

export const setFileUploadMode = createAction('APP_FILE_UPLOAD_MODE', fileUploadMode => fileUploadMode);

export const setNumPages = createAction('APP_NUM_PAGES_SET', numPages => numPages);
