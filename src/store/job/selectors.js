import { createSelector } from 'reselect';

const getJobs = state => state.jobs;

export const getJobId = createSelector(getJobs, jobs => jobs.id || '');
