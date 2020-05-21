import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';

import Stepper from '../../../shared/stepper/Stepper';
import Summary from './summary/Summary';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import AppPages from '../../../AppPages';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { reset } from '../../../../store/application/actions';

function Results({ jobStatus, taskStatus, onBackClick }) {
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
        }),
        [jobId]
    );

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }
    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <section className="results">
            <Stepper activeStep={AppPages.RESULTS.route} />
            <Summary />
            <PageNavigation back={backButton} forward={forwardButton} />
        </section>
    );
}

Results.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)).isRequired,
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
    onBackClick: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        jobStatus: getJobStatus(state),
        taskStatus: getTaskStatus(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onBackClick: history => dispatch(reset(history)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Results);
