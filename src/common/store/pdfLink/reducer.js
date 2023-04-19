import { handleActions } from 'redux-actions';
const DEFAULT_STATE = {
    link: '',
    error: false,
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
    },
    DEFAULT_STATE
);
