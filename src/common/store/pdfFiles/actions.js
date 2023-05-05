import { createAction } from 'redux-actions';
import { JOB_FILE, JOB_MODE, JOB_LINK } from '../constants';
import { setFile } from '../../services/pdfStorage';

export const addPdfFile = createAction('PDF_FILE_ADD', ({ file, hasBackup = false }) => ({
    name: file.name,
    size: file.size,
    file,
    hasBackup,
}));

export const updatePdfFile = createAction('PDF_FILE_UPDATE', ({ id, fileName, contentSize }) => ({
    name: fileName,
    size: contentSize,
    id,
}));

export const storeFile = file => async dispatch => {
    const hasBackup = await setFile(file);
    if (hasBackup) {
        sessionStorage.setItem(JOB_FILE, file.name);
    }
    dispatch(addPdfFile({ file, hasBackup }));
};

export const storeFileWithLink = file => async dispatch => {
    const hasBackup = await setFile(file);
    if (hasBackup) {
        sessionStorage.setItem(JOB_FILE, file.name);
    }
};

export const storeLink = link => {
    sessionStorage.setItem(JOB_LINK, link);
};

export const storeMode = mode => {
    sessionStorage.setItem(JOB_MODE, mode);
};
