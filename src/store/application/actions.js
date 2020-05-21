import { createAction } from 'redux-actions';
import { getFile } from '../pdfFiles/selectors';
import { deleteFile } from '../../services/pdfStorage';
import { getDefaultProfileName } from '../validationProfiles/selectors';
import AppPages from '../../components/AppPages';

export const finishAppStartup = createAction('APP_STARTUP_FINISH');

export const lockApp = createAction('APP_LOCK_SET', () => true);

export const unlockApp = createAction('APP_LOCK_SET', () => false);

export const resetApp = createAction('APP_RESET');

export const reset = history => async (dispatch, getState) => {
    const file = getFile(getState());
    const profile = getDefaultProfileName(getState());

    // Reset redux state, this will clean it and show Loading view
    dispatch(resetApp({ profile }));

    // Delete file from IndexDB if there is any
    if (file) {
        await deleteFile(file);
    }

    // Reset session storage
    sessionStorage.clear();

    // Redirect to start screen and hide Loading view
    history.push(AppPages.UPLOAD);
    dispatch(finishAppStartup());
};
