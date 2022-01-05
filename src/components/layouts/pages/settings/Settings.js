import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import AppPages from '../../../AppPages';
import WizardStep from '../../wizardStep/WizardStep';
import ProfileSelect from './profile/ProfileSelect';
import Button from '../../../shared/button/Button';
import LinkButton from '../../../shared/linkButton/LinkButton';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import { getServerGeneralStatus } from '../../../../store/serverInfo/selectors';
import { getJobId } from '../../../../store/job/selectors';
import { validate } from '../../../../store/job/actions';

import './Settings.scss';

function Settings(props) {
    const { allServicesAvailable, jobId, onValidateClick } = props;
    const onForwardClick = useCallback(() => onValidateClick(), [onValidateClick]);

    if (jobId) {
        // Once job is initialized and we know its ID redirect to status page to track its progress
        return <Redirect push to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <WizardStep stepIndex={AppPages.SETTINGS}>
            <section className="job-settings">
                <form>
                    <ProfileSelect />
                </form>
            </section>
            <PageNavigation>
                <LinkButton className="nav-button_back" to={AppPages.UPLOAD} type="back" variant="outlined">
                    Upload files
                </LinkButton>
                <Button
                    className="nav-button_forward"
                    variant="contained"
                    color="primary"
                    disabled={!allServicesAvailable}
                    onClick={onForwardClick}
                >
                    Validate
                </Button>
            </PageNavigation>
        </WizardStep>
    );
}

Settings.propTypes = {
    allServicesAvailable: PropTypes.bool.isRequired,
    jobId: PropTypes.string,
    onValidateClick: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        allServicesAvailable: getServerGeneralStatus(state),
        jobId: getJobId(state),
    };
}

const mapDispatchToProps = dispatch => {
    return {
        onValidateClick: () => dispatch(validate()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
