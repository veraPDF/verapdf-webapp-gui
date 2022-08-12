import { handleActions } from 'redux-actions';
const DEFAULT_STATE = null;

export default handleActions(
    {
        APP_RESET: () => DEFAULT_STATE,
        RESULT_SET: (state, { payload: result }) => result,
    },
    DEFAULT_STATE
);
