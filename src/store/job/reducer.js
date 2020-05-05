import { handleActions } from 'redux-actions';
const DEFAULT_STATE = {};

export default handleActions(
    {
        JOB_SET: (state, { payload: job }) => job,
    },
    DEFAULT_STATE
);
