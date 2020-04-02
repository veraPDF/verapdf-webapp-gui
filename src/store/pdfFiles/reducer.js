import { handleActions } from 'redux-actions';
const DEFAULT_STATE = [];

export default handleActions(
    {
        PDF_FILE_ADD: (state, { payload: fileObject }) => [fileObject],
    },
    DEFAULT_STATE
);
