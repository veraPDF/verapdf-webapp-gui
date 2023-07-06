import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import { getJobEndStatus, isCompliant } from '../../../../store/job/result/selectors';
import { reset, resetOnFileUpload } from '../../../../store/application/actions';
import WizardStep from '../../wizardStep/WizardStep';
import Summary from './summary/Summary';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import DropzoneWrapper from '../upload/dropzoneWrapper/DropzoneWrapper';

const JOB_END_STATUS = {
    NORMAL: 'normal',
    CANCELLED: 'cancelled',
    TIMEOUT: 'timeout',
};

function Results({ jobStatus, taskStatus, compliant, jobEndStatus, onBackClick, onFileDrop }) {
    const { id: jobId } = useParams();

    const onDrop = useCallback(
        acceptedFiles => {
            onFileDrop(acceptedFiles[0]);
        },
        [onFileDrop]
    );

    const backButton = useMemo(
        () => ({
            label: 'Validate another file',
            onClick: () => onBackClick(),
        }),
        [onBackClick]
    );

    const forwardButton = useMemo(
        () => ({
            label: 'Inspect errors',
            to: AppPages.INSPECT.url(jobId),
            disabled: compliant || jobEndStatus === JOB_END_STATUS.CANCELLED,
        }),
        [compliant, jobEndStatus, jobId]
    );

    const wizardStep = useMemo(
        () => (
            <DropzoneWrapper onFileDrop={onDrop}>
                <WizardStep stepIndex={AppPages.RESULTS.route} className="results">
                    <Summary />
                    <PageNavigation back={backButton} forward={forwardButton} />
                </WizardStep>
            </DropzoneWrapper>
        ),
        [onDrop, backButton, forwardButton]
    );

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }

    if (jobStatus === JOB_STATUS.CANCELLED || taskStatus === TASK_STATUS.CANCELLED) {
        return wizardStep;
    }

    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return wizardStep;
}

Results.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)),
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
    compliant: PropTypes.bool.isRequired,
    jobEndStatus: PropTypes.oneOf(_.values(JOB_END_STATUS)),
    onBackClick: PropTypes.func.isRequired,
    onFileDrop: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        jobStatus: getJobStatus(state),
        taskStatus: getTaskStatus(state),
        compliant: isCompliant(state),
        jobEndStatus: getJobEndStatus(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onBackClick: () => dispatch(reset()),
        onFileDrop: file => dispatch(resetOnFileUpload(file)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Results);
