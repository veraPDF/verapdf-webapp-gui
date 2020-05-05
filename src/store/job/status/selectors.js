import { createSelector } from 'reselect';
import _ from 'lodash';
import { JOB_STATUS } from '../../constants';

const getJobStatus = state => state.jobStatus;

export const jobCreated = createSelector(
    getJobStatus,
    ({ steps }) => _.findIndex(steps, { stepKey: 'JOB_CREATE', completed: true }) > -1
);

export const jobFinished = createSelector(getJobStatus, ({ status }) => status === JOB_STATUS.FINISHED);
