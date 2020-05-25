import { createSelector } from 'reselect';

export const getResult = state => state.taskResult;

export const hasResult = createSelector(getResult, result => result != null);

export const getResultDetails = createSelector(getResult, result => result?.details);

export const getResultSummary = createSelector(getResultDetails, ({ passedChecks, failedChecks }) => ({
    passedChecks,
    failedChecks,
}));

export const getRuleSummaries = createSelector(getResultDetails, ({ ruleSummaries }) => [...ruleSummaries]);
