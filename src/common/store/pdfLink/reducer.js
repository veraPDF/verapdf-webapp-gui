import { handleActions } from 'redux-actions';
const DEFAULT_STATE = {
    link: '',
    error: false,
    fileId: '',
    name: '',
};

export default handleActions(
    {
        APP_RESET: () => DEFAULT_STATE,
        PDF_LINK_ADD: (state, { payload: link }) => {
            return { ...state, link };
        },
        PDF_LINK_ERROR: (state, { payload: error }) => {
            return { ...state, error };
        },
        PDF_LINK_ID: (state, { payload: fileId }) => {
            return { ...state, fileId };
        },
        PDF_LINK_NAME: (state, { payload: name }) => {
            return { ...state, name };
        },
    },
    DEFAULT_STATE
);
