import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import _ from 'lodash';

import Stepper from '../../../shared/stepper/Stepper';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import AppPages from '../../../AppPages';
import { getJobStatus } from '../../../../store/job/selectors';
import { JOB_STATUS } from '../../../../store/constants';

const backButton = {
    label: 'Validate another file',
    to: AppPages.UPLOAD, // TODO: implement onClick which reset the whole app and then redirect (just like Home link, see TODO in Header component)
};

function Results({ jobStatus }) {
    const { id: jobId } = useParams();
    const forwardButton = {
        label: 'Inspect',
        to: AppPages.INSPECT.url(jobId),
    };
    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }

    return (
        <section className="results">
            <Stepper activeStep={AppPages.RESULTS.route} />
            <PageNavigation back={backButton} forward={forwardButton} />
        </section>
    );
}

Results.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)).isRequired,
};

function mapStateToProps(state) {
    return {
        jobStatus: getJobStatus(state),
    };
}

export default connect(mapStateToProps)(Results);
