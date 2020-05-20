import { handleActions } from 'redux-actions';

const DEFAULT_STATE = {
    initialized: false,
    locked: false,
};

export default handleActions(
    {
        APP_STARTUP_FINISH: state => ({ ...state, initialized: true }),
        APP_LOCK_SET: (state, { payload: locked }) => ({ ...state, locked }),
    },
    DEFAULT_STATE
);
