import { createSelector } from 'reselect';

export const getLinks = state => state.pdfLink;

export const getFileLink = createSelector(getLinks, pdfLink => pdfLink?.link);

export const getFileNameLink = createSelector(getLinks, pdfLink => pdfLink?.link.split('/').slice(-1)[0]);

export const getFileError = createSelector(getLinks, pdfLink => pdfLink?.error);
