import { handleAction } from 'redux-actions';
const { REACT_APP_VERSION } = process.env;
const DEFAULT_STATE = {
    version: REACT_APP_VERSION,
    fileService: {
        available: undefined,
        build: undefined,
    },
    jobService: {
        available: undefined,
        build: undefined,
    },
};

export default handleAction('SERVER_INFO_SET', (state, action) => ({ ...state, ...action.payload }), DEFAULT_STATE);
