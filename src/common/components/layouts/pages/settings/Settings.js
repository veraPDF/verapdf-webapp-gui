import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import AppPages from '../../../AppPages';
import WizardStep from '../../wizardStep/WizardStep';
import ProfileSelect from './profile/ProfileSelect';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import DropzoneWrapper from '../upload/dropzoneWrapper/DropzoneWrapper';
import { getServerGeneralStatus } from '../../../../store/serverInfo/selectors';
import { getJobId } from '../../../../store/job/selectors';
import { validate } from '../../../../store/job/actions';
import { resetOnFileUpload } from '../../../../store/application/actions';
import { JOB_OLD_FILE } from '../../../../store/constants';

import './Settings.scss';

const backButton = {
    label: 'Upload files',
    to: AppPages.UPLOAD,
};

function Settings(props) {
    const { allServicesAvailable, jobId, onValidateClick, onFileDrop } = props;

    const onDrop = useCallback(
        acceptedFiles => {
            onFileDrop(acceptedFiles[0]);
        },
        [onFileDrop]
    );

    const forwardButton = useMemo(
        () => ({
            label: 'Validate',
            disabled: !allServicesAvailable,
            onClick: () => {
                sessionStorage.removeItem(JOB_OLD_FILE);
                onValidateClick();
            },
        }),
        [allServicesAvailable, onValidateClick]
    );

    if (jobId) {
        // Once job is initialized and we know its ID redirect to status page to track its progress
        return <Redirect push to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <DropzoneWrapper onFileDrop={onDrop}>
            <WizardStep stepIndex={AppPages.SETTINGS}>
                <section className="job-settings">
                    <form>
                        <ProfileSelect />
                    </form>
                </section>
                <PageNavigation back={backButton} forward={forwardButton} />
            </WizardStep>
        </DropzoneWrapper>
    );
}

Settings.propTypes = {
    allServicesAvailable: PropTypes.bool.isRequired,
    jobId: PropTypes.string,
    onValidateClick: PropTypes.func.isRequired,
    onFileDrop: PropTypes.func.isRequired,
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
        onFileDrop: file => dispatch(resetOnFileUpload(file)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
