import { handleActions } from 'redux-actions';
const DEFAULT_STATE = [];

export default handleActions(
    {
        APP_RESET: () => DEFAULT_STATE,
        PDF_FILE_ADD: (state, { payload: fileObject }) => [fileObject],
        PDF_FILE_UPDATE: (state, { payload: updates }) => [{ ...state[0], ...updates }],
    },
    DEFAULT_STATE
);
