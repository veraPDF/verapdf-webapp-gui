import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getUseSettings } from '../../../../../store/application/selectors';
import { getProfile } from '../../../../../store/job/settings/selectors';
import { getDefaultProfileLabel, getDefaultProfileName } from '../../../../../store/validationProfiles/selectors';
import { toggleUseSettings } from '../../../../../store/application/actions';
import { resetProfile } from '../../../../../store/job/settings/actions';
import Checkbox from '../../../../shared/checkbox/Checkbox';
import Dialog from '../../../../shared/dialog/Dialog';

const CHECK_SETTINGS = 'Use custom validation settings';

function SettingsCheckbox({
    isUseSettings,
    toggleSettings,
    profile,
    defaultProfile,
    defaultProfileLabel,
    resetProfile,
}) {
    const [resetSettingsDialogOpened, setResetSettingsDialogOpened] = useState(false);
    const onSettingsToggle = useCallback(() => {
        if (profile !== defaultProfile && isUseSettings) {
            return setResetSettingsDialogOpened(true);
        }
        return toggleSettings();
    }, [defaultProfile, profile, toggleSettings, isUseSettings]);

    const onResetSettingsClose = useCallback(() => {
        setResetSettingsDialogOpened(false);
    }, []);
    const dialogActions = [
        {
            label: 'Cancel',
            color: 'primary',
            align: 'start',
            onClick: onResetSettingsClose,
        },
        {
            label: 'Reset settings',
            color: 'primary',
            variant: 'contained',
            onClick: () => {
                resetProfile();
                toggleSettings();
                onResetSettingsClose();
            },
        },
    ];

    return (
        <section className="settings-checkbox">
            <Checkbox checked={isUseSettings} label={CHECK_SETTINGS} onChange={onSettingsToggle} />
            <Dialog
                onClose={onResetSettingsClose}
                open={resetSettingsDialogOpened}
                actions={dialogActions}
                title={`You are about to reset profile to default ${defaultProfileLabel}.`}
            >
                Proceed?
            </Dialog>
        </section>
    );
}

SettingsCheckbox.propTypes = {
    isUseSettings: PropTypes.bool.isRequired,
    profile: PropTypes.string,
    defaultProfile: PropTypes.string,
    defaultProfileLabel: PropTypes.string,
    toggleSettings: PropTypes.func.isRequired,
    resetProfile: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        isUseSettings: getUseSettings(state),
        profile: getProfile(state),
        defaultProfile: getDefaultProfileName(state),
        defaultProfileLabel: getDefaultProfileLabel(state),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleSettings: () => dispatch(toggleUseSettings()),
        resetProfile: () => dispatch(resetProfile()),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsCheckbox);
