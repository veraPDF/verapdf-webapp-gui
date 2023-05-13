import { createSelector } from 'reselect';

export const getResult = state => state.taskResult;

export const hasResult = createSelector(getResult, result => result != null);

export const getResultDetails = createSelector(getResult, result => result?.details);

export const getResultSummary = createSelector(getResultDetails, checks => ({
    passedChecks: checks?.passedChecks || 0,
    failedChecks: checks?.failedChecks || 0,
}));

export const isCompliant = createSelector(getResult, result => result?.compliant || false);

export const getRuleSummaries = createSelector(getResultDetails, ({ ruleSummaries }) => [...ruleSummaries]);

export const getJobEndStatus = createSelector(getResult, result => result?.jobEndStatus);
