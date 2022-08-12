import { handleActions } from 'redux-actions';

const DEFAULT_STATE = {
    initialized: false,
    locked: false,
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
    },
    DEFAULT_STATE
);
