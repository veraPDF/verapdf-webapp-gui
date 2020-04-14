import { createSelector } from 'reselect';

const getFiles = state => state.pdfFiles;

export const getPdfFiles = createSelector(getFiles, pdfFiles => pdfFiles.map(({ file }) => file));

export const getUnsavedFile = createSelector(getFiles, pdfFiles => pdfFiles.find(({ hasBackup }) => !hasBackup));

export const hasFilesAttached = createSelector(getFiles, pdfFiles => pdfFiles.length > 0);
