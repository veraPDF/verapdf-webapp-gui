import { handleActions } from 'redux-actions';

const DEFAULT_STATE = {
    initialized: false,
    locked: false,
    fileUploadMode: true,
    page: 1,
    numPages: 0,
};

export default handleActions(
    {
        APP_RESET: () => DEFAULT_STATE,
        APP_STARTUP_FINISH: state => ({ ...state, initialized: true }),
        APP_LOCK_SET: (state, { payload: locked }) => ({ ...state, locked }),
        APP_PAGE_SET: (state, { payload: page }) => ({ ...state, page }),
        APP_NUM_PAGES_SET: (state, { payload: numPages }) => ({ ...state, numPages }),
        APP_FILE_UPLOAD_MODE: (state, { payload: fileUploadMode }) => ({ ...state, fileUploadMode }),
    },
    DEFAULT_STATE
);
