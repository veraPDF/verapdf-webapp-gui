import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import AppPages from '../../../AppPages';
import { validate } from '../../../../store/job/actions';
import { hasFilesAttached } from '../../../../store/pdfFiles/selectors';
import { getUseSettings } from '../../../../store/application/selectors';
import { getJobId } from '../../../../store/job/selectors';
import Dropzone from './dropzone/Dropzone';
import WizardStep from '../../wizardStep/WizardStep';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import SettingsCheckbox from './settingsCheckbox/SettingsCheckbox';

function Upload({ filesAttached, isUseSettings, jobId, onValidateClick }) {
    const forwardButton = useMemo(() => {
        const button = { disabled: !filesAttached };
        if (isUseSettings) {
            return {
                ...button,
                label: 'Configure job',
                to: AppPages.SETTINGS,
            };
        }
        return {
            ...button,
            label: 'Validate',
            onClick: onValidateClick,
        };
    }, [filesAttached, onValidateClick, isUseSettings]);

    if (!isUseSettings && jobId) {
        // Once job is initialized and we know its ID redirect to status page to track its progress
        return <Redirect push to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <WizardStep stepIndex={AppPages.UPLOAD}>
            <Dropzone />
            <PageNavigation back={<SettingsCheckbox />} forward={forwardButton} />
        </WizardStep>
    );
}

Upload.propTypes = {
    jobId: PropTypes.string,
    isUseSettings: PropTypes.bool.isRequired,
    filesAttached: PropTypes.bool.isRequired,
    onValidateClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        filesAttached: hasFilesAttached(state),
        isUseSettings: getUseSettings(state),
        jobId: getJobId(state),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onValidateClick: () => dispatch(validate()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
