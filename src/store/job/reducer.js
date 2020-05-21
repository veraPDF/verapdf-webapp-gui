import { handleActions } from 'redux-actions';
const DEFAULT_STATE = {};

export default handleActions(
    {
        APP_RESET: () => DEFAULT_STATE,
        JOB_SET: (state, { payload: job }) => job,
    },
    DEFAULT_STATE
);
