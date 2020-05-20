import { createSelector } from 'reselect';

export const getJob = state => state.job;

export const getJobId = createSelector(getJob, job => job?.id);

export const getJobStatus = createSelector(getJob, job => job?.status);

export const getJobError = createSelector(getJob, job => job?.errorMessage);

export const getTask = createSelector(getJob, job => job?.tasks[0]);

export const getTaskStatus = createSelector(getTask, task => task?.status);
