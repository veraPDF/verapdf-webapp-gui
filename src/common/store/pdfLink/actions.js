import { createAction } from 'redux-actions';
import { uploadLink } from '../../services/fileService';

export const setLink = createAction('PDF_LINK_ADD');

export const setError = createAction('PDF_LINK_ERROR');

//export const updatePdfLink = createAction('PDF_LINK_UPDATE', ({ id }) => ({ id }));

export const updatePdfLink = createAction('PDF_LINK_UPDATE', ({ id }) => ({ id }));

export const uploadLinkAction = () => {
    return async (dispatch, getState) => {
        const { link, error } = getState().pdfLink;
        if (!error && link?.length) {
            const json = await uploadLink(link);
            dispatch(updatePdfLink(link));
            console.log('from pdflink', json);
        }
    };
};
