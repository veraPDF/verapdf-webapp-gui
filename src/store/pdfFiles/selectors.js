import { createSelector } from 'reselect';

const getFiles = state => state.pdfFiles;

export const getPdfFiles = createSelector(getFiles, pdfFiles => pdfFiles.map(({ file }) => file));
