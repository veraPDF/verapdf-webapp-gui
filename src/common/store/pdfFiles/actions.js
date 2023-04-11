import { createAction } from 'redux-actions';
import { JOB_FILE } from '../constants';
import { setFile } from '../../services/pdfStorage';

export const addPdfFile = createAction('PDF_FILE_ADD', ({ file, hasBackup = false }) => ({
    name: file.name,
    size: file.size,
    file,
    hasBackup,
}));

export const updatePdfFile = createAction('PDF_FILE_UPDATE', ({ id }) => ({ id }));

export const storeFile = file => async dispatch => {
    console.log(file);
    const hasBackup = await setFile(file);
    if (hasBackup) {
        sessionStorage.setItem(JOB_FILE, file.name);
    }
    dispatch(addPdfFile({ file, hasBackup }));
};
