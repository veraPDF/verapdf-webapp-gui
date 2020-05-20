import { createSelector } from 'reselect';

const getAppState = state => state.appState;

export const isInitialized = createSelector(getAppState, ({ initialized }) => initialized);

export const isLocked = createSelector(getAppState, ({ locked }) => locked);
