import { handleAction } from 'redux-actions';
const DEFAULT_STATE = null;

export default handleAction('PROFILES_SET', (state, action) => action.payload, DEFAULT_STATE);
