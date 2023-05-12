import { createSelector } from 'reselect';

const getAppState = state => state.appState;

export const isInitialized = createSelector(getAppState, ({ initialized }) => initialized);

export const isLocked = createSelector(getAppState, ({ locked }) => locked);

export const getPage = createSelector(getAppState, ({ page }) => page);

export const isFileUploadMode = createSelector(getAppState, ({ fileUploadMode }) => fileUploadMode);

export const getNumPages = createSelector(getAppState, ({ numPages }) => numPages);
