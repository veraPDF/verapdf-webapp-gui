import { createAction } from 'redux-actions';

const addPdfFile = createAction('PDF_FILE_ADD');

export const storeFile = file => async dispatch => {
    const fileObject = {
        id: null,
        name: file.name,
        contentMD5: null,
        file,
    };
    dispatch(addPdfFile(fileObject));
};
