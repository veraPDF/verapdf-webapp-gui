import { handleAction } from 'redux-actions';
const { REACT_APP_VERSION } = process.env;
const DEFAULT_STATE = {
    version: REACT_APP_VERSION,
};

export default handleAction('UPDATE_SERVER_INFO', (state, action) => action.payload, DEFAULT_STATE);
