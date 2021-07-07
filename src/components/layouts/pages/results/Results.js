import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import { isCompliant } from '../../../../store/job/result/selectors';
import { reset } from '../../../../store/application/actions';
import Button from '../../../shared/button/Button';
import WizardStep from '../../wizardStep/WizardStep';
import Summary from './summary/Summary';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import LinkButton from '../../../shared/linkButton/LinkButton';

function Results({ jobStatus, taskStatus, compliant, resetApp }) {
    const { id: jobId } = useParams();
    const history = useHistory();
    const onBackClick = useCallback(() => resetApp(history), [history, resetApp]);

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }
    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <WizardStep stepIndex={AppPages.RESULTS.route} className="results">
            <Summary />
            <PageNavigation>
                <Button className="nav-button_back" variant="outlined" color="primary" onClick={onBackClick}>
                    Validate another file
                </Button>
                <LinkButton
                    className="nav-button_forward"
                    to={AppPages.INSPECT.url(jobId)}
                    disabled={compliant}
                    variant="contained"
                >
                    Inspect errors
                </LinkButton>
            </PageNavigation>
        </WizardStep>
    );
}

Results.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)),
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
    compliant: PropTypes.bool.isRequired,
    resetApp: PropTypes.func.isRequired,
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
        resetApp: history => dispatch(reset(history)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Results);
