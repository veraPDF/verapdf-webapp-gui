import { createSelector } from 'reselect';

const getFiles = state => state.pdfFiles;

export const getFileDescriptor = createSelector(getFiles, pdfFiles => pdfFiles[0]);

export const getFileId = createSelector(getFileDescriptor, fileDescriptor => fileDescriptor?.id);

export const getFileName = createSelector(getFileDescriptor, fileDescriptor => fileDescriptor?.name);

export const getFile = createSelector(getFileDescriptor, fileDescriptor => fileDescriptor?.file);

export const getPdfFiles = createSelector(getFiles, pdfFiles => pdfFiles.map(({ file }) => file));

export const getUnsavedFile = createSelector(getFiles, pdfFiles => pdfFiles.find(({ hasBackup }) => !hasBackup));

export const hasFilesAttached = createSelector(getFiles, pdfFiles => pdfFiles.length > 0);
