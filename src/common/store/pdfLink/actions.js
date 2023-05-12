import { createAction } from 'redux-actions';
import { uploadLink } from '../../services/fileService';

export const setLink = createAction('PDF_LINK_ADD');

export const setError = createAction('PDF_LINK_ERROR');

export const uploadLinkAction = () => {
    return async (_dispatch, getState) => {
        const { link, error } = getState().pdfLink;
        if (!error && link?.length) {
            await uploadLink(link);
        }
    };
};
