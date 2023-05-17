import { createSelector } from 'reselect';

export const getResult = state => state.taskResult;

export const hasResult = createSelector(getResult, result => result != null);

export const getResultDetails = createSelector(getResult, result => result?.details);

export const getResultSummary = createSelector(getResultDetails, checks => ({
    passedChecks: checks?.passedChecks || null,
    failedChecks: checks?.failedChecks || null,
}));

export const isCompliant = createSelector(getResult, result => result?.compliant || false);

export const getRuleSummaries = createSelector(getResultDetails, ({ ruleSummaries }) => [...ruleSummaries]);

export const getJobEndStatus = createSelector(getResult, result => result?.jobEndStatus);
