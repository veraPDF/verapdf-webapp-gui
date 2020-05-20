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
import { hasResult } from '../../../../store/job/result/selectors';
import './JobStatus.scss';

const DEFAULT_ERROR = 'Failed to start validation.';

export const STEPS = {
    JOB_CREATE: {
        active: 'Initializing new validation job...',
        complete: 'Validation job initiated.',
        errorDetails: errorMessage => `Failed to create job: ${errorMessage}`,
    },
    FILE_UPLOAD: {
        active: 'Uploading PDF...',
        complete: 'PDF uploaded.',
        errorDetails: errorMessage => `Failed to upload PDF file: ${errorMessage}`,
    },
    JOB_UPDATE: {
        active: 'Validation job updating...',
        complete: 'Validation job updated.',
        errorDetails: errorMessage => `Failed to update job: ${errorMessage}`,
    },
    JOB_EXECUTE: {
        active: 'Starting job execution...',
        complete: 'Job execution started.',
        errorDetails: errorMessage => `Failed to start job execution: ${errorMessage}`,
    },
    JOB_COMPLETE: {
        active: 'Validating...',
        complete: 'Validation complete.',
        error: 'Validation process finished with error',
        errorDetails: _.identity,
    },
    VALIDATION_RESULT_DOWNLOAD: {
        active: 'Downloading result...',
        complete: 'Redirecting to result summary',
        error: 'Failed to download validation result',
        errorDetails: _.identity,
    },
};

function JobStatus({ jobStatus, percentage, steps, errorMessage, complete }) {
    const { id: jobId } = useParams();

    switch (jobStatus) {
        case JOB_STATUS.NOT_FOUND:
            return <Redirect to={AppPages.NOT_FOUND} />;

        case JOB_STATUS.ERROR:
            const { message, title } = getErrorInfo(steps, errorMessage);
            return (
                <StatusPage>
                    <h3 className="error" title={title}>
                        {message}
                    </h3>
                    {/* TODO: add button to retry validation */}
                </StatusPage>
            );

        case JOB_STATUS.FINISHED:
            if (complete) {
                return <Redirect to={AppPages.RESULTS.url(jobId)} />;
            }

        // eslint-disable-next-line no-fallthrough
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

function getErrorInfo(steps, errorMessage) {
    const failedStep = _.find(steps, ['completed', false]);
    if (!failedStep) {
        return { message: errorMessage };
    }
    return {
        message: STEPS[failedStep.stepKey].error || DEFAULT_ERROR,
        title: STEPS[failedStep.stepKey].errorDetails(errorMessage),
    };
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
    complete: PropTypes.bool,
};

function mapStateToProps(state) {
    const { percentage, steps } = getProgress(state);
    const jobStatus = getJobStatus(state);
    const errorMessage = getJobError(state);
    const complete = hasResult(state);
    return { jobStatus, percentage, steps, errorMessage, complete };
}

export default connect(mapStateToProps)(JobStatus);
