import { createSelector } from 'reselect';

export const getJob = state => state.job;

export const getJobId = createSelector(getJob, job => job?.id);

export const getJobStatus = createSelector(getJob, job => job?.status);

export const getJobError = createSelector(getJob, job => job?.errorMessage);

export const getJobProfile = createSelector(getJob, job => job?.profile);

export const getJobQueuePosition = createSelector(getJob, job => job?.queuePosition);

export const getJobProgress = createSelector(getJob, job => job?.progress);

export const getTask = createSelector(getJob, job => job?.tasks?.[0]);

export const getTaskStatus = createSelector(getTask, task => task?.status);

export const getTaskResultId = createSelector(getTask, task => task?.validationResultId);

export const getTaskFileId = createSelector(getTask, task => task?.fileId);

export const getTaskErrorMessage = createSelector(
    getTask,
    task => task?.errorMessage || task?.errorType || `Task status: ${task?.status || 'unknown'}`
);
