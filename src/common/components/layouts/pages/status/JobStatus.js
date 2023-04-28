import React from 'react';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS } from '../../../../store/constants';
import { getJobError, getJobProgress, getJobQueuePosition, getJobStatus } from '../../../../store/job/selectors';
import { getProgress, isCancellingJob } from '../../../../store/job/progress/selectors';
import { hasResult } from '../../../../store/job/result/selectors';
import Progress from '../../../shared/progress/Progress';
import WizardStep from '../../wizardStep/WizardStep';
import Button from '../../../shared/button/Button';
import { cancelValidation } from '../../../../store/job/actions';

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
    JOB_WAITING: {
        active: position => `Waiting... Position in queue: ${position + 1}`,
        complete: 'Job validation started.',
        errorDetails: errorMessage => `Failed to start job validation: ${errorMessage}`,
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

function JobStatus({
    jobStatus,
    jobProgress,
    jobQueuePosition,
    percentage,
    steps,
    errorMessage,
    complete,
    onCancel,
    cancellingJob,
}) {
    const { id: jobId } = useParams();

    switch (jobStatus) {
        case undefined:
            return <Redirect to={AppPages.LOADING} />;

        case JOB_STATUS.NOT_FOUND:
            return <Redirect to={AppPages.NOT_FOUND} />;

        case JOB_STATUS.ERROR:
            const { message, title } = getErrorInfo(steps, errorMessage);
            return (
                <StatusPage>
                    <section className="error">
                        <h3 className="error__message">{message}</h3>
                        <p className="error__details">{title}</p>
                    </section>
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
                    <Progress
                        percents={percentage}
                        title={getProgressTitle(steps, jobQueuePosition, cancellingJob)}
                        summary={getProgressSummary(steps, jobQueuePosition, cancellingJob)}
                        progress={!cancellingJob ? jobProgress : null}
                    />
                    <div className="processing-controls">
                        {(jobStatus === JOB_STATUS.WAITING ||
                            (jobStatus === JOB_STATUS.PROCESSING && !cancellingJob)) && (
                            <Button onClick={onCancel}>Cancel validation</Button>
                        )}
                    </div>
                </StatusPage>
            );
    }
}

function StatusPage({ children }) {
    return (
        <WizardStep stepIndex={AppPages.STATUS.route} className="job-status">
            {children}
        </WizardStep>
    );
}

function getProgressSummary(steps, jobQueuePosition, cancellingJob) {
    if (cancellingJob) {
        return 'Cancelling...';
    }
    const lastStep = STEPS[steps[steps.length - 1].stepKey];
    return typeof lastStep.active === 'function' ? lastStep.active(jobQueuePosition) : lastStep.active;
}

function getProgressTitle(steps, jobQueuePosition, cancellingJob) {
    let title = _.chain(steps)
        .map(({ stepKey, completed }) => {
            if (completed) {
                return STEPS[stepKey].complete ? '✓ ' + STEPS[stepKey].complete : null;
            } else {
                return (
                    '● ' +
                    (typeof STEPS[stepKey].active === 'function'
                        ? STEPS[stepKey].active(jobQueuePosition)
                        : STEPS[stepKey].active)
                );
            }
        })
        .filter(label => label)
        .value()
        .join('\n');
    if (cancellingJob) {
        title += '\n● Cancelling...';
    }
    return title;
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
    jobProgress: PropTypes.string,
    jobQueuePosition: PropTypes.number,
    percentage: PropTypes.number.isRequired,
    steps: PropTypes.arrayOf(StepShape).isRequired,
    errorMessage: PropTypes.string,
    complete: PropTypes.bool,
    isCancellingJob: PropTypes.bool,
    onCancel: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const { percentage, steps } = getProgress(state);
    const jobStatus = getJobStatus(state);
    const jobProgress = getJobProgress(state);
    const jobQueuePosition = getJobQueuePosition(state);
    const errorMessage = getJobError(state);
    const complete = hasResult(state);
    const cancellingJob = isCancellingJob(state);
    return { jobStatus, jobProgress, jobQueuePosition, percentage, steps, errorMessage, complete, cancellingJob };
}

const mapDispatchToProps = dispatch => {
    return {
        onCancel: () => dispatch(cancelValidation()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(JobStatus);
