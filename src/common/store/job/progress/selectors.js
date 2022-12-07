import { createSelector } from 'reselect';

export const getProgress = state => state.jobProgress;
export const isCancellingJob = createSelector(getProgress, progress => progress.cancelling);
