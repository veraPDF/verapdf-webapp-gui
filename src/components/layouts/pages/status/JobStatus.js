import React from 'react';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Progress from '../../../shared/progress/Progress';
import Stepper from '../../../shared/stepper/Stepper';
import AppPages from '../../../AppPages';
import { JOB_STATUS } from '../../../../store/constants';
import { getJobError, getJobStatus } from '../../../../store/job/selectors';
import { getProgress } from '../../../../store/job/progress/selectors';
import './JobStatus.scss';

export const STEPS = {
    JOB_CREATE: {
        active: 'Initializing new validation job...',
        complete: 'Validation job initiated.',
        error: 'Job creation failed',
    },
    FILE_UPLOAD: {
        active: 'Uploading PDF...',
        complete: 'PDF uploaded.',
        error: 'Failed to upload PDF file',
    },
    JOB_UPDATE: {
        active: 'Validation job updating...',
        complete: 'Validation job updated.',
        error: 'Job update failed',
    },
    JOB_EXECUTE: {
        active: 'Starting job execution...',
        complete: 'Job execution started.',
        error: 'Job execution failed',
    },
    JOB_COMPLETE: {
        active: 'Validating...',
        complete: 'Validation complete.',
    },
};

function JobStatus({ jobStatus, percentage, steps, errorMessage }) {
    const { id: jobId } = useParams();

    switch (jobStatus) {
        case JOB_STATUS.FINISHED:
            return <Redirect to={AppPages.RESULTS.url(jobId)} />;

        case JOB_STATUS.NOT_FOUND:
            return <Redirect to={AppPages.NOT_FOUND} />;

        case JOB_STATUS.ERROR:
            return (
                <StatusPage>
                    <h3 className="error" title={getErrorTitle(steps, errorMessage)}>
                        Failed to start validation.
                    </h3>
                    {/* TODO: add button to retry validation */}
                </StatusPage>
            );

        default:
            return (
                <StatusPage>
                    <Progress percents={percentage} title={getProgressTitle(steps)} />
                </StatusPage>
            );
    }
}

function StatusPage({ children }) {
    return (
        <section className="job-status">
            <Stepper activeStep={AppPages.STATUS.route} />
            <section className="job-status__progress">{children}</section>
        </section>
    );
}

function getProgressTitle(steps) {
    return steps
        .map(({ stepKey, completed }) => {
            if (completed) {
                return '✓ ' + STEPS[stepKey].complete;
            } else {
                return '● ' + STEPS[stepKey].active;
            }
        })
        .join('\n');
}

function getErrorTitle(steps, errorMessage) {
    let failedStep = _.find(steps, ['completed', false]);
    if (!failedStep) {
        return errorMessage;
    }
    return `${STEPS[failedStep.stepKey].error}: ${errorMessage}`;
}

const StepShape = PropTypes.shape({
    stepKey: PropTypes.oneOf(_.keys(STEPS)).isRequired,
    completed: PropTypes.bool.isRequired,
});

JobStatus.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)),
    percentage: PropTypes.number.isRequired,
    steps: PropTypes.arrayOf(StepShape).isRequired,
    errorMessage: PropTypes.string,
};

function mapStateToProps(state) {
    let { percentage, steps } = getProgress(state);
    let jobStatus = getJobStatus(state);
    let errorMessage = getJobError(state);
    return { jobStatus, percentage, steps, errorMessage };
}

export default connect(mapStateToProps)(JobStatus);
