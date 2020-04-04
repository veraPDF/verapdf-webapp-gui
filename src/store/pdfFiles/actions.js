import { createAction } from 'redux-actions';
import { setFile } from '../../services/pdfStorage';

const addPdfFile = createAction('PDF_FILE_ADD', ({ file, hasBackup }) => ({
    name: file.name,
    size: file.size,
    file,
    hasBackup,
}));

export const storeFile = (file, hasBackup = false) => async dispatch => {
    if (!hasBackup) {
        hasBackup = await setFile(file);
    }

    dispatch(addPdfFile({ file, hasBackup }));
};
