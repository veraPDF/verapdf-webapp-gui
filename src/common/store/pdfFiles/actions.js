import { createAction } from 'redux-actions';
import { JOB_NEW_FILE, JOB_MODE, JOB_LINK } from '../constants';
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
    const hasBackup = await saveFileToStorage(file);
    dispatch(addPdfFile({ file, hasBackup }));
};

export const saveFileToStorage = async file => {
    const hasBackup = await setFile(file);
    if (hasBackup) {
        sessionStorage.setItem(JOB_NEW_FILE, file.name);
    }
    return hasBackup;
};

export const storeLink = link => {
    sessionStorage.setItem(JOB_LINK, link);
};

export const storeMode = isUploadMode => {
    sessionStorage.setItem(JOB_MODE, isUploadMode);
};
