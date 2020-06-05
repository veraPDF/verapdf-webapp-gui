import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import { reset } from '../../../../store/application/actions';
import WizardStep from '../../wizardStep/WizardStep';
import Summary from './summary/Summary';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import { isCompliant } from '../../../../store/job/result/selectors';

function Results({ jobStatus, taskStatus, compliant, onBackClick }) {
    const { id: jobId } = useParams();
    const history = useHistory();

    const backButton = useMemo(
        () => ({
            label: 'Validate another file',
            onClick: () => onBackClick(history),
        }),
        [history, onBackClick]
    );

    const forwardButton = useMemo(
        () => ({
            label: 'Inspect errors',
            to: AppPages.INSPECT.url(jobId),
            disabled: compliant,
        }),
        [compliant, jobId]
    );

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }
    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <WizardStep stepIndex={AppPages.RESULTS.route} className="results">
            <Summary />
            <PageNavigation back={backButton} forward={forwardButton} />
        </WizardStep>
    );
}

Results.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)).isRequired,
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
    compliant: PropTypes.bool.isRequired,
    onBackClick: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        jobStatus: getJobStatus(state),
        taskStatus: getTaskStatus(state),
        compliant: isCompliant(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onBackClick: history => dispatch(reset(history)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Results);
