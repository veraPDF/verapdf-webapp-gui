import { createSelector } from 'reselect';

export const getLinks = state => state.pdfLink;

export const getFileLink = createSelector(getLinks, pdfLink => pdfLink?.link);

export const getFileError = createSelector(getLinks, pdfLink => pdfLink?.error);
