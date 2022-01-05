import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useHistory } from 'react-router-dom';

import AppPages from '../../../AppPages';
import { validate } from '../../../../store/job/actions';
import { hasFilesAttached } from '../../../../store/pdfFiles/selectors';
import { getUseSettings } from '../../../../store/application/selectors';
import { getJobId } from '../../../../store/job/selectors';
import Dropzone from './dropzone/Dropzone';
import WizardStep from '../../wizardStep/WizardStep';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import SettingsCheckbox from './settingsCheckbox/SettingsCheckbox';
import Button from '../../../shared/button/Button';

function Upload({ filesAttached, isUseSettings, jobId, onValidateClick }) {
    const history = useHistory();
    const forwardLabel = useMemo(() => (isUseSettings ? 'Configure' : 'Validate'), [isUseSettings]);
    const onForwardClick = useMemo(() => {
        if (isUseSettings) {
            return () => history.push(AppPages.SETTINGS);
        }

        return onValidateClick;
    }, [history, isUseSettings, onValidateClick]);

    if (!isUseSettings && jobId) {
        // Once job is initialized and we know its ID redirect to status page to track its progress
        return <Redirect push to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <WizardStep stepIndex={AppPages.UPLOAD}>
            <Dropzone />
            <PageNavigation>
                <SettingsCheckbox />
                <Button
                    className="nav-button_forward"
                    variant="contained"
                    color="primary"
                    disabled={!filesAttached}
                    onClick={onForwardClick}
                >
                    {forwardLabel}
                </Button>
            </PageNavigation>
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
